import { Injectable, Logger } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../database/client';
import { 
  users, 
  condominiums, 
  lots, 
  ownerCondominiums, 
  payments, 
  documents, 
  sepaMandates 
} from '../database/schema';

export interface OwnerDashboardData {
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  condominiums: {
    id: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    balance: number;
    lotsCount: number;
    sepaActive: boolean;
  }[];
  totalBalance: number;
  nextPayment: {
    id: string;
    amount: number;
    dueDate: string;
    description: string;
    condominiumName: string;
  } | null;
  recentPayments: {
    id: string;
    date: string;
    label: string;
    amount: number;
    status: string;
    type: string;
  }[];
  recentDocuments: {
    id: string;
    name: string;
    type: string;
    date: string;
  }[];
  lots: {
    id: string;
    reference: string;
    type: string;
    floor: number | null;
    surface: number | null;
    tantiemes: number | null;
    condominiumId: string;
    condominiumName: string;
  }[];
}

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  /**
   * Get dashboard data for an owner
   */
  async getDashboardData(userId: string, tenantId: string): Promise<OwnerDashboardData> {
    this.logger.log(`Fetching dashboard data for owner ${userId}`);

    // Get owner info
    const owner = await db.query.users.findFirst({
      where: and(eq(users.id, userId), eq(users.tenantId, tenantId)),
    });

    if (!owner) {
      throw new Error('Owner not found');
    }

    // Get condominiums associated with this owner
    const ownerCopros = await db
      .select({
        condominiumId: ownerCondominiums.condominiumId,
      })
      .from(ownerCondominiums)
      .where(and(
        eq(ownerCondominiums.ownerId, userId),
        eq(ownerCondominiums.tenantId, tenantId)
      ));

    const condominiumIds = ownerCopros.map(oc => oc.condominiumId);

    // Get condominium details
    const condominiumsData = await Promise.all(
      condominiumIds.map(async (condoId) => {
        const condo = await db.query.condominiums.findFirst({
          where: eq(condominiums.id, condoId),
        });

        if (!condo) return null;

        // Count lots for this owner in this condominium
        const ownerLots = await db
          .select({ count: sql<number>`count(*)` })
          .from(lots)
          .where(and(
            eq(lots.condominiumId, condoId),
            eq(lots.ownerId, userId)
          ));

        // Calculate balance (sum of unpaid payments)
        const balanceResult = await db
          .select({
            total: sql<number>`COALESCE(SUM(${payments.amount} - COALESCE(${payments.paidAmount}, 0)), 0)`,
          })
          .from(payments)
          .where(and(
            eq(payments.condominiumId, condoId),
            eq(payments.ownerId, userId),
            sql`${payments.status} IN ('pending', 'partial', 'overdue')`
          ));

        // Check if SEPA mandate is active
        const sepaMandate = await db.query.sepaMandates.findFirst({
          where: and(
            eq(sepaMandates.condominiumId, condoId),
            eq(sepaMandates.ownerId, userId),
            eq(sepaMandates.status, 'active')
          ),
        });

        return {
          id: condo.id,
          name: condo.name,
          address: condo.address,
          city: condo.city,
          postalCode: condo.postalCode,
          balance: Number(balanceResult[0]?.total || 0),
          lotsCount: Number(ownerLots[0]?.count || 0),
          sepaActive: !!sepaMandate,
        };
      })
    );

    const validCondominiums = condominiumsData.filter((c): c is NonNullable<typeof c> => c !== null);

    // Calculate total balance
    const totalBalance = validCondominiums.reduce((sum, c) => sum + c.balance, 0);

    // Get next payment due
    const nextPaymentResult = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        dueDate: payments.dueDate,
        description: payments.description,
        condominiumId: payments.condominiumId,
      })
      .from(payments)
      .where(and(
        eq(payments.ownerId, userId),
        eq(payments.tenantId, tenantId),
        sql`${payments.status} IN ('pending', 'partial')`,
        sql`${payments.dueDate} >= CURRENT_DATE`
      ))
      .orderBy(payments.dueDate)
      .limit(1);

    let nextPayment = null;
    if (nextPaymentResult.length > 0) {
      const np = nextPaymentResult[0];
      const condo = validCondominiums.find(c => c.id === np.condominiumId);
      nextPayment = {
        id: np.id,
        amount: Number(np.amount),
        dueDate: np.dueDate || new Date().toISOString().split('T')[0],
        description: np.description || 'Appel de charges',
        condominiumName: condo?.name || '',
      };
    }

    // Get recent payments (last 5)
    const recentPaymentsResult = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        paidAt: payments.paidAt,
        dueDate: payments.dueDate,
        description: payments.description,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
      })
      .from(payments)
      .where(and(
        eq(payments.ownerId, userId),
        eq(payments.tenantId, tenantId)
      ))
      .orderBy(desc(payments.dueDate))
      .limit(5);

    const recentPayments = recentPaymentsResult.map(p => ({
      id: p.id,
      date: p.paidAt?.toISOString() || p.dueDate || new Date().toISOString().split('T')[0],
      label: p.description || 'Appel de charges',
      amount: Number(p.amount),
      status: p.status,
      type: p.paymentMethod || 'transfer',
    }));

    // Get recent documents (visible to owners)
    const recentDocsResult = await db
      .select({
        id: documents.id,
        name: documents.name,
        type: documents.type,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(and(
        eq(documents.tenantId, tenantId),
        sql`${documents.condominiumId} IN (${sql.join(condominiumIds.map(id => sql`${id}`), sql`, `)})`,
        sql`${documents.visibility} IN ('owners', 'all')`
      ))
      .orderBy(desc(documents.createdAt))
      .limit(5);

    const recentDocuments = recentDocsResult.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      date: d.createdAt.toISOString(),
    }));

    // Get owner's lots
    const lotsResult = await db
      .select({
        id: lots.id,
        reference: lots.reference,
        type: lots.type,
        floor: lots.floor,
        surface: lots.surface,
        tantiemes: lots.tantiemes,
        condominiumId: lots.condominiumId,
      })
      .from(lots)
      .where(and(
        eq(lots.ownerId, userId),
        eq(lots.tenantId, tenantId)
      ));

    const lotsWithCondo = lotsResult.map(l => ({
      id: l.id,
      reference: l.reference,
      type: l.type,
      floor: l.floor,
      surface: l.surface ? Number(l.surface) : null,
      tantiemes: l.tantiemes ? Number(l.tantiemes) : null,
      condominiumId: l.condominiumId,
      condominiumName: validCondominiums.find(c => c.id === l.condominiumId)?.name || '',
    }));

    return {
      owner: {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
      },
      condominiums: validCondominiums,
      totalBalance,
      nextPayment,
      recentPayments,
      recentDocuments,
      lots: lotsWithCondo,
    };
  }

  /**
   * Get payments for an owner
   */
  async getPayments(userId: string, tenantId: string, condominiumId?: string) {
    const conditions = [
      eq(payments.ownerId, userId),
      eq(payments.tenantId, tenantId),
    ];

    if (condominiumId) {
      conditions.push(eq(payments.condominiumId, condominiumId));
    }

    const result = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        paidAmount: payments.paidAmount,
        paidAt: payments.paidAt,
        dueDate: payments.dueDate,
        description: payments.description,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        type: payments.type,
        condominiumId: payments.condominiumId,
      })
      .from(payments)
      .where(and(...conditions))
      .orderBy(desc(payments.dueDate));

    return result.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      paidAmount: Number(p.paidAmount || 0),
      date: p.paidAt?.toISOString() || p.dueDate,
      dueDate: p.dueDate,
      label: p.description || 'Appel de charges',
      status: p.status,
      type: p.paymentMethod || 'transfer',
      condominiumId: p.condominiumId,
    }));
  }

  /**
   * Get documents for an owner
   */
  async getDocuments(userId: string, tenantId: string, condominiumId?: string) {
    // Get owner's condominiums
    const ownerCopros = await db
      .select({ condominiumId: ownerCondominiums.condominiumId })
      .from(ownerCondominiums)
      .where(and(
        eq(ownerCondominiums.ownerId, userId),
        eq(ownerCondominiums.tenantId, tenantId)
      ));

    let condominiumIds = ownerCopros.map(oc => oc.condominiumId);
    
    if (condominiumId && condominiumIds.includes(condominiumId)) {
      condominiumIds = [condominiumId];
    }

    if (condominiumIds.length === 0) {
      return [];
    }

    const result = await db
      .select({
        id: documents.id,
        name: documents.name,
        type: documents.type,
        category: documents.category,
        fileUrl: documents.fileUrl,
        fileSize: documents.fileSize,
        mimeType: documents.mimeType,
        createdAt: documents.createdAt,
        condominiumId: documents.condominiumId,
      })
      .from(documents)
      .where(and(
        eq(documents.tenantId, tenantId),
        sql`${documents.condominiumId} IN (${sql.join(condominiumIds.map(id => sql`${id}`), sql`, `)})`,
        sql`${documents.visibility} IN ('owners', 'all')`
      ))
      .orderBy(desc(documents.createdAt));

    return result.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      category: d.category,
      fileUrl: d.fileUrl,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      date: d.createdAt.toISOString(),
      condominiumId: d.condominiumId,
    }));
  }
}
