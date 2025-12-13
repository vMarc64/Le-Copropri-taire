import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../database';
import { users, lots, condominiums, sepaMandates, payments, ownerCondominiums } from '../database/schema';
import { eq, and, sql, isNull, or, ilike, inArray } from 'drizzle-orm';

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

        // Get direct condominium associations
        const directCondos = await db
          .select({
            condominiumId: ownerCondominiums.condominiumId,
            condominiumName: condominiums.name,
          })
          .from(ownerCondominiums)
          .leftJoin(condominiums, eq(ownerCondominiums.condominiumId, condominiums.id))
          .where(eq(ownerCondominiums.ownerId, owner.id));

        // Get unique condominiums (from lots + direct associations)
        const condosFromLots = ownerLots.map((l) => l.condominiumName).filter(Boolean);
        const condosFromDirect = directCondos.map((c) => c.condominiumName).filter(Boolean);
        const condominiumsList = [...new Set([...condosFromLots, ...condosFromDirect])];

        // Get condominium IDs for the response
        const condoIdsFromLots = ownerLots.map((l) => l.condominiumId).filter(Boolean);
        const condoIdsFromDirect = directCondos.map((c) => c.condominiumId).filter(Boolean);
        const condominiumIds = [...new Set([...condoIdsFromLots, ...condoIdsFromDirect])];

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
          condominiumIds: condominiumIds,
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
   * Search for orphan owners (owners without a tenantId)
   * Matches by: firstName + lastName OR phone OR email
   */
  async searchOrphanOwners(query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim();
    const searchPattern = `%${searchTerm}%`;

    // Search orphan owners (no tenantId) by name, phone, or email
    const orphanOwners = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        and(
          eq(users.role, 'owner'),
          isNull(users.tenantId),
          or(
            // Match firstName + lastName combination
            sql`CONCAT(${users.firstName}, ' ', ${users.lastName}) ILIKE ${searchPattern}`,
            // Match email
            ilike(users.email, searchPattern),
            // Match firstName alone
            ilike(users.firstName, searchPattern),
            // Match lastName alone
            ilike(users.lastName, searchPattern)
          )
        )
      )
      .limit(20);

    return orphanOwners;
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

  /**
   * Get condominiums associated with an owner
   */
  async getOwnerCondominiums(ownerId: string, tenantId: string) {
    // Check owner exists and belongs to tenant
    const [owner] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, ownerId), eq(users.tenantId, tenantId), eq(users.role, 'owner')))
      .limit(1);

    if (!owner) {
      throw new NotFoundException('Propriétaire non trouvé');
    }

    // Get direct associations
    const associations = await db
      .select({
        id: ownerCondominiums.id,
        condominiumId: ownerCondominiums.condominiumId,
        condominiumName: condominiums.name,
      })
      .from(ownerCondominiums)
      .leftJoin(condominiums, eq(ownerCondominiums.condominiumId, condominiums.id))
      .where(and(
        eq(ownerCondominiums.ownerId, ownerId),
        eq(ownerCondominiums.tenantId, tenantId)
      ));

    return associations;
  }

  /**
   * Update owner's condominium associations
   */
  async updateOwnerCondominiums(ownerId: string, condominiumIds: string[], tenantId: string) {
    // Check owner exists and belongs to tenant
    const [owner] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, ownerId), eq(users.tenantId, tenantId), eq(users.role, 'owner')))
      .limit(1);

    if (!owner) {
      throw new NotFoundException('Propriétaire non trouvé');
    }

    // Verify all condominiums belong to tenant
    if (condominiumIds.length > 0) {
      const validCondos = await db
        .select({ id: condominiums.id })
        .from(condominiums)
        .where(and(
          eq(condominiums.tenantId, tenantId),
          inArray(condominiums.id, condominiumIds)
        ));

      if (validCondos.length !== condominiumIds.length) {
        throw new BadRequestException('Une ou plusieurs copropriétés sont invalides');
      }
    }

    // Delete existing associations
    await db
      .delete(ownerCondominiums)
      .where(and(
        eq(ownerCondominiums.ownerId, ownerId),
        eq(ownerCondominiums.tenantId, tenantId)
      ));

    // Insert new associations
    if (condominiumIds.length > 0) {
      await db.insert(ownerCondominiums).values(
        condominiumIds.map((condoId) => ({
          tenantId,
          ownerId,
          condominiumId: condoId,
        }))
      );
    }

    return { success: true, count: condominiumIds.length };
  }

  /**
   * Add a single condominium to an owner
   */
  async addCondominiumToOwner(ownerId: string, condominiumId: string, tenantId: string) {
    // Check owner exists and belongs to tenant
    const [owner] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, ownerId), eq(users.tenantId, tenantId), eq(users.role, 'owner')))
      .limit(1);

    if (!owner) {
      throw new NotFoundException('Propriétaire non trouvé');
    }

    // Check condominium exists and belongs to tenant
    const [condo] = await db
      .select()
      .from(condominiums)
      .where(and(eq(condominiums.id, condominiumId), eq(condominiums.tenantId, tenantId)))
      .limit(1);

    if (!condo) {
      throw new NotFoundException('Copropriété non trouvée');
    }

    // Check if association already exists
    const [existing] = await db
      .select()
      .from(ownerCondominiums)
      .where(and(
        eq(ownerCondominiums.ownerId, ownerId),
        eq(ownerCondominiums.condominiumId, condominiumId),
        eq(ownerCondominiums.tenantId, tenantId)
      ))
      .limit(1);

    if (existing) {
      return { success: true, message: 'Association déjà existante' };
    }

    // Create association
    await db.insert(ownerCondominiums).values({
      tenantId,
      ownerId,
      condominiumId,
    });

    return { success: true, message: 'Copropriété associée' };
  }

  /**
   * Remove a condominium from an owner
   */
  async removeCondominiumFromOwner(ownerId: string, condominiumId: string, tenantId: string) {
    // Delete association
    const result = await db
      .delete(ownerCondominiums)
      .where(and(
        eq(ownerCondominiums.ownerId, ownerId),
        eq(ownerCondominiums.condominiumId, condominiumId),
        eq(ownerCondominiums.tenantId, tenantId)
      ));

    return { success: true };
  }

  /**
   * Get available lots for an owner (lots from their condominiums that are not assigned to another owner)
   */
  async getAvailableLots(ownerId: string, tenantId: string) {
    // Get owner's condominiums (from both direct associations and lots)
    const directCondos = await db
      .select({ condominiumId: ownerCondominiums.condominiumId })
      .from(ownerCondominiums)
      .where(and(
        eq(ownerCondominiums.ownerId, ownerId),
        eq(ownerCondominiums.tenantId, tenantId)
      ));

    const lotsCondos = await db
      .select({ condominiumId: lots.condominiumId })
      .from(lots)
      .where(and(
        eq(lots.ownerId, ownerId),
        eq(lots.tenantId, tenantId)
      ));

    const condominiumIds = [...new Set([
      ...directCondos.map(c => c.condominiumId),
      ...lotsCondos.map(l => l.condominiumId)
    ])];

    if (condominiumIds.length === 0) {
      return [];
    }

    // Get all lots from these condominiums that are either:
    // - Not assigned to any owner (ownerId is null)
    // - Already assigned to this owner
    const availableLots = await db
      .select({
        id: lots.id,
        reference: lots.reference,
        type: lots.type,
        floor: lots.floor,
        surface: lots.surface,
        tantiemes: lots.tantiemes,
        condominiumId: lots.condominiumId,
        condominiumName: condominiums.name,
        ownerId: lots.ownerId,
      })
      .from(lots)
      .leftJoin(condominiums, eq(lots.condominiumId, condominiums.id))
      .where(and(
        eq(lots.tenantId, tenantId),
        inArray(lots.condominiumId, condominiumIds),
        or(
          isNull(lots.ownerId),
          eq(lots.ownerId, ownerId)
        )
      ));

    return availableLots.map(lot => ({
      ...lot,
      isAssigned: lot.ownerId === ownerId,
    }));
  }

  /**
   * Get lots assigned to an owner
   */
  async getOwnerLots(ownerId: string, tenantId: string) {
    const ownerLots = await db
      .select({
        id: lots.id,
        reference: lots.reference,
        type: lots.type,
        condominiumId: lots.condominiumId,
        condominiumName: condominiums.name,
      })
      .from(lots)
      .leftJoin(condominiums, eq(lots.condominiumId, condominiums.id))
      .where(and(
        eq(lots.ownerId, ownerId),
        eq(lots.tenantId, tenantId)
      ));

    return ownerLots;
  }

  /**
   * Update lots assigned to an owner
   */
  async updateOwnerLots(ownerId: string, lotIds: string[], tenantId: string) {
    // Get owner's condominiums
    const directCondos = await db
      .select({ condominiumId: ownerCondominiums.condominiumId })
      .from(ownerCondominiums)
      .where(and(
        eq(ownerCondominiums.ownerId, ownerId),
        eq(ownerCondominiums.tenantId, tenantId)
      ));

    const lotsCondos = await db
      .select({ condominiumId: lots.condominiumId })
      .from(lots)
      .where(and(
        eq(lots.ownerId, ownerId),
        eq(lots.tenantId, tenantId)
      ));

    const condominiumIds = [...new Set([
      ...directCondos.map(c => c.condominiumId),
      ...lotsCondos.map(l => l.condominiumId)
    ])];

    // Remove current lots from this owner (within their condominiums)
    if (condominiumIds.length > 0) {
      await db
        .update(lots)
        .set({ ownerId: null })
        .where(and(
          eq(lots.ownerId, ownerId),
          eq(lots.tenantId, tenantId),
          inArray(lots.condominiumId, condominiumIds)
        ));
    }

    // Assign new lots to this owner
    if (lotIds.length > 0) {
      // Verify lots exist and are in owner's condominiums
      const validLots = await db
        .select({ id: lots.id })
        .from(lots)
        .where(and(
          eq(lots.tenantId, tenantId),
          inArray(lots.id, lotIds),
          inArray(lots.condominiumId, condominiumIds),
          or(isNull(lots.ownerId), eq(lots.ownerId, ownerId))
        ));

      const validLotIds = validLots.map(l => l.id);

      if (validLotIds.length > 0) {
        await db
          .update(lots)
          .set({ ownerId: ownerId })
          .where(inArray(lots.id, validLotIds));
      }
    }

    return { success: true, message: 'Lots mis à jour' };
  }
}
