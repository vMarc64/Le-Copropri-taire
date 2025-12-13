import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../database';
import { users, lots, condominiums, sepaMandates, payments } from '../database/schema';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class OwnersService {
  async findAll(tenantId: string) {
    // Get all users with role 'owner' for this tenant
    const ownersData = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        status: users.status,
      })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.role, 'owner')));

    // For each owner, get their lots, condominiums, balance, and SEPA mandate status
    const ownersWithDetails = await Promise.all(
      ownersData.map(async (owner) => {
        // Get lots for this owner
        const ownerLots = await db
          .select({
            reference: lots.reference,
            condominiumId: lots.condominiumId,
            condominiumName: condominiums.name,
          })
          .from(lots)
          .leftJoin(condominiums, eq(lots.condominiumId, condominiums.id))
          .where(eq(lots.ownerId, owner.id));

        // Get unique condominiums
        const condominiumsList = [
          ...new Set(ownerLots.map((l) => l.condominiumName).filter(Boolean)),
        ];

        // Get balance (sum of pending payments)
        const balanceResult = await db
          .select({
            balance: sql<number>`COALESCE(SUM(${payments.amount} - COALESCE(${payments.paidAmount}, 0)), 0)`,
          })
          .from(payments)
          .where(
            and(
              eq(payments.ownerId, owner.id),
              sql`${payments.status} IN ('pending', 'partial', 'overdue')`
            )
          );

        // Check for active SEPA mandate
        const mandateResult = await db
          .select({ id: sepaMandates.id })
          .from(sepaMandates)
          .where(and(eq(sepaMandates.ownerId, owner.id), eq(sepaMandates.status, 'active')))
          .limit(1);

        return {
          id: owner.id,
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email,
          phone: '', // TODO: Add phone field to users table
          status: owner.status,
          condominiums: condominiumsList,
          lots: ownerLots.map((l) => l.reference),
          balance: -(balanceResult[0]?.balance || 0), // Negative means they owe money
          hasSepaMandateActive: mandateResult.length > 0,
        };
      })
    );

    return ownersWithDetails;
  }

  async findOne(id: string, tenantId: string) {
    const owner = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId), eq(users.role, 'owner')))
      .limit(1);

    return owner[0] || null;
  }

  /**
   * Associate an orphan owner to a syndic
   */
  async associateToSyndic(ownerId: string, tenantId: string) {
    // Find the owner
    const [owner] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, ownerId), eq(users.role, 'owner')))
      .limit(1);

    if (!owner) {
      throw new NotFoundException('Propriétaire non trouvé');
    }

    if (owner.tenantId) {
      throw new BadRequestException('Ce propriétaire est déjà associé à un syndic');
    }

    // Associate owner to syndic
    await db
      .update(users)
      .set({
        tenantId: tenantId,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(users.id, ownerId));

    // Return updated owner
    const [updatedOwner] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        status: users.status,
        tenantId: users.tenantId,
      })
      .from(users)
      .where(eq(users.id, ownerId))
      .limit(1);

    return updatedOwner;
  }
}
