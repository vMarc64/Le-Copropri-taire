import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { eq, sql, desc, asc, ilike, and, count } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { db } from '../database';
import { tenants, users, condominiums } from '../database/schema';
import { 
  CreateSyndicDto, 
  UpdateSyndicDto, 
  SyndicResponseDto, 
  SyndicListResponseDto, 
  SyndicDetailResponseDto,
  CreateManagerDto,
  ManagerResponseDto,
  ManagerListResponseDto,
} from './dto';

@Injectable()
export class PlatformService {
  private readonly logger = new Logger(PlatformService.name);

  /**
   * Get all syndics with pagination and filtering
   */
  async findAllSyndics(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<SyndicListResponseDto> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (search) {
      conditions.push(
        sql`(${tenants.name} ILIKE ${'%' + search + '%'} OR ${tenants.email} ILIKE ${'%' + search + '%'})`
      );
    }
    if (status) {
      conditions.push(eq(tenants.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get syndics with counts
    const syndicsList = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        email: tenants.email,
        status: tenants.status,
        createdAt: tenants.createdAt,
        updatedAt: tenants.updatedAt,
      })
      .from(tenants)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(tenants.createdAt) : asc(tenants.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(tenants)
      .where(whereClause);

    // Get counts for each syndic
    const syndicsWithCounts = await Promise.all(
      syndicsList.map(async (syndic) => {
        const [managersResult] = await db
          .select({ count: count() })
          .from(users)
          .where(and(eq(users.tenantId, syndic.id), eq(users.role, 'manager')));

        const [condosResult] = await db
          .select({ count: count() })
          .from(condominiums)
          .where(eq(condominiums.tenantId, syndic.id));

        const [ownersResult] = await db
          .select({ count: count() })
          .from(users)
          .where(and(eq(users.tenantId, syndic.id), eq(users.role, 'owner')));

        return {
          ...syndic,
          managersCount: managersResult?.count || 0,
          condominiumsCount: condosResult?.count || 0,
          ownersCount: ownersResult?.count || 0,
        };
      })
    );

    return {
      data: syndicsWithCounts,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single syndic by ID with detailed info
   */
  async findOneSyndic(id: string): Promise<SyndicDetailResponseDto> {
    const [syndic] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    if (!syndic) {
      throw new NotFoundException(`Syndic with ID ${id} not found`);
    }

    // Get managers
    const managers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        status: users.status,
      })
      .from(users)
      .where(and(eq(users.tenantId, id), eq(users.role, 'manager')));

    // Get condominiums
    const condos = await db
      .select({
        id: condominiums.id,
        name: condominiums.name,
        address: condominiums.address,
        city: condominiums.city,
      })
      .from(condominiums)
      .where(eq(condominiums.tenantId, id));

    // Get counts
    const [ownersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, id), eq(users.role, 'owner')));

    return {
      ...syndic,
      managersCount: managers.length,
      condominiumsCount: condos.length,
      ownersCount: ownersResult?.count || 0,
      managers,
      condominiums: condos,
    };
  }

