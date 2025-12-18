import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../database';
import { 
  reconciliations, 
  bankTransactions, 
  bankAccounts,
  payments, 
  invoices, 
  utilityBills, 
  fundCallItems,
  users,
  ownerCondominiums,
  condominiums,
} from '../database/schema';
import { eq, and, desc, sql, isNull, or } from 'drizzle-orm';
import { CreateReconciliationDto, ReconciliationTargetType } from './dto/create-reconciliation.dto';
import { RejectReconciliationDto } from './dto/update-reconciliation.dto';

@Injectable()
export class ReconciliationService {
  /**
   * Get reconciliation queue for a condominium
   * Returns unreconciled transactions with AI suggestions
   */
  async getQueue(tenantId: string, condominiumId: string, filters?: { status?: string }) {
    // Get bank accounts for this condominium
    const accounts = await db
      .select({ id: bankAccounts.id })
      .from(bankAccounts)
      .where(and(
        eq(bankAccounts.tenantId, tenantId),
        eq(bankAccounts.condominiumId, condominiumId)
      ));

    if (accounts.length === 0) {
      return { items: [], stats: { pending: 0, suggested: 0, total: 0 } };
    }

    const accountIds = accounts.map(a => a.id);

    // Get pending reconciliations (transactions in queue)
    const queueConditions = [
      eq(reconciliations.tenantId, tenantId),
      sql`${reconciliations.queueStatus} IN ('pending', 'suggested')`,
    ];

    if (filters?.status) {
      queueConditions.push(eq(reconciliations.queueStatus, filters.status));
    }

    const queueItems = await db
      .select({
        id: reconciliations.id,
        transactionId: reconciliations.bankTransactionId,
        queueStatus: reconciliations.queueStatus,
        suggestedTargetType: reconciliations.suggestedTargetType,
        suggestedTargetId: reconciliations.suggestedTargetId,
        confidenceScore: reconciliations.confidenceScore,
        matchingDetails: reconciliations.matchingDetails,
        createdAt: reconciliations.createdAt,
        // Transaction details
        txAmount: bankTransactions.amount,
        txDate: bankTransactions.transactionDate,
        txLabel: bankTransactions.simplifiedWording,
        txOriginalLabel: bankTransactions.originalWording,
        txCounterparty: bankTransactions.counterpartyName,
        txDirection: bankTransactions.direction,
      })
      .from(reconciliations)
      .innerJoin(bankTransactions, eq(bankTransactions.id, reconciliations.bankTransactionId))
      .where(and(...queueConditions))
      .orderBy(desc(reconciliations.createdAt));

    // Filter by condominium's accounts
    const filteredItems = queueItems.filter(item => {
      // We need to check if the transaction belongs to this condominium
      return true; // TODO: Add proper filtering once we have the join
    });

    // Enrich with suggestion details
    const enrichedItems = await Promise.all(
      filteredItems.map(async (item) => {
        let suggestion = null;

        if (item.suggestedTargetType && item.suggestedTargetId) {
          suggestion = await this.getTargetDetails(
            tenantId,
            item.suggestedTargetType as ReconciliationTargetType,
            item.suggestedTargetId
          );
        }

        return {
          id: item.id,
          transaction: {
            id: item.transactionId,
            amount: Number(item.txAmount),
            date: item.txDate,
            label: item.txLabel || item.txOriginalLabel,
            counterparty: item.txCounterparty,
            direction: item.txDirection,
          },
          queueStatus: item.queueStatus,
          suggestion: suggestion ? {
            targetType: item.suggestedTargetType,
            targetId: item.suggestedTargetId,
            confidenceScore: item.confidenceScore,
            matchingDetails: item.matchingDetails,
            details: suggestion,
          } : null,
          createdAt: item.createdAt,
        };
      })
    );

    // Stats
    const pending = enrichedItems.filter(i => i.queueStatus === 'pending').length;
    const suggested = enrichedItems.filter(i => i.queueStatus === 'suggested').length;

    return {
      items: enrichedItems,
      stats: {
        pending,
        suggested,
        total: enrichedItems.length,
      },
    };
  }

