import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../database';
import {
  payments,
  ownerCondominiums,
  fundCallItems,
  fundCalls,
  users,
  condominiums,
  lots,
} from '../database/schema';
import { eq, and, desc, sql, gte, lte, sum } from 'drizzle-orm';
import { CreatePaymentDto, PaymentFiltersDto } from './dto/create-payment.dto';
import { UpdatePaymentDto, PaymentStatus } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  /**
   * Liste des paiements d'une copropriété
   */
  async findAll(tenantId: string, condominiumId: string, filters: PaymentFiltersDto = {}) {
    const conditions = [
      eq(payments.tenantId, tenantId),
      eq(payments.condominiumId, condominiumId),
    ];

    if (filters.ownerId) {
      conditions.push(eq(payments.ownerId, filters.ownerId));
    }

    if (filters.paymentMethod) {
      conditions.push(eq(payments.paymentMethod, filters.paymentMethod));
    }

    if (filters.status) {
      conditions.push(eq(payments.status, filters.status));
    }

    if (filters.from) {
      conditions.push(gte(payments.receivedAt, filters.from));
    }

    if (filters.to) {
      conditions.push(lte(payments.receivedAt, filters.to));
    }

    const results = await db
      .select({
        id: payments.id,
        type: payments.type,
        description: payments.description,
        amount: payments.amount,
        paidAmount: payments.paidAmount,
        dueDate: payments.dueDate,
        receivedAt: payments.receivedAt,
        paidAt: payments.paidAt,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        reference: payments.reference,
        createdAt: payments.createdAt,
        owner: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        lot: {
          id: lots.id,
          reference: lots.reference,
        },
        fundCallItem: {
          id: fundCallItems.id,
          amount: fundCallItems.amount,
        },
      })
      .from(payments)
      .leftJoin(users, eq(payments.ownerId, users.id))
      .leftJoin(lots, eq(payments.lotId, lots.id))
      .leftJoin(fundCallItems, eq(payments.fundCallItemId, fundCallItems.id))
      .where(and(...conditions))
      .orderBy(desc(payments.receivedAt), desc(payments.createdAt));

    return {
      items: results,
      total: results.length,
    };
  }

  /**
   * Détail d'un paiement
   */
  async findOne(tenantId: string, id: string) {
    const results = await db
      .select({
        id: payments.id,
        type: payments.type,
        description: payments.description,
        amount: payments.amount,
        paidAmount: payments.paidAmount,
        dueDate: payments.dueDate,
        receivedAt: payments.receivedAt,
        paidAt: payments.paidAt,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        reference: payments.reference,
        stripePaymentIntentId: payments.stripePaymentIntentId,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        owner: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        lot: {
          id: lots.id,
          reference: lots.reference,
          type: lots.type,
        },
        condominium: {
          id: condominiums.id,
          name: condominiums.name,
        },
        fundCallItem: {
          id: fundCallItems.id,
          amount: fundCallItems.amount,
          paidAmount: fundCallItems.paidAmount,
          status: fundCallItems.status,
        },
      })
      .from(payments)
      .leftJoin(users, eq(payments.ownerId, users.id))
      .leftJoin(lots, eq(payments.lotId, lots.id))
      .leftJoin(condominiums, eq(payments.condominiumId, condominiums.id))
      .leftJoin(fundCallItems, eq(payments.fundCallItemId, fundCallItems.id))
      .where(and(eq(payments.tenantId, tenantId), eq(payments.id, id)));

    if (results.length === 0) {
      throw new NotFoundException('Paiement non trouvé');
    }

    return results[0];
  }

  /**
   * Enregistrer un nouveau paiement
   */
  async create(tenantId: string, condominiumId: string, data: CreatePaymentDto) {
    // Vérifier que l'owner_condominium existe
    const [ownerCondo] = await db
      .select({
        id: ownerCondominiums.id,
        ownerId: ownerCondominiums.ownerId,
        condominiumId: ownerCondominiums.condominiumId,
      })
      .from(ownerCondominiums)
      .where(
        and(
          eq(ownerCondominiums.tenantId, tenantId),
          eq(ownerCondominiums.id, data.ownerCondominiumId),
        ),
      );

    if (!ownerCondo) {
      throw new BadRequestException('Association propriétaire-copropriété non trouvée');
    }

    if (ownerCondo.condominiumId !== condominiumId) {
      throw new BadRequestException('Le propriétaire n\'appartient pas à cette copropriété');
    }

    // Vérifier le fund_call_item si fourni
    let fundCallItem = null;
    if (data.fundCallItemId) {
      const [item] = await db
        .select({
          id: fundCallItems.id,
          fundCallId: fundCallItems.fundCallId,
          amount: fundCallItems.amount,
          paidAmount: fundCallItems.paidAmount,
          ownerCondominiumId: fundCallItems.ownerCondominiumId,
        })
        .from(fundCallItems)
        .where(
          and(
            eq(fundCallItems.tenantId, tenantId),
            eq(fundCallItems.id, data.fundCallItemId),
          ),
        );

      if (!item) {
        throw new BadRequestException('Appel de fonds non trouvé');
      }

      if (item.ownerCondominiumId !== data.ownerCondominiumId) {
        throw new BadRequestException('Cet appel de fonds n\'appartient pas à ce propriétaire');
      }

      fundCallItem = item;
    }

    // Créer le paiement
    const [payment] = await db
      .insert(payments)
      .values({
        tenantId,
        condominiumId,
        ownerId: ownerCondo.ownerId,
        lotId: data.lotId || null,
        fundCallItemId: data.fundCallItemId || null,
        type: data.type || 'regular',
        description: data.description,
        amount: String(data.amount),
        paidAmount: String(data.amount),
        receivedAt: data.paymentDate,
        paidAt: new Date(),
        status: 'paid',
        paymentMethod: data.paymentMethod,
        reference: data.reference,
      })
      .returning();

    // Mettre à jour le fund_call_item si lié
    if (fundCallItem) {
      await this.updateFundCallItemStatus(tenantId, fundCallItem.id, data.amount);
    }

    return payment;
  }

  /**
   * Modifier un paiement
   */
  async update(tenantId: string, id: string, data: UpdatePaymentDto) {
    // Vérifier que le paiement existe
    const [existing] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.tenantId, tenantId), eq(payments.id, id)));

    if (!existing) {
      throw new NotFoundException('Paiement non trouvé');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.fundCallItemId !== undefined) updateData.fundCallItemId = data.fundCallItemId;
    if (data.lotId !== undefined) updateData.lotId = data.lotId;
    if (data.amount !== undefined) {
      updateData.amount = String(data.amount);
      updateData.paidAmount = String(data.amount);
    }
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.paymentDate !== undefined) updateData.receivedAt = data.paymentDate;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.reference !== undefined) updateData.reference = data.reference;
    if (data.description !== undefined) updateData.description = data.description;

    const [updated] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();

    return updated;
  }

  /**
   * Supprimer un paiement
   */
  async delete(tenantId: string, id: string) {
    // Vérifier que le paiement existe
    const [existing] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.tenantId, tenantId), eq(payments.id, id)));

    if (!existing) {
      throw new NotFoundException('Paiement non trouvé');
    }

    // Récupérer le fund_call_item lié avant suppression
    const fundCallItemId = existing.fundCallItemId;

    await db.delete(payments).where(eq(payments.id, id));

    // Recalculer le statut du fund_call_item si lié
    if (fundCallItemId) {
      await this.recalculateFundCallItemStatus(tenantId, fundCallItemId);
    }

    return { deleted: true };
  }

  /**
   * Historique des paiements d'un propriétaire
   */
  async findByOwner(tenantId: string, ownerId: string) {
    const results = await db
      .select({
        id: payments.id,
        type: payments.type,
        description: payments.description,
        amount: payments.amount,
        paidAmount: payments.paidAmount,
        dueDate: payments.dueDate,
        receivedAt: payments.receivedAt,
        paidAt: payments.paidAt,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        reference: payments.reference,
        createdAt: payments.createdAt,
        condominium: {
          id: condominiums.id,
          name: condominiums.name,
        },
        lot: {
          id: lots.id,
          reference: lots.reference,
        },
        fundCallItem: {
          id: fundCallItems.id,
          amount: fundCallItems.amount,
        },
      })
      .from(payments)
      .leftJoin(condominiums, eq(payments.condominiumId, condominiums.id))
      .leftJoin(lots, eq(payments.lotId, lots.id))
      .leftJoin(fundCallItems, eq(payments.fundCallItemId, fundCallItems.id))
      .where(and(eq(payments.tenantId, tenantId), eq(payments.ownerId, ownerId)))
      .orderBy(desc(payments.receivedAt), desc(payments.createdAt));

    return {
      items: results,
      total: results.length,
    };
  }

  /**
   * Solde d'un propriétaire (dû vs payé)
   */
  async getOwnerBalance(tenantId: string, ownerId: string, condominiumId?: string) {
    // Récupérer les owner_condominiums
    const ownerCondoConditions = [
      eq(ownerCondominiums.tenantId, tenantId),
      eq(ownerCondominiums.ownerId, ownerId),
    ];

    if (condominiumId) {
      ownerCondoConditions.push(eq(ownerCondominiums.condominiumId, condominiumId));
    }

    const ownerCondos = await db
      .select({
        id: ownerCondominiums.id,
        condominiumId: ownerCondominiums.condominiumId,
        condominiumName: condominiums.name,
      })
      .from(ownerCondominiums)
      .leftJoin(condominiums, eq(ownerCondominiums.condominiumId, condominiums.id))
      .where(and(...ownerCondoConditions));

    const balances = [];

    for (const ownerCondo of ownerCondos) {
      // Montant total dû (fund_call_items)
      const [dueResult] = await db
        .select({
          total: sum(fundCallItems.amount),
        })
        .from(fundCallItems)
        .innerJoin(fundCalls, eq(fundCallItems.fundCallId, fundCalls.id))
        .where(
          and(
            eq(fundCallItems.tenantId, tenantId),
            eq(fundCallItems.ownerCondominiumId, ownerCondo.id),
            eq(fundCalls.status, 'sent'), // Seulement appels envoyés
          ),
        );

      // Montant total payé (payments)
      const [paidResult] = await db
        .select({
          total: sum(payments.paidAmount),
        })
        .from(payments)
        .where(
          and(
            eq(payments.tenantId, tenantId),
            eq(payments.ownerId, ownerId),
            eq(payments.condominiumId, ownerCondo.condominiumId),
            eq(payments.status, 'paid'),
          ),
        );

      const totalDue = Number(dueResult?.total || 0);
      const totalPaid = Number(paidResult?.total || 0);
      const balance = totalPaid - totalDue;

      balances.push({
        condominiumId: ownerCondo.condominiumId,
        condominiumName: ownerCondo.condominiumName,
        totalDue,
        totalPaid,
        balance, // Positif = crédit, Négatif = dû
        status: balance >= 0 ? 'up_to_date' : 'outstanding',
      });
    }

    // Résumé global
    const summary = {
      totalDue: balances.reduce((acc, b) => acc + b.totalDue, 0),
      totalPaid: balances.reduce((acc, b) => acc + b.totalPaid, 0),
      balance: balances.reduce((acc, b) => acc + b.balance, 0),
    };

    return {
      summary,
      byCondominium: balances,
    };
  }

  /**
   * Dashboard des paiements d'une copropriété
   */
  async getSummary(tenantId: string, condominiumId: string) {
    // Total attendu (fund_call_items des appels envoyés)
    const [expectedResult] = await db
      .select({
        total: sum(fundCallItems.amount),
      })
      .from(fundCallItems)
      .innerJoin(fundCalls, eq(fundCallItems.fundCallId, fundCalls.id))
      .where(
        and(
          eq(fundCalls.tenantId, tenantId),
          eq(fundCalls.condominiumId, condominiumId),
          eq(fundCalls.status, 'sent'),
        ),
      );

    // Total reçu
    const [receivedResult] = await db
      .select({
        total: sum(payments.paidAmount),
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.condominiumId, condominiumId),
          eq(payments.status, 'paid'),
        ),
      );

    // Répartition par méthode de paiement
    const byMethod = await db
      .select({
        method: payments.paymentMethod,
        count: sql<number>`count(*)::int`,
        total: sum(payments.paidAmount),
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.condominiumId, condominiumId),
          eq(payments.status, 'paid'),
        ),
      )
      .groupBy(payments.paymentMethod);

    // Impayés (fund_call_items non payés avec appels envoyés)
    const [overdueResult] = await db
      .select({
        count: sql<number>`count(*)::int`,
        total: sum(sql`${fundCallItems.amount} - ${fundCallItems.paidAmount}`),
      })
      .from(fundCallItems)
      .innerJoin(fundCalls, eq(fundCallItems.fundCallId, fundCalls.id))
      .where(
        and(
          eq(fundCalls.tenantId, tenantId),
          eq(fundCalls.condominiumId, condominiumId),
          eq(fundCalls.status, 'sent'),
          sql`${fundCallItems.status} IN ('pending', 'partial', 'overdue')`,
        ),
      );

    const totalExpected = Number(expectedResult?.total || 0);
    const totalReceived = Number(receivedResult?.total || 0);
    const totalOverdue = Number(overdueResult?.total || 0);

    return {
      totalExpected,
      totalReceived,
      totalOutstanding: totalExpected - totalReceived,
      overdueCount: overdueResult?.count || 0,
      overdueAmount: totalOverdue,
      collectionRate: totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 100,
      byPaymentMethod: byMethod.map((m) => ({
        method: m.method,
        count: m.count,
        total: Number(m.total || 0),
      })),
    };
  }

  /**
   * Mettre à jour le statut d'un fund_call_item après paiement
   */
  private async updateFundCallItemStatus(tenantId: string, itemId: string, additionalAmount: number) {
    const [item] = await db
      .select({
        id: fundCallItems.id,
        amount: fundCallItems.amount,
        paidAmount: fundCallItems.paidAmount,
      })
      .from(fundCallItems)
      .where(and(eq(fundCallItems.tenantId, tenantId), eq(fundCallItems.id, itemId)));

    if (!item) return;

    const newPaidAmount = Number(item.paidAmount) + additionalAmount;
    const totalAmount = Number(item.amount);
    
    let status = 'pending';
    if (newPaidAmount >= totalAmount) {
      status = 'paid';
    } else if (newPaidAmount > 0) {
      status = 'partial';
    }

    await db
      .update(fundCallItems)
      .set({
        paidAmount: String(newPaidAmount),
        status,
        updatedAt: new Date(),
      })
      .where(eq(fundCallItems.id, itemId));
  }

  /**
   * Recalculer le statut d'un fund_call_item (après suppression/modification)
   */
  private async recalculateFundCallItemStatus(tenantId: string, itemId: string) {
    // Récupérer l'item
    const [item] = await db
      .select({
        id: fundCallItems.id,
        amount: fundCallItems.amount,
      })
      .from(fundCallItems)
      .where(eq(fundCallItems.id, itemId));

    if (!item) return;

    // Calculer le total des paiements liés
    const [paidResult] = await db
      .select({
        total: sum(payments.paidAmount),
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.fundCallItemId, itemId),
          eq(payments.status, 'paid'),
        ),
      );

    const totalPaid = Number(paidResult?.total || 0);
    const totalAmount = Number(item.amount);

    let status = 'pending';
    if (totalPaid >= totalAmount) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partial';
    }

    await db
      .update(fundCallItems)
      .set({
        paidAmount: String(totalPaid),
        status,
        updatedAt: new Date(),
      })
      .where(eq(fundCallItems.id, itemId));
  }
}
