import { Injectable } from '@nestjs/common';
import { db } from '../database/client';
import { condominiums, payments, lots, users } from '../database/schema';
import { eq, and, lt, count, sum, sql } from 'drizzle-orm';

@Injectable()
export class DashboardService {
  async getStats(tenantId: string) {
    // Get late payments count
    const [latePaymentsResult] = await db
      .select({ count: count() })
      .from(payments)
      .where(and(
        eq(payments.tenantId, tenantId),
        eq(payments.status, 'overdue')
      ));

    // Get total unpaid amount
    const [totalUnpaidResult] = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(and(
        eq(payments.tenantId, tenantId),
        sql`${payments.status} IN ('pending', 'overdue')`
      ));

    // Get failed direct debits
    const [failedDirectDebitsResult] = await db
      .select({ count: count() })
      .from(payments)
      .where(and(
        eq(payments.tenantId, tenantId),
        eq(payments.status, 'failed')
      ));

    return {
      latePayments: latePaymentsResult?.count || 0,
      latePaymentsTrend: 0, // TODO: Calculate based on historical data
      totalUnpaid: parseFloat(totalUnpaidResult?.total?.toString() || '0'),
      totalUnpaidTrend: 0, // TODO: Calculate based on historical data
      failedDirectDebits: failedDirectDebitsResult?.count || 0,
      failedDirectDebitsTrend: 0, // TODO: Calculate based on historical data
    };
  }

  async getCondominiumsWithUnpaid(tenantId: string) {
    // Get all condominiums for the tenant
    const condos = await db
      .select({
        id: condominiums.id,
        name: condominiums.name,
        address: sql<string>`CONCAT(${condominiums.address}, ', ', ${condominiums.city}, ' ', ${condominiums.postalCode})`,
      })
      .from(condominiums)
      .where(eq(condominiums.tenantId, tenantId));

    // For each condominium, get unpaid stats
    const condosWithUnpaid = await Promise.all(
      condos.map(async (condo) => {
        // Count late payments
        const [latePaymentsResult] = await db
          .select({ count: count() })
          .from(payments)
          .where(and(
            eq(payments.condominiumId, condo.id),
            sql`${payments.status} IN ('pending', 'overdue')`
          ));

        // Total unpaid amount
        const [unpaidAmountResult] = await db
          .select({ total: sum(payments.amount) })
          .from(payments)
          .where(and(
            eq(payments.condominiumId, condo.id),
            sql`${payments.status} IN ('pending', 'overdue')`
          ));

        // Count owners in arrears
        const [ownersInArrearsResult] = await db
          .select({ count: count(sql`DISTINCT ${payments.ownerId}`) })
          .from(payments)
          .where(and(
            eq(payments.condominiumId, condo.id),
            sql`${payments.status} IN ('pending', 'overdue')`,
            sql`${payments.ownerId} IS NOT NULL`
          ));

        return {
          id: condo.id,
          name: condo.name,
          address: condo.address,
          latePayments: latePaymentsResult?.count || 0,
          unpaidAmount: parseFloat(unpaidAmountResult?.total?.toString() || '0'),
          ownersInArrears: ownersInArrearsResult?.count || 0,
        };
      })
    );

    // Filter to only show condos with unpaid
    return condosWithUnpaid.filter(c => c.unpaidAmount > 0 || c.latePayments > 0);
  }
}
