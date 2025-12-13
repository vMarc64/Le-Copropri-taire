import { Injectable } from '@nestjs/common';
import { db } from '../database';
import { bankAccounts, bankTransactions, condominiums, powensConnections } from '../database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class BankService {
  async findAllAccounts(tenantId: string, condominiumId?: string) {
    let whereClause = eq(bankAccounts.tenantId, tenantId);
    
    if (condominiumId) {
      whereClause = and(
        eq(bankAccounts.tenantId, tenantId),
        eq(bankAccounts.condominiumId, condominiumId)
      )!;
    }

    const accounts = await db
      .select({
        id: bankAccounts.id,
        bankName: bankAccounts.bankName,
        accountName: bankAccounts.accountName,
        iban: bankAccounts.iban,
        balance: bankAccounts.balance,
        lastSyncAt: bankAccounts.lastSyncAt,
        status: bankAccounts.status,
        condominiumId: bankAccounts.condominiumId,
        condominiumName: condominiums.name,
      })
      .from(bankAccounts)
      .leftJoin(condominiums, eq(bankAccounts.condominiumId, condominiums.id))
      .where(whereClause);

    return accounts.map((acc) => ({
      id: acc.id,
      bankName: acc.bankName || '',
      accountName: acc.accountName || '',
      iban: acc.iban || '',
      balance: parseFloat(acc.balance?.toString() || '0'),
      lastSyncAt: acc.lastSyncAt?.toISOString() || null,
      status: acc.status,
      condominiumId: acc.condominiumId || '',
      condominiumName: acc.condominiumName || '',
    }));
  }

  async findAllTransactions(tenantId: string, accountId?: string, condominiumId?: string) {
    // First get accounts if filtering by condominium
    let accountIds: string[] = [];
    
    if (condominiumId) {
      const accounts = await db
        .select({ id: bankAccounts.id })
        .from(bankAccounts)
        .where(
          and(
            eq(bankAccounts.tenantId, tenantId),
            eq(bankAccounts.condominiumId, condominiumId)
          )
        );
      accountIds = accounts.map((a) => a.id);
    }

    let query = db
      .select({
        id: bankTransactions.id,
        bankAccountId: bankTransactions.bankAccountId,
        amount: bankTransactions.amount,
        description: bankTransactions.description,
        counterpartyName: bankTransactions.counterpartyName,
        transactionDate: bankTransactions.transactionDate,
        reconciliationStatus: bankTransactions.reconciliationStatus,
        category: bankTransactions.category,
        type: bankTransactions.type,
      })
      .from(bankTransactions)
      .where(eq(bankTransactions.tenantId, tenantId))
      .orderBy(desc(bankTransactions.transactionDate));

    if (accountId) {
      query = db
        .select({
          id: bankTransactions.id,
          bankAccountId: bankTransactions.bankAccountId,
          amount: bankTransactions.amount,
          description: bankTransactions.description,
          counterpartyName: bankTransactions.counterpartyName,
          transactionDate: bankTransactions.transactionDate,
          reconciliationStatus: bankTransactions.reconciliationStatus,
          category: bankTransactions.category,
          type: bankTransactions.type,
        })
        .from(bankTransactions)
        .where(
          and(
            eq(bankTransactions.tenantId, tenantId),
            eq(bankTransactions.bankAccountId, accountId)
          )
        )
        .orderBy(desc(bankTransactions.transactionDate));
    }

    const transactions = await query;

    // Filter by condominium if needed
    let filtered = transactions;
    if (condominiumId && accountIds.length > 0) {
      filtered = transactions.filter((tx) => accountIds.includes(tx.bankAccountId));
    }

    return filtered.map((tx) => {
      const amount = parseFloat(tx.amount?.toString() || '0');
      return {
        id: tx.id,
        bankAccountId: tx.bankAccountId,
        amount: amount,
        type: amount >= 0 ? 'credit' : 'debit',
        description: tx.description || '',
        counterpartyName: tx.counterpartyName || null,
        transactionDate: tx.transactionDate,
        reconciliationStatus: tx.reconciliationStatus,
        category: tx.category || null,
      };
    });
  }

  async findOneAccount(id: string, tenantId: string) {
    const account = await db
      .select()
      .from(bankAccounts)
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.tenantId, tenantId)))
      .limit(1);

    return account[0] || null;
  }

  // ============ POWENS CONNECTION MANAGEMENT ============

  async createPowensConnection(data: {
    tenantId: string;
    condominiumId: string;
    accessToken: string;
    powensUserId?: number;
    powensConnectionId?: number;
    powensConnectorId?: number;
    bankName?: string;
  }) {
    const [connection] = await db
      .insert(powensConnections)
      .values({
        tenantId: data.tenantId,
        condominiumId: data.condominiumId,
        accessToken: data.accessToken,
        powensUserId: data.powensUserId,
        powensConnectionId: data.powensConnectionId,
        powensConnectorId: data.powensConnectorId,
        bankName: data.bankName,
        status: 'active',
      })
      .returning();

    return connection;
  }

  async createBankAccount(data: {
    tenantId: string;
    condominiumId: string;
    powensConnectionId: string;
    powensAccountId?: number;
    bankName?: string;
    accountName?: string;
    accountType?: string;
    accountNumber?: string;
    iban?: string;
    bic?: string;
    balance?: number;
    currency?: string;
  }) {
    const [account] = await db
      .insert(bankAccounts)
      .values({
        tenantId: data.tenantId,
        condominiumId: data.condominiumId,
        powensConnectionId: data.powensConnectionId,
        powensAccountId: data.powensAccountId,
        bankName: data.bankName,
        accountName: data.accountName,
        accountType: data.accountType,
        accountNumber: data.accountNumber,
        iban: data.iban,
        bic: data.bic,
        balance: data.balance?.toString(),
        currency: data.currency || 'EUR',
        isMain: true, // First account is main by default
        status: 'active',
        lastSyncAt: new Date(),
      })
      .returning();

    return account;
  }

  async findPowensConnectionByCondominiumId(condominiumId: string, tenantId: string) {
    const connection = await db
      .select()
      .from(powensConnections)
      .where(
        and(
          eq(powensConnections.condominiumId, condominiumId),
          eq(powensConnections.tenantId, tenantId),
          eq(powensConnections.status, 'active')
        )
      )
      .limit(1);

    return connection[0] || null;
  }
}
