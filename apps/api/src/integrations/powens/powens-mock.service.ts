import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * Mock Powens Service (Open Banking / PSD2)
 * 
 * Powens (formerly Budget Insight) provides:
 * - Bank account aggregation via DSP2/Open Banking
 * - Real-time transaction sync
 * - Account balance monitoring
 * - Multi-bank support
 * 
 * This mock service simulates the Powens API for development.
 * Replace with real Powens SDK in production.
 * 
 * Key concepts:
 * - Connection: Link to a user's bank (requires OAuth flow)
 * - Account: Bank account retrieved from connection
 * - Transaction: Individual transaction on an account
 */

export interface PowensConnection {
  id: string;
  id_user: string;
  id_bank: string;
  bank_name: string;
  state: 'pending' | 'syncing' | 'connected' | 'error' | 'disconnected';
  last_sync: string | null;
  created: string;
  error_message: string | null;
}

export interface PowensAccount {
  id: string;
  id_connection: string;
  id_user: string;
  name: string;
  number: string; // masked
  iban: string | null;
  type: 'checking' | 'savings' | 'loan' | 'card' | 'other';
  balance: number;
  currency: string;
  last_update: string;
  disabled: boolean;
}

export interface PowensTransaction {
  id: string;
  id_account: string;
  date: string;
  rdate: string; // real/value date
  value: number;
  original_wording: string;
  simplified_wording: string;
  category: {
    id: number;
    name: string;
  } | null;
  type: 'transfer' | 'card' | 'withdrawal' | 'check' | 'deferred_card' | 'loan_payment' | 'order' | 'unknown';
  id_category: number | null;
  coming: boolean; // pending transaction
  active: boolean;
}

export interface PowensBank {
  id: string;
  name: string;
  logo_url: string;
  country: string;
  capabilities: string[];
}

export interface CreateConnectionDto {
  userId: string;
  bankId: string;
  credentials?: {
    login?: string;
    password?: string;
  };
}

export interface SyncConnectionDto {
  connectionId: string;
}

@Injectable()
export class PowensMockService {
  private readonly logger = new Logger(PowensMockService.name);

  // In-memory storage for mock data
  private connections: Map<string, PowensConnection> = new Map();
  private accounts: Map<string, PowensAccount> = new Map();
  private transactions: Map<string, PowensTransaction> = new Map();
  private banks: Map<string, PowensBank> = new Map();

  constructor() {
    this.logger.log('Powens Mock Service initialized (DEVELOPMENT MODE)');
    this.seedMockData();
  }