  /**
   * Create a new syndic
   */
  async createSyndic(dto: CreateSyndicDto): Promise<SyndicResponseDto> {
    // Check if email already exists
    const [existing] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.email, dto.email))
      .limit(1);

    if (existing) {
      throw new ConflictException(`A syndic with email ${dto.email} already exists`);
    }

    const [created] = await db
      .insert(tenants)
      .values({
        name: dto.name,
        email: dto.email,
        status: 'active',
      })
      .returning();

    this.logger.log(`Created syndic: ${created.id} - ${created.name}`);

    return {
      ...created,
      managersCount: 0,
      condominiumsCount: 0,
      ownersCount: 0,
    };
  }

  /**
   * Update a syndic
   */
  async updateSyndic(id: string, dto: UpdateSyndicDto): Promise<SyndicResponseDto> {
    // Check syndic exists
    const [existing] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Syndic with ID ${id} not found`);
    }

    // If email is being changed, check it's not taken
    if (dto.email && dto.email !== existing.email) {
      const [emailTaken] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.email, dto.email))
        .limit(1);

      if (emailTaken) {
        throw new ConflictException(`A syndic with email ${dto.email} already exists`);
      }
    }

    const [updated] = await db
      .update(tenants)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, id))
      .returning();

    this.logger.log(`Updated syndic: ${updated.id} - ${updated.name}`);

    // Get counts
    const [managersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, id), eq(users.role, 'manager')));

    const [condosResult] = await db
      .select({ count: count() })
      .from(condominiums)
      .where(eq(condominiums.tenantId, id));

    const [ownersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, id), eq(users.role, 'owner')));

    return {
      ...updated,
      managersCount: managersResult?.count || 0,
      condominiumsCount: condosResult?.count || 0,
      ownersCount: ownersResult?.count || 0,
    };
  }

  /**
   * Soft delete a syndic (set status to suspended)
   */
  async deleteSyndic(id: string): Promise<{ message: string }> {
    const [existing] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Syndic with ID ${id} not found`);
    }

    await db
      .update(tenants)
      .set({
        status: 'suspended',
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, id));

    this.logger.log(`Soft deleted (suspended) syndic: ${id}`);

    return { message: `Syndic ${id} has been suspended` };
  }

  /**
   * Get platform stats for dashboard
   */
  async getPlatformStats() {
    const [syndicsCount] = await db
      .select({ count: count() })
      .from(tenants)
      .where(eq(tenants.status, 'active'));

    const [usersCount] = await db
      .select({ count: count() })
      .from(users);

    const [condominiumsCount] = await db
      .select({ count: count() })
      .from(condominiums);

    const [ownersCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'owner'));

    return {
      syndics: syndicsCount?.count || 0,
      users: usersCount?.count || 0,
      condominiums: condominiumsCount?.count || 0,
      owners: ownersCount?.count || 0,
    };
  }

  // ==========================================================================
  // MANAGERS MANAGEMENT
  // ==========================================================================

  /**
   * Get all managers of a syndic
   */
  async findManagersBySyndic(syndicId: string): Promise<ManagerListResponseDto> {
    // Check syndic exists
    const [syndic] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, syndicId))
      .limit(1);

    if (!syndic) {
      throw new NotFoundException(`Syndic with ID ${syndicId} not found`);
    }

    const managers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(and(eq(users.tenantId, syndicId), eq(users.role, 'manager')))
      .orderBy(desc(users.createdAt));

    return {
      data: managers,
      total: managers.length,
    };
  }

  /**
   * Create a manager for a syndic (invite)
   */
  async createManager(syndicId: string, dto: CreateManagerDto): Promise<ManagerResponseDto> {
    // Check syndic exists
    const [syndic] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, syndicId))
      .limit(1);

    if (!syndic) {
      throw new NotFoundException(`Syndic with ID ${syndicId} not found`);
    }

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existingUser) {
      throw new ConflictException(`A user with email ${dto.email} already exists`);
    }

    // Generate a temporary password (in production, send email with reset link)
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const [created] = await db
      .insert(users)
      .values({
        tenantId: syndicId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        role: 'manager',
        status: 'pending', // Pending until they set their password
      })
      .returning();

    this.logger.log(`Created manager ${created.id} for syndic ${syndicId}`);
    // TODO: Send invitation email with password reset link

    return {
      id: created.id,
      firstName: created.firstName,
      lastName: created.lastName,
      email: created.email,
      role: created.role,
      status: created.status,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  /**
   * Delete (revoke) a manager from a syndic
   */
  async deleteManager(syndicId: string, managerId: string): Promise<{ message: string }> {
    // Check syndic exists
    const [syndic] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, syndicId))
      .limit(1);

    if (!syndic) {
      throw new NotFoundException(`Syndic with ID ${syndicId} not found`);
    }

    // Check manager exists and belongs to syndic
    const [manager] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, managerId),
        eq(users.tenantId, syndicId),
        eq(users.role, 'manager')
      ))
      .limit(1);

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found in syndic ${syndicId}`);
    }

    // Check if this is the last manager
    const [{ count: managerCount }] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, syndicId), eq(users.role, 'manager')));

    if (managerCount <= 1) {
      throw new BadRequestException('Cannot delete the last manager of a syndic');
    }

    // Soft delete: set status to 'suspended'
    await db
      .update(users)
      .set({
        status: 'suspended',
        updatedAt: new Date(),
      })
      .where(eq(users.id, managerId));

    this.logger.log(`Revoked manager ${managerId} from syndic ${syndicId}`);

    return { message: `Manager ${managerId} has been revoked` };
  }

  // ==========================================================================
  // PENDING USERS MANAGEMENT
  // ==========================================================================

  /**
   * Get all pending users (not associated with any syndic)
   */
  async findPendingUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
    } = options;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [
      eq(users.status, 'pending'),
      sql`${users.tenantId} IS NULL`,
    ];

    if (search) {
      conditions.push(
        sql`(${users.firstName} ILIKE ${'%' + search + '%'} OR ${users.lastName} ILIKE ${'%' + search + '%'} OR ${users.email} ILIKE ${'%' + search + '%'})`
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    // Get total count
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions));

    // Get users
    const pendingUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: pendingUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Associate a pending user with a syndic
   */
  async associateUserToSyndic(userId: string, syndicId: string) {
    // Check user exists and is pending
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.status !== 'pending') {
      throw new BadRequestException(`User is not in pending status`);
    }

    if (user.tenantId) {
      throw new BadRequestException(`User is already associated with a syndic`);
    }

    // Check syndic exists
    const [syndic] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, syndicId))
      .limit(1);

    if (!syndic) {
      throw new NotFoundException(`Syndic with ID ${syndicId} not found`);
    }

    // Associate user to syndic and activate
    await db
      .update(users)
      .set({
        tenantId: syndicId,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    this.logger.log(`Associated user ${userId} to syndic ${syndicId}`);

    // Return updated user with syndic info
    const [updatedUser] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        status: users.status,
        tenantId: users.tenantId,
        syndicName: tenants.name,
      })
      .from(users)
      .leftJoin(tenants, eq(users.tenantId, tenants.id))
      .where(eq(users.id, userId))
      .limit(1);

    return updatedUser;
  }
}
