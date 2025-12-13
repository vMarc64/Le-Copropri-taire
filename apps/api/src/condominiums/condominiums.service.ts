import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/client';
import { condominiums, lots, users, payments, ownerCondominiums, sepaMandates } from '../database/schema';
import { eq, and, count, sum, sql, inArray, or, isNull } from 'drizzle-orm';
import { CreateCondominiumDto, CreateLotDto } from './dto';

@Injectable()
export class CondominiumsService {
  async create(tenantId: string, data: CreateCondominiumDto) {
    const [newCondominium] = await db
      .insert(condominiums)
      .values({
        tenantId,
        name: data.name,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        siret: data.siret,
        sepaEnabled: data.sepaEnabled ?? false,
      })
      .returning();

    return newCondominium;
  }

  async findAll(tenantId: string) {
    const results = await db
      .select({
        id: condominiums.id,
        name: condominiums.name,
        address: condominiums.address,
        city: condominiums.city,
        postalCode: condominiums.postalCode,
        sepaEnabled: condominiums.sepaEnabled,
        createdAt: condominiums.createdAt,
      })
      .from(condominiums)
      .where(eq(condominiums.tenantId, tenantId));

    // Get lots and owners count for each condominium
    const condosWithStats = await Promise.all(
      results.map(async (condo) => {
        // Count lots
        const [lotsResult] = await db
          .select({ count: count() })
          .from(lots)
          .where(eq(lots.condominiumId, condo.id));

        // Count unique owners from lots
        const [ownersFromLots] = await db
          .select({ count: count(sql`DISTINCT ${lots.ownerId}`) })
          .from(lots)
          .where(and(eq(lots.condominiumId, condo.id), sql`${lots.ownerId} IS NOT NULL`));

        // Count unique owners from direct associations
        const [ownersFromAssociations] = await db
          .select({ count: count(sql`DISTINCT ${ownerCondominiums.ownerId}`) })
          .from(ownerCondominiums)
          .where(eq(ownerCondominiums.condominiumId, condo.id));

        // Combine unique owners from both sources
        const totalOwnersResult = await db
          .select({ count: count() })
          .from(
            sql`(
              SELECT DISTINCT owner_id FROM lots WHERE condominium_id = ${condo.id} AND owner_id IS NOT NULL
              UNION
              SELECT DISTINCT owner_id FROM owner_condominiums WHERE condominium_id = ${condo.id}
            ) AS unique_owners`
          );

        // Calculate balance from payments
        const [balanceResult] = await db
          .select({ balance: sum(payments.amount) })
          .from(payments)
          .where(and(
            eq(payments.condominiumId, condo.id),
            eq(payments.status, 'completed')
          ));

        return {
          ...condo,
          lots: lotsResult?.count || 0,
          owners: totalOwnersResult[0]?.count || 0,
          balance: parseFloat(balanceResult?.balance?.toString() || '0'),
        };
      })
    );

    return condosWithStats;
  }

  async findOne(id: string, tenantId: string) {
    const [condo] = await db
      .select()
      .from(condominiums)
      .where(and(eq(condominiums.id, id), eq(condominiums.tenantId, tenantId)));

    if (!condo) {
      return null;
    }

    // Get stats
    const [lotsResult] = await db
      .select({ count: count() })
      .from(lots)
      .where(eq(lots.condominiumId, id));

    // Combine unique owners from both lots and ownerCondominiums
    const totalOwnersResult = await db
      .select({ count: count() })
      .from(
        sql`(
          SELECT DISTINCT owner_id FROM lots WHERE condominium_id = ${id} AND owner_id IS NOT NULL
          UNION
          SELECT DISTINCT owner_id FROM owner_condominiums WHERE condominium_id = ${id}
        ) AS unique_owners`
      );

    const [balanceResult] = await db
      .select({ balance: sum(payments.amount) })
      .from(payments)
      .where(and(
        eq(payments.condominiumId, id),
        eq(payments.status, 'completed')
      ));

    return {
      ...condo,
      lots: lotsResult?.count || 0,
      owners: totalOwnersResult[0]?.count || 0,
      balance: parseFloat(balanceResult?.balance?.toString() || '0'),
    };
  }