  private seedMockData() {
    // Available banks
    const banksList: PowensBank[] = [
      {
        id: 'bank_bnp',
        name: 'BNP Paribas',
        logo_url: 'https://example.com/bnp.png',
        country: 'FR',
        capabilities: ['accounts', 'transactions', 'identity'],
      },
      {
        id: 'bank_sg',
        name: 'Société Générale',
        logo_url: 'https://example.com/sg.png',
        country: 'FR',
        capabilities: ['accounts', 'transactions'],
      },
      {
        id: 'bank_ca',
        name: 'Crédit Agricole',
        logo_url: 'https://example.com/ca.png',
        country: 'FR',
        capabilities: ['accounts', 'transactions', 'identity'],
      },
      {
        id: 'bank_lcl',
        name: 'LCL',
        logo_url: 'https://example.com/lcl.png',
        country: 'FR',
        capabilities: ['accounts', 'transactions'],
      },
      {
        id: 'bank_bp',
        name: 'Banque Populaire',
        logo_url: 'https://example.com/bp.png',
        country: 'FR',
        capabilities: ['accounts', 'transactions'],
      },
    ];
    banksList.forEach((b) => this.banks.set(b.id, b));

    // Sample connection
    const conn1: PowensConnection = {
      id: 'conn_mock_001',
      id_user: 'user_001',
      id_bank: 'bank_bnp',
      bank_name: 'BNP Paribas',
      state: 'connected',
      last_sync: new Date().toISOString(),
      created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      error_message: null,
    };
    this.connections.set(conn1.id, conn1);

    // Sample accounts
    const acc1: PowensAccount = {
      id: 'acc_mock_001',
      id_connection: 'conn_mock_001',
      id_user: 'user_001',
      name: 'Compte Courant Copropriété Les Lilas',
      number: '****3456',
      iban: 'FR7630004000031234567890143',
      type: 'checking',
      balance: 45678.50,
      currency: 'EUR',
      last_update: new Date().toISOString(),
      disabled: false,
    };
    this.accounts.set(acc1.id, acc1);

    const acc2: PowensAccount = {
      id: 'acc_mock_002',
      id_connection: 'conn_mock_001',
      id_user: 'user_001',
      name: 'Compte Travaux',
      number: '****7890',
      iban: 'FR7630004000037890123456712',
      type: 'savings',
      balance: 125000.00,
      currency: 'EUR',
      last_update: new Date().toISOString(),
      disabled: false,
    };
    this.accounts.set(acc2.id, acc2);

    // Sample transactions
    const transactionData = [
      {
        date: '2025-12-15',
        value: 450.00,
        wording: 'VIREMENT DUPONT JEAN CHARGES Q4',
        type: 'transfer' as const,
        category: { id: 1, name: 'Charges copropriété' },
      },
      {
        date: '2025-12-14',
        value: 380.00,
        wording: 'VIREMENT MARTIN MARIE CHARGES Q4',
        type: 'transfer' as const,
        category: { id: 1, name: 'Charges copropriété' },
      },
      {
        date: '2025-12-10',
        value: -2500.00,
        wording: 'PRLV ENGIE GAZ COMMUNS',
        type: 'transfer' as const,
        category: { id: 2, name: 'Énergie' },
      },
      {
        date: '2025-12-08',
        value: -850.00,
        wording: 'VIR SEPA CLEAN SERVICES NETTOYAGE DEC',
        type: 'transfer' as const,
        category: { id: 3, name: 'Entretien' },
      },
      {
        date: '2025-12-05',
        value: 520.00,
        wording: 'VIREMENT BERNARD PIERRE CHARGES Q4',
        type: 'transfer' as const,
        category: { id: 1, name: 'Charges copropriété' },
      },
      {
        date: '2025-12-01',
        value: -1200.00,
        wording: 'PRLV ASSURANCE MMA IMMEUBLE',
        type: 'transfer' as const,
        category: { id: 4, name: 'Assurance' },
      },
      {
        date: '2025-11-28',
        value: 650.00,
        wording: 'VIREMENT LEFEBVRE ANNE CHARGES Q4',
        type: 'transfer' as const,
        category: { id: 1, name: 'Charges copropriété' },
      },
      {
        date: '2025-11-25',
        value: -3200.00,
        wording: 'VIR SEPA ASCENSEUR KONÉ MAINTENANCE',
        type: 'transfer' as const,
        category: { id: 5, name: 'Ascenseur' },
      },
    ];

    transactionData.forEach((t, index) => {
      const tx: PowensTransaction = {
        id: `tx_mock_${String(index + 1).padStart(3, '0')}`,
        id_account: 'acc_mock_001',
        date: t.date,
        rdate: t.date,
        value: t.value,
        original_wording: t.wording,
        simplified_wording: t.wording.split(' ').slice(0, 4).join(' '),
        category: t.category,
        type: t.type,
        id_category: t.category?.id || null,
        coming: false,
        active: true,
      };
      this.transactions.set(tx.id, tx);
    });

    this.logger.debug('Mock data seeded');
  }

  // ============ BANKS ============

  async listBanks(country = 'FR'): Promise<PowensBank[]> {
    return Array.from(this.banks.values()).filter((b) => b.country === country);
  }

  async getBank(bankId: string): Promise<PowensBank | null> {
    return this.banks.get(bankId) || null;
  }

  // ============ CONNECTIONS ============

  async createConnection(dto: CreateConnectionDto): Promise<{ connection: PowensConnection; auth_url?: string }> {
    const bank = this.banks.get(dto.bankId);
    if (!bank) throw new Error('Bank not found');

    const connection: PowensConnection = {
      id: `conn_${randomUUID().slice(0, 14)}`,
      id_user: dto.userId,
      id_bank: dto.bankId,
      bank_name: bank.name,
      state: 'pending',
      last_sync: null,
      created: new Date().toISOString(),
      error_message: null,
    };
    this.connections.set(connection.id, connection);
    this.logger.debug(`Created mock connection: ${connection.id}`);

    // Simulate OAuth redirect URL (in reality, user would authenticate with bank)
    const authUrl = `https://mock-bank-oauth.example.com/authorize?connection_id=${connection.id}`;

    // Simulate connection activation
    setTimeout(() => {
      connection.state = 'syncing';
      this.connections.set(connection.id, connection);
      this.logger.debug(`Connection ${connection.id} syncing`);

      setTimeout(() => {
        connection.state = 'connected';
        connection.last_sync = new Date().toISOString();
        this.connections.set(connection.id, connection);
        this.logger.debug(`Connection ${connection.id} connected`);

        // Create mock accounts for new connection
        this.createMockAccountsForConnection(connection.id, dto.userId);
      }, 2000);
    }, 1000);

    return { connection, auth_url: authUrl };
  }

  private createMockAccountsForConnection(connectionId: string, userId: string) {
    const acc: PowensAccount = {
      id: `acc_${randomUUID().slice(0, 14)}`,
      id_connection: connectionId,
      id_user: userId,
      name: 'Compte Courant',
      number: `****${Math.floor(1000 + Math.random() * 9000)}`,
      iban: `FR76${Math.floor(10000000000000000000000 + Math.random() * 90000000000000000000000)}`.slice(0, 27),
      type: 'checking',
      balance: Math.round((5000 + Math.random() * 50000) * 100) / 100,
      currency: 'EUR',
      last_update: new Date().toISOString(),
      disabled: false,
    };
    this.accounts.set(acc.id, acc);
    this.logger.debug(`Created mock account ${acc.id} for connection ${connectionId}`);
  }