  /**
   * Get candidates for matching a transaction
   */
  async getCandidates(tenantId: string, condominiumId: string, transactionId: string) {
    // Get transaction details
    const tx = await db.query.bankTransactions.findFirst({
      where: and(
        eq(bankTransactions.id, transactionId),
        eq(bankTransactions.tenantId, tenantId)
      ),
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    const amount = Math.abs(Number(tx.amount));
    const isDebit = Number(tx.amount) < 0;

    const candidates: Array<{
      type: ReconciliationTargetType;
      id: string;
      label: string;
      amount: number;
      date: string | null;
      score: number;
    }> = [];

    if (isDebit) {
      // For debits: look for invoices and utility bills (expenses)
      const pendingInvoices = await db
        .select({
          id: invoices.id,
          supplierName: invoices.supplierName,
          amountTtc: invoices.amountTtc,
          issueDate: invoices.issueDate,
          invoiceNumber: invoices.invoiceNumber,
        })
        .from(invoices)
        .where(and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.condominiumId, condominiumId),
          eq(invoices.status, 'pending')
        ));

      for (const inv of pendingInvoices) {
        const invAmount = Number(inv.amountTtc);
        const score = this.calculateMatchScore(amount, invAmount, tx.simplifiedWording || '', inv.supplierName);
        
        candidates.push({
          type: ReconciliationTargetType.INVOICE,
          id: inv.id,
          label: `${inv.supplierName} - ${inv.invoiceNumber || 'Facture'}`,
          amount: invAmount,
          date: inv.issueDate,
          score,
        });
      }

      const pendingUtilityBills = await db
        .select({
          id: utilityBills.id,
          utilityType: utilityBills.utilityType,
          totalAmount: utilityBills.totalAmount,
          periodStart: utilityBills.periodStart,
          supplierName: utilityBills.supplierName,
        })
        .from(utilityBills)
        .where(and(
          eq(utilityBills.tenantId, tenantId),
          eq(utilityBills.condominiumId, condominiumId),
          sql`${utilityBills.status} IN ('draft', 'validated')`
        ));

      for (const bill of pendingUtilityBills) {
        const billAmount = Number(bill.totalAmount);
        const score = this.calculateMatchScore(amount, billAmount, tx.simplifiedWording || '', bill.supplierName || bill.utilityType);
        
        candidates.push({
          type: ReconciliationTargetType.UTILITY_BILL,
          id: bill.id,
          label: `${bill.utilityType} - ${bill.supplierName || 'Facture consommation'}`,
          amount: billAmount,
          date: bill.periodStart,
          score,
        });
      }
    } else {
      // For credits: look for payments and fund call items (income)
      const pendingFundCallItems = await db
        .select({
          id: fundCallItems.id,
          amount: fundCallItems.amount,
          paidAmount: fundCallItems.paidAmount,
          ownerId: ownerCondominiums.ownerId,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(fundCallItems)
        .innerJoin(ownerCondominiums, eq(ownerCondominiums.id, fundCallItems.ownerCondominiumId))
        .innerJoin(users, eq(users.id, ownerCondominiums.ownerId))
        .where(and(
          eq(fundCallItems.tenantId, tenantId),
          sql`${fundCallItems.status} IN ('pending', 'partial', 'overdue')`
        ));

      for (const item of pendingFundCallItems) {
        const itemAmount = Number(item.amount) - Number(item.paidAmount);
        const ownerName = `${item.firstName} ${item.lastName}`;
        const score = this.calculateMatchScore(amount, itemAmount, tx.simplifiedWording || '', ownerName);
        
        candidates.push({
          type: ReconciliationTargetType.FUND_CALL_ITEM,
          id: item.id,
          label: `Appel de fonds - ${ownerName}`,
          amount: itemAmount,
          date: null,
          score,
        });
      }

      const pendingPayments = await db
        .select({
          id: payments.id,
          amount: payments.amount,
          paidAmount: payments.paidAmount,
          description: payments.description,
          ownerId: payments.ownerId,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(payments)
        .innerJoin(users, eq(users.id, payments.ownerId))
        .where(and(
          eq(payments.tenantId, tenantId),
          eq(payments.condominiumId, condominiumId),
          sql`${payments.status} IN ('pending', 'partial')`
        ));

      for (const pmt of pendingPayments) {
        const pmtAmount = Number(pmt.amount) - Number(pmt.paidAmount || 0);
        const ownerName = `${pmt.firstName} ${pmt.lastName}`;
        const score = this.calculateMatchScore(amount, pmtAmount, tx.simplifiedWording || '', ownerName);
        
        candidates.push({
          type: ReconciliationTargetType.PAYMENT,
          id: pmt.id,
          label: `${pmt.description || 'Paiement'} - ${ownerName}`,
          amount: pmtAmount,
          date: null,
          score,
        });
      }
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    return {
      transaction: {
        id: tx.id,
        amount: Number(tx.amount),
        date: tx.transactionDate,
        label: tx.simplifiedWording || tx.originalWording,
        direction: tx.direction,
      },
      candidates: candidates.slice(0, 10), // Return top 10
    };
  }

  /**
   * Calculate match score between transaction and target
   */
  private calculateMatchScore(txAmount: number, targetAmount: number, txLabel: string, targetLabel: string): number {
    let score = 0;

    // Amount matching (max 40 points)
    const amountDiff = Math.abs(txAmount - targetAmount);
    const amountPercent = amountDiff / Math.max(txAmount, targetAmount);
    
    if (amountDiff < 0.01) {
      score += 40; // Exact match
    } else if (amountPercent < 0.05) {
      score += 25; // Within 5%
    } else if (amountPercent < 0.10) {
      score += 15; // Within 10%
    }

    // Label matching (max 30 points)
    const txLabelLower = txLabel.toLowerCase();
    const targetLabelLower = targetLabel.toLowerCase();
    
    const targetWords = targetLabelLower.split(/\s+/).filter(w => w.length > 2);
    const matchedWords = targetWords.filter(word => txLabelLower.includes(word));
    
    if (matchedWords.length > 0) {
      score += Math.min(30, matchedWords.length * 10);
    }

    // Normalize to 0-100
    return Math.min(100, score);
  }

  /**
   * Create a reconciliation (validate a match)
   */
  async create(tenantId: string, userId: string, data: CreateReconciliationDto) {
    // Verify transaction exists
    const tx = await db.query.bankTransactions.findFirst({
      where: and(
        eq(bankTransactions.id, data.transactionId),
        eq(bankTransactions.tenantId, tenantId)
      ),
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    // Check if already reconciled
    const existingConfirmed = await db.query.reconciliations.findFirst({
      where: and(
        eq(reconciliations.bankTransactionId, data.transactionId),
        eq(reconciliations.status, 'confirmed')
      ),
    });

    if (existingConfirmed) {
      throw new BadRequestException('Transaction already reconciled');
    }

    // Build the reconciliation record
    const reconciliationData: Record<string, unknown> = {
      tenantId,
      bankTransactionId: data.transactionId,
      targetType: data.targetType,
      matchType: 'manual',
      status: 'confirmed',
      queueStatus: 'validated',
      matchedById: userId,
      matchedAt: new Date(),
      notes: data.notes,
    };

    // Set the appropriate target ID field
    switch (data.targetType) {
      case ReconciliationTargetType.PAYMENT:
        reconciliationData.paymentId = data.targetId;
        break;
      case ReconciliationTargetType.INVOICE:
        reconciliationData.invoiceId = data.targetId;
        break;
      case ReconciliationTargetType.UTILITY_BILL:
        reconciliationData.utilityBillId = data.targetId;
        break;
      case ReconciliationTargetType.FUND_CALL_ITEM:
        reconciliationData.fundCallItemId = data.targetId;
        break;
    }

    // Update any pending reconciliation for this transaction
    await db
      .delete(reconciliations)
      .where(and(
        eq(reconciliations.bankTransactionId, data.transactionId),
        eq(reconciliations.status, 'pending')
      ));

    // Create the reconciliation
    const [reconciliation] = await db
      .insert(reconciliations)
      .values(reconciliationData as typeof reconciliations.$inferInsert)
      .returning();

    // Update transaction status
    await db
      .update(bankTransactions)
      .set({ 
        reconciliationStatus: 'matched',
        updatedAt: new Date(),
      })
      .where(eq(bankTransactions.id, data.transactionId));

    // Update target status based on type
    await this.updateTargetStatus(data.targetType, data.targetId, Math.abs(Number(tx.amount)));

    return reconciliation;
  }

  /**
   * Update target status after reconciliation
   */
  private async updateTargetStatus(targetType: ReconciliationTargetType, targetId: string, amount: number) {
    switch (targetType) {
      case ReconciliationTargetType.INVOICE:
        await db
          .update(invoices)
          .set({ status: 'paid', paidAt: new Date(), updatedAt: new Date() })
          .where(eq(invoices.id, targetId));
        break;

      case ReconciliationTargetType.UTILITY_BILL:
        await db
          .update(utilityBills)
          .set({ status: 'distributed', updatedAt: new Date() })
          .where(eq(utilityBills.id, targetId));
        break;

      case ReconciliationTargetType.FUND_CALL_ITEM:
        const item = await db.query.fundCallItems.findFirst({
          where: eq(fundCallItems.id, targetId),
        });
        if (item) {
          const newPaidAmount = Number(item.paidAmount) + amount;
          const itemAmount = Number(item.amount);
          const newStatus = newPaidAmount >= itemAmount ? 'paid' : 'partial';
          
          await db
            .update(fundCallItems)
            .set({ 
              paidAmount: newPaidAmount.toString(),
              status: newStatus,
              updatedAt: new Date(),
            })
            .where(eq(fundCallItems.id, targetId));
        }
        break;

      case ReconciliationTargetType.PAYMENT:
        const payment = await db.query.payments.findFirst({
          where: eq(payments.id, targetId),
        });
        if (payment) {
          const newPaidAmount = Number(payment.paidAmount || 0) + amount;
          const paymentAmount = Number(payment.amount);
          const newStatus = newPaidAmount >= paymentAmount ? 'paid' : 'partial';
          
          await db
            .update(payments)
            .set({
              paidAmount: newPaidAmount.toString(),
              paidAt: newStatus === 'paid' ? new Date() : undefined,
              status: newStatus,
              updatedAt: new Date(),
            })
            .where(eq(payments.id, targetId));
        }
        break;
    }
  }

  /**
   * Reject a reconciliation suggestion
   */
  async reject(tenantId: string, id: string, data: RejectReconciliationDto) {
    const existing = await db.query.reconciliations.findFirst({
      where: and(
        eq(reconciliations.id, id),
        eq(reconciliations.tenantId, tenantId)
      ),
    });

    if (!existing) {
      throw new NotFoundException('Reconciliation not found');
    }

    const [updated] = await db
      .update(reconciliations)
      .set({
        status: 'rejected',
        queueStatus: 'rejected',
        notes: data.reason,
        updatedAt: new Date(),
      })
      .where(eq(reconciliations.id, id))
      .returning();

    return updated;
  }

  /**
   * Ignore a transaction (won't appear in queue)
   */
  async ignore(tenantId: string, id: string) {
    const existing = await db.query.reconciliations.findFirst({
      where: and(
        eq(reconciliations.id, id),
        eq(reconciliations.tenantId, tenantId)
      ),
    });

    if (!existing) {
      throw new NotFoundException('Reconciliation not found');
    }

    const [updated] = await db
      .update(reconciliations)
      .set({
        queueStatus: 'ignored',
        updatedAt: new Date(),
      })
      .where(eq(reconciliations.id, id))
      .returning();

    // Update transaction status
    await db
      .update(bankTransactions)
      .set({ 
        reconciliationStatus: 'ignored',
        updatedAt: new Date(),
      })
      .where(eq(bankTransactions.id, existing.bankTransactionId));

    return updated;
  }

  /**
   * Delete/cancel a reconciliation
   */
  async delete(tenantId: string, id: string) {
    const existing = await db.query.reconciliations.findFirst({
      where: and(
        eq(reconciliations.id, id),
        eq(reconciliations.tenantId, tenantId)
      ),
    });

    if (!existing) {
      throw new NotFoundException('Reconciliation not found');
    }

    // Reset transaction status
    await db
      .update(bankTransactions)
      .set({ 
        reconciliationStatus: 'unmatched',
        updatedAt: new Date(),
      })
      .where(eq(bankTransactions.id, existing.bankTransactionId));

    await db.delete(reconciliations).where(eq(reconciliations.id, id));

    return { success: true };
  }

  /**
   * Auto-match transactions with high confidence
   */
  async autoMatch(tenantId: string, condominiumId: string, minConfidence: number = 85) {
    const queue = await this.getQueue(tenantId, condominiumId, { status: 'suggested' });
    
    const matched: string[] = [];
    const skipped: string[] = [];

    for (const item of queue.items) {
      if (
        item.suggestion && 
        item.suggestion.confidenceScore !== null && 
        item.suggestion.confidenceScore >= minConfidence &&
        item.suggestion.targetId !== null
      ) {
        try {
          await this.create(tenantId, 'system', {
            transactionId: item.transaction.id,
            targetType: item.suggestion.targetType as ReconciliationTargetType,
            targetId: item.suggestion.targetId,
            notes: `Auto-match (score: ${item.suggestion.confidenceScore})`,
          });
          matched.push(item.id);
        } catch {
          skipped.push(item.id);
        }
      } else {
        skipped.push(item.id);
      }
    }

    return {
      matched: matched.length,
      skipped: skipped.length,
      total: queue.items.length,
    };
  }

  /**
   * Get reconciliation history
   */
  async getHistory(tenantId: string, condominiumId: string, filters?: { from?: string; to?: string }) {
    const accounts = await db
      .select({ id: bankAccounts.id })
      .from(bankAccounts)
      .where(and(
        eq(bankAccounts.tenantId, tenantId),
        eq(bankAccounts.condominiumId, condominiumId)
      ));

    if (accounts.length === 0) {
      return [];
    }

    const conditions = [
      eq(reconciliations.tenantId, tenantId),
      eq(reconciliations.status, 'confirmed'),
    ];

    const history = await db
      .select({
        id: reconciliations.id,
        transactionId: reconciliations.bankTransactionId,
        targetType: reconciliations.targetType,
        paymentId: reconciliations.paymentId,
        invoiceId: reconciliations.invoiceId,
        utilityBillId: reconciliations.utilityBillId,
        fundCallItemId: reconciliations.fundCallItemId,
        matchType: reconciliations.matchType,
        confidenceScore: reconciliations.confidenceScore,
        matchedAt: reconciliations.matchedAt,
        notes: reconciliations.notes,
        txAmount: bankTransactions.amount,
        txDate: bankTransactions.transactionDate,
        txLabel: bankTransactions.simplifiedWording,
      })
      .from(reconciliations)
      .innerJoin(bankTransactions, eq(bankTransactions.id, reconciliations.bankTransactionId))
      .where(and(...conditions))
      .orderBy(desc(reconciliations.matchedAt))
      .limit(100);

    return history.map(h => ({
      id: h.id,
      transaction: {
        id: h.transactionId,
        amount: Number(h.txAmount),
        date: h.txDate,
        label: h.txLabel,
      },
      target: {
        type: h.targetType,
        id: h.paymentId || h.invoiceId || h.utilityBillId || h.fundCallItemId,
      },
      matchType: h.matchType,
      confidenceScore: h.confidenceScore,
      matchedAt: h.matchedAt,
      notes: h.notes,
    }));
  }

  /**
   * Helper: Get target details for display
   */
  private async getTargetDetails(tenantId: string, targetType: ReconciliationTargetType, targetId: string) {
    switch (targetType) {
      case ReconciliationTargetType.INVOICE:
        const inv = await db.query.invoices.findFirst({
          where: eq(invoices.id, targetId),
        });
        return inv ? {
          label: `${inv.supplierName} - ${inv.invoiceNumber || 'Facture'}`,
          amount: Number(inv.amountTtc),
          date: inv.issueDate,
        } : null;

      case ReconciliationTargetType.UTILITY_BILL:
        const bill = await db.query.utilityBills.findFirst({
          where: eq(utilityBills.id, targetId),
        });
        return bill ? {
          label: `${bill.utilityType} - ${bill.supplierName || 'Facture consommation'}`,
          amount: Number(bill.totalAmount),
          date: bill.periodStart,
        } : null;

      case ReconciliationTargetType.FUND_CALL_ITEM:
        const item = await db
          .select({
            amount: fundCallItems.amount,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(fundCallItems)
          .innerJoin(ownerCondominiums, eq(ownerCondominiums.id, fundCallItems.ownerCondominiumId))
          .innerJoin(users, eq(users.id, ownerCondominiums.ownerId))
          .where(eq(fundCallItems.id, targetId))
          .limit(1);
        
        return item.length > 0 ? {
          label: `Appel de fonds - ${item[0].firstName} ${item[0].lastName}`,
          amount: Number(item[0].amount),
          date: null,
        } : null;

      case ReconciliationTargetType.PAYMENT:
        const pmt = await db
          .select({
            amount: payments.amount,
            description: payments.description,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(payments)
          .innerJoin(users, eq(users.id, payments.ownerId))
          .where(eq(payments.id, targetId))
          .limit(1);
        
        return pmt.length > 0 ? {
          label: `${pmt[0].description || 'Paiement'} - ${pmt[0].firstName} ${pmt[0].lastName}`,
          amount: Number(pmt[0].amount),
          date: null,
        } : null;

      default:
        return null;
    }
  }
}
