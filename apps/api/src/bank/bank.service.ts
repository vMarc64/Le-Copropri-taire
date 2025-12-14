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
        accountType: bankAccounts.accountType,
        accountNumber: bankAccounts.accountNumber,
        iban: bankAccounts.iban,
        bic: bankAccounts.bic,
        balance: bankAccounts.balance,
        comingBalance: bankAccounts.comingBalance,
        currency: bankAccounts.currency,
        lastSyncAt: bankAccounts.lastSyncAt,
        status: bankAccounts.status,
        isMain: bankAccounts.isMain,
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
      accountType: acc.accountType || 'checking',
      accountNumber: acc.accountNumber || '',
      iban: acc.iban || '',
      bic: acc.bic || '',
      balance: parseFloat(acc.balance?.toString() || '0'),
      comingBalance: acc.comingBalance ? parseFloat(acc.comingBalance.toString()) : null,
      currency: acc.currency || 'EUR',
      lastSyncAt: acc.lastSyncAt?.toISOString() || null,
      status: acc.status,
      isMain: acc.isMain || false,
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

  async syncTransactionsFromPowens(tenantId: string, condominiumId: string, powensService: any) {
    // Get the Powens connection for this condominium
    const connection = await this.findPowensConnectionByCondominiumId(condominiumId, tenantId);
    
    if (!connection || !connection.accessToken) {
      throw new Error('No active Powens connection found for this condominium');
    }

    // Get bank accounts for this connection
    const accounts = await db
      .select()
      .from(bankAccounts)
      .where(
        and(
          eq(bankAccounts.condominiumId, condominiumId),
          eq(bankAccounts.tenantId, tenantId)
        )
      );

    if (accounts.length === 0) {
      throw new Error('No bank accounts found for this condominium');
    }

    // Force sync the connection first
    if (connection.powensConnectionId) {
      try {
        await powensService.syncConnection(connection.accessToken, connection.powensConnectionId);
      } catch (error) {
        console.error('Failed to sync connection:', error);
      }
    }

    // Fetch and store transactions for each account
    let totalNewTransactions = 0;
    
    for (const account of accounts) {
      if (!account.powensAccountId) continue;

      try {
        const transactionsResult = await powensService.getTransactionsByAccount(
          connection.accessToken, 
          account.powensAccountId,
          { limit: 50 }
        );

        for (const tx of transactionsResult.transactions) {
          // Check if transaction already exists
          const existing = await db
            .select({ id: bankTransactions.id })
            .from(bankTransactions)
            .where(eq(bankTransactions.powensTransactionId, tx.id))
            .limit(1);

          if (existing.length === 0) {
            // Insert new transaction
            await db.insert(bankTransactions).values({
              tenantId,
              bankAccountId: account.id,
              powensTransactionId: tx.id,
              amount: tx.value?.toString() || '0',
              originalWording: tx.original_wording || '',
              simplifiedWording: tx.simplified_wording || '',
              description: tx.wording || tx.simplified_wording || '',
              counterpartyName: tx.simplified_wording || tx.wording || '',
              transactionDate: tx.date,
              valueDate: tx.vdate,
              applicationDate: tx.application_date,
              powensCategoryId: tx.id_category,
              type: tx.type || 'unknown',
              direction: tx.value >= 0 ? 'credit' : 'debit',
              isComing: tx.coming || false,
              reconciliationStatus: 'unmatched',
            });
            totalNewTransactions++;
          }
        }

        // Update account balance and last sync
        await db
          .update(bankAccounts)
          .set({
            lastSyncAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(bankAccounts.id, account.id));
      } catch (error) {
        console.error(`Failed to fetch transactions for account ${account.id}:`, error);
      }
    }

    // Update connection last sync
    await db
      .update(powensConnections)
      .set({
        lastSyncAt: new Date(),
        lastSyncStatus: 'success',
        updatedAt: new Date(),
      })
      .where(eq(powensConnections.id, connection.id));

    return {
      success: true,
      newTransactions: totalNewTransactions,
      message: `Synchronisation terminée. ${totalNewTransactions} nouvelles transactions.`,
    };
  }
}