  async getOwners(condominiumId: string, tenantId: string) {
    // Get owners from lots table
    const ownersFromLots = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        status: users.status,
      })
      .from(lots)
      .innerJoin(users, eq(lots.ownerId, users.id))
      .where(and(
        eq(lots.condominiumId, condominiumId),
        eq(lots.tenantId, tenantId),
        sql`${lots.ownerId} IS NOT NULL`
      ));

    // Get owners from direct associations
    const ownersFromAssociations = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        status: users.status,
      })
      .from(ownerCondominiums)
      .innerJoin(users, eq(ownerCondominiums.ownerId, users.id))
      .where(and(
        eq(ownerCondominiums.condominiumId, condominiumId),
        eq(ownerCondominiums.tenantId, tenantId)
      ));

    // Merge and deduplicate
    const allOwners = [...ownersFromLots, ...ownersFromAssociations];
    const uniqueOwners = Array.from(
      new Map(allOwners.map(owner => [owner.id, owner])).values()
    );

    // Get additional data for each owner
    const ownersWithDetails = await Promise.all(
      uniqueOwners.map(async (owner) => {
        // Get lots for this owner in this condominium
        const ownerLots = await db
          .select({ id: lots.id, reference: lots.reference, tantiemes: lots.tantiemes })
          .from(lots)
          .where(and(
            eq(lots.condominiumId, condominiumId),
            eq(lots.ownerId, owner.id)
          ));

        // Get SEPA mandate status
        const [mandate] = await db
          .select({ id: sepaMandates.id })
          .from(sepaMandates)
          .where(and(
            eq(sepaMandates.ownerId, owner.id),
            eq(sepaMandates.status, 'active')
          ))
          .limit(1);

        // Get balance from payments
        const [balanceResult] = await db
          .select({ balance: sum(payments.amount) })
          .from(payments)
          .where(and(
            eq(payments.condominiumId, condominiumId),
            eq(payments.ownerId, owner.id),
            eq(payments.status, 'completed')
          ));

        const totalTantiemes = ownerLots.reduce((acc, lot) => acc + (lot.tantiemes || 0), 0);
        const balanceValue = parseFloat(balanceResult?.balance?.toString() || '0');

        return {
          id: owner.id,
          name: `${owner.firstName} ${owner.lastName}`,
          email: owner.email,
          phone: '',
          lots: ownerLots.map(l => l.reference),
          lotIds: ownerLots.map(l => l.id),
          tantiemes: totalTantiemes,
          balance: balanceValue,
          status: balanceValue < 0 ? 'overdue' : 'up-to-date',
          sepaMandate: !!mandate,
        };
      })
    );

    return ownersWithDetails;
  }

  /**
   * Get available lots for a condominium (lots that are not assigned to any owner OR assigned to specified owner)
   */
  async getAvailableLots(condominiumId: string, tenantId: string, forOwnerId?: string) {
    const availableLots = await db
      .select({
        id: lots.id,
        reference: lots.reference,
        type: lots.type,
        floor: lots.floor,
        surface: lots.surface,
        tantiemes: lots.tantiemes,
        ownerId: lots.ownerId,
      })
      .from(lots)
      .where(and(
        eq(lots.condominiumId, condominiumId),
        eq(lots.tenantId, tenantId),
        forOwnerId 
          ? or(isNull(lots.ownerId), eq(lots.ownerId, forOwnerId))
          : isNull(lots.ownerId)
      ));

    return availableLots.map(lot => ({
      ...lot,
      isAssigned: forOwnerId ? lot.ownerId === forOwnerId : false,
    }));
  }

  /**
   * Update lots assigned to an owner within a specific condominium
   */
  async updateOwnerLotsInCondominium(
    condominiumId: string,
    ownerId: string,
    lotIds: string[],
    tenantId: string
  ) {
    // Remove current lots from this owner in this condominium
    await db
      .update(lots)
      .set({ ownerId: null })
      .where(and(
        eq(lots.condominiumId, condominiumId),
        eq(lots.ownerId, ownerId),
        eq(lots.tenantId, tenantId)
      ));

    // Assign new lots to this owner
    if (lotIds.length > 0) {
      // Verify lots exist and are in this condominium
      const validLots = await db
        .select({ id: lots.id })
        .from(lots)
        .where(and(
          eq(lots.tenantId, tenantId),
          eq(lots.condominiumId, condominiumId),
          inArray(lots.id, lotIds),
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

    return { success: true };
  }

  /**
   * Create a new lot in a condominium
   */
  async createLot(condominiumId: string, tenantId: string, data: CreateLotDto) {
    // Verify the condominium exists and belongs to the tenant
    const [condo] = await db
      .select({ id: condominiums.id })
      .from(condominiums)
      .where(and(
        eq(condominiums.id, condominiumId),
        eq(condominiums.tenantId, tenantId)
      ));

    if (!condo) {
      throw new NotFoundException('Copropriété non trouvée');
    }

    const [newLot] = await db
      .insert(lots)
      .values({
        tenantId,
        condominiumId,
        reference: data.reference,
        type: data.type,
        floor: data.floor,
        surface: data.surface?.toString(),
        tantiemes: data.tantiemes,
        ownerId: data.ownerId || null,
      })
      .returning();

    return newLot;
  }
}
