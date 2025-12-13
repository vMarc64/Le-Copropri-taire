import { Injectable } from '@nestjs/common';
import { db } from '../database/client';
import { condominiums, lots, users, payments } from '../database/schema';
import { eq, and, count, sum, sql } from 'drizzle-orm';

@Injectable()
export class CondominiumsService {
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

        // Count unique owners
        const [ownersResult] = await db
          .select({ count: count(sql`DISTINCT ${lots.ownerId}`) })
          .from(lots)
          .where(and(eq(lots.condominiumId, condo.id), sql`${lots.ownerId} IS NOT NULL`));

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
          owners: ownersResult?.count || 0,
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

    const [ownersResult] = await db
      .select({ count: count(sql`DISTINCT ${lots.ownerId}`) })
      .from(lots)
      .where(and(eq(lots.condominiumId, id), sql`${lots.ownerId} IS NOT NULL`));

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
      owners: ownersResult?.count || 0,
      balance: parseFloat(balanceResult?.balance?.toString() || '0'),
    };
  }
}
