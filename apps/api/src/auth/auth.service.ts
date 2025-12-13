import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { LoginDto, RegisterDto, AuthResponse } from './dto/auth.dto';
import { JwtPayload, UserRole } from './strategies/jwt.strategy';
import { db } from '../database/client';
import { users, tenants } from '../database/schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.findUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Allow 'active' and 'pending' users to login
    // 'pending' users will see a waiting page until associated with a tenant
    if (user.status !== 'active' && user.status !== 'pending') {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get tenant name if user has a tenantId
    let tenantName: string | null = null;
    if (user.tenantId) {
      const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, user.tenantId),
      });
      tenantName = tenant?.name || null;
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        tenantId: user.tenantId,
        tenantName,
      },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.findUserByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Determine role based on userType
    // owner -> 'owner' role (copropriétaire)
    // manager -> 'manager' role (gestionnaire)
    const role = dto.userType === 'owner' ? 'owner' : 'manager';

    // Create the user WITHOUT a tenant - will be associated later by platform admin
    const [newUser] = await db.insert(users).values({
      tenantId: null, // No tenant yet - pending association
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role, // 'owner' or 'manager' based on userType
      status: 'pending', // Pending until associated with a syndic/copropriété
    }).returning();

    const payload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role as UserRole,
      tenantId: newUser.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User ${newUser.email} registered successfully (pending association)`);

    return {
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role as UserRole,
        tenantId: newUser.tenantId,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<JwtPayload | null> {
    // Validate user still exists and is active
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });

    if (!user || user.status !== 'active') {
      return null;
    }

    return payload;
  }

  private async findUserByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }
}