  async getConnection(connectionId: string): Promise<PowensConnection | null> {
    return this.connections.get(connectionId) || null;
  }

  async listConnections(userId?: string): Promise<PowensConnection[]> {
    const all = Array.from(this.connections.values());
    return userId ? all.filter((c) => c.id_user === userId) : all;
  }

  async syncConnection(connectionId: string): Promise<PowensConnection> {
    const connection = this.connections.get(connectionId);
    if (!connection) throw new Error('Connection not found');

    if (connection.state !== 'connected') {
      throw new Error(`Cannot sync connection with state: ${connection.state}`);
    }

    connection.state = 'syncing';
    this.connections.set(connectionId, connection);
    this.logger.debug(`Syncing connection ${connectionId}`);

    // Simulate sync
    setTimeout(() => {
      connection.state = 'connected';
      connection.last_sync = new Date().toISOString();
      this.connections.set(connectionId, connection);

      // Add some new transactions
      this.generateRandomTransactions(connectionId);
      this.logger.debug(`Connection ${connectionId} sync complete`);
    }, 2000);

    return connection;
  }

  private generateRandomTransactions(connectionId: string) {
    const accounts = Array.from(this.accounts.values()).filter(
      (a) => a.id_connection === connectionId,
    );

    accounts.forEach((account) => {
      const tx: PowensTransaction = {
        id: `tx_${randomUUID().slice(0, 14)}`,
        id_account: account.id,
        date: new Date().toISOString().slice(0, 10),
        rdate: new Date().toISOString().slice(0, 10),
        value: Math.round((Math.random() * 2000 - 1000) * 100) / 100,
        original_wording: 'OPERATION RECENTE',
        simplified_wording: 'Opération récente',
        category: { id: 99, name: 'Autre' },
        type: 'transfer',
        id_category: 99,
        coming: false,
        active: true,
      };
      this.transactions.set(tx.id, tx);
    });
  }

  async deleteConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) throw new Error('Connection not found');

    // Delete associated accounts and transactions
    const accountIds = Array.from(this.accounts.values())
      .filter((a) => a.id_connection === connectionId)
      .map((a) => a.id);

    accountIds.forEach((accId) => {
      // Delete transactions for this account
      Array.from(this.transactions.values())
        .filter((t) => t.id_account === accId)
        .forEach((t) => this.transactions.delete(t.id));
      // Delete account
      this.accounts.delete(accId);
    });

    this.connections.delete(connectionId);
    this.logger.debug(`Deleted connection ${connectionId}`);
  }

  // ============ ACCOUNTS ============

  async getAccount(accountId: string): Promise<PowensAccount | null> {
    return this.accounts.get(accountId) || null;
  }

  async listAccounts(userId?: string, connectionId?: string): Promise<PowensAccount[]> {
    let accounts = Array.from(this.accounts.values());
    if (userId) accounts = accounts.filter((a) => a.id_user === userId);
    if (connectionId) accounts = accounts.filter((a) => a.id_connection === connectionId);
    return accounts;
  }

  async disableAccount(accountId: string): Promise<PowensAccount> {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error('Account not found');

    account.disabled = true;
    this.accounts.set(accountId, account);
    this.logger.debug(`Disabled account ${accountId}`);
    return account;
  }

  // ============ TRANSACTIONS ============

  async getTransaction(transactionId: string): Promise<PowensTransaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  async listTransactions(
    accountId?: string,
    options?: {
      min_date?: string;
      max_date?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<PowensTransaction[]> {
    let txs = Array.from(this.transactions.values());

    if (accountId) {
      txs = txs.filter((t) => t.id_account === accountId);
    }

    if (options?.min_date) {
      txs = txs.filter((t) => t.date >= options.min_date!);
    }
    if (options?.max_date) {
      txs = txs.filter((t) => t.date <= options.max_date!);
    }

    // Sort by date descending
    txs.sort((a, b) => b.date.localeCompare(a.date));

    if (options?.offset) {
      txs = txs.slice(options.offset);
    }
    if (options?.limit) {
      txs = txs.slice(0, options.limit);
    }

    return txs;
  }

  async categorizeTransaction(transactionId: string, categoryId: number, categoryName: string): Promise<PowensTransaction> {
    const tx = this.transactions.get(transactionId);
    if (!tx) throw new Error('Transaction not found');

    tx.id_category = categoryId;
    tx.category = { id: categoryId, name: categoryName };
    this.transactions.set(transactionId, tx);
    this.logger.debug(`Categorized transaction ${transactionId} as ${categoryName}`);
    return tx;
  }

  // ============ WEBHOOKS (simulated) ============

  simulateWebhook(
    type: 'connection.synced' | 'connection.error' | 'account.created' | 'transactions.created',
    data: Record<string, unknown>,
  ): { id: string; type: string; data: Record<string, unknown>; created: string } {
    return {
      id: `webhook_${randomUUID().slice(0, 14)}`,
      type,
      data,
      created: new Date().toISOString(),
    };
  }
}
