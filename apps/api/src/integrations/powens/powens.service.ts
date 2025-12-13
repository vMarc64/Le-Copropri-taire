import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Powens Service (Open Banking / PSD2)
 * 
 * Connects to the Powens sandbox/production API for:
 * - Bank account aggregation via DSP2/Open Banking
 * - Real-time transaction sync
 * - Account balance monitoring
 * - Multi-bank support
 * 
 * API Documentation: https://docs.powens.com/api-reference
 */

export interface PowensUser {
  id: number;
  signin: string;
  platform: string;
}

export interface PowensConnection {
  id: number;
  id_user: number;
  id_connector: number;
  state: 'SCARequired' | 'decoupled' | 'addionalInformationNeeded' | 'validating' | 'actionNeeded' | 'passwordExpired' | 'rateLimiting' | 'websiteUnavailable' | 'wrongpass' | 'bug' | null;
  error: string | null;
  error_message: string | null;
  last_update: string | null;
  created: string;
  active: boolean;
  connector?: PowensConnector;
}

export interface PowensConnector {
  id: number;
  name: string;
  uuid: string;
  auth_mechanism: string;
  capabilities: string[];
  country?: { id: string; name: string };
}

export interface PowensAccount {
  id: number;
  id_connection: number;
  id_user: number;
  id_parent: number | null;
  number: string;
  original_name: string;
  name: string;
  balance: number;
  coming: number;
  display: boolean;
  last_update: string;
  type: 'checking' | 'savings' | 'deposit' | 'loan' | 'market' | 'joint' | 'card' | 'lifeinsurance' | 'pee' | 'perco' | 'article83' | 'rsp' | 'pea' | 'capitalisation' | 'perp' | 'madelin' | 'unknown';
  currency: { id: string; symbol: string; prefix: boolean; crypto: boolean; precision: number; marketcap: number | null; datetime: string | null };
  iban: string | null;
  bic: string | null;
  disabled: string | null;
  company_name: string | null;
}

export interface PowensTransaction {
  id: number;
  id_account: number;
  webid: string;
  date: string;
  rdate: string;
  value: number;
  gross_value: number | null;
  original_wording: string;
  simplified_wording: string;
  type: 'transfer' | 'order' | 'check' | 'deposit' | 'payback' | 'withdrawal' | 'card' | 'loan_payment' | 'bank' | 'deferred_card' | 'unknown';
  id_category: number | null;
  state: 'new' | 'done' | 'coming' | 'canceled';
  coming: boolean;
  active: boolean;
  comment: string | null;
}

export interface PowensAuthToken {
  access_token: string;
  token_type: string;
  id_user?: number;
  expires_in?: number;
}

export interface CreateConnectionOptions {
  id_connector: number;
  credentials?: Record<string, string>;
}

@Injectable()
export class PowensService {
  private readonly logger = new Logger(PowensService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly domain: string;
  private readonly redirectUri: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('POWENS_BASE_URL', 'https://demo.biapi.pro/2.0');
    this.clientId = this.configService.get<string>('POWENS_CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>('POWENS_CLIENT_SECRET', '');
    this.domain = this.configService.get<string>('POWENS_DOMAIN', 'demo');
    const apiUrl = this.configService.get<string>('API_URL', 'http://localhost:3002');
    const redirectPath = this.configService.get<string>('POWENS_REDIRECT_URI', '/powens/callback');
    this.redirectUri = `${apiUrl}${redirectPath}`;
    
    if (!this.clientId || !this.clientSecret) {
      this.logger.warn('Powens credentials not configured. Set POWENS_CLIENT_ID and POWENS_CLIENT_SECRET in .env');
    } else {
      this.logger.log(`Powens Service initialized for domain: ${this.domain}`);
    }
  }

  /**
   * Make authenticated request to Powens API
   */
  private async request<T>(
    method: string,
    path: string,
    options: {
      token?: string;
      body?: Record<string, unknown>;
      params?: Record<string, string>;
    } = {},
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        this.logger.error(`Powens API error: ${response.status}`, error);
        throw new HttpException(
          error.message || `Powens API error: ${response.status}`,
          response.status,
        );
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Powens request failed', error);
      throw new HttpException('Powens service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  // ============================================
  // Authentication
  // ============================================

  /**
   * Create a new Powens user and get an access token
   * This is the first step for any new user wanting to connect their bank
   */
  async createUser(): Promise<PowensAuthToken> {
    return this.request<PowensAuthToken>('POST', '/auth/init', {
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
      },
    });
  }

  /**
   * Generate a permanent token for an existing user
   */
  async renewToken(userId: number): Promise<PowensAuthToken> {
    return this.request<PowensAuthToken>('POST', '/auth/renew', {
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        id_user: userId,
      },
    });
  }

  /**
   * Exchange a temporary code for a permanent access token
   * This is called after the user completes the webview flow
   */
  async exchangeCode(code: string): Promise<PowensAuthToken> {
    return this.request<PowensAuthToken>('POST', '/auth/token/access', {
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      },
    });
  }

  /**
   * Generate a temporary code for webview authentication
   */
  async generateWebviewCode(accessToken: string): Promise<{ code: string; expires_in: number }> {
    return this.request<{ code: string; expires_in: number }>('GET', '/auth/token/code', {
      token: accessToken,
      params: { type: 'singleAccess' },
    });
  }

  // ============================================
  // Connectors (Banks)
  // ============================================

  /**
   * Get list of available bank connectors
   */
  async getConnectors(accessToken: string, options?: { 
    country?: string; 
    capabilities?: string[];
  }): Promise<{ connectors: PowensConnector[] }> {
    const params: Record<string, string> = {};
    if (options?.country) params.country = options.country;
    if (options?.capabilities) params.capabilities = options.capabilities.join(',');
    
    return this.request<{ connectors: PowensConnector[] }>('GET', '/connectors', {
      token: accessToken,
      params,
    });
  }

  /**
   * Get a specific connector by ID
   */
  async getConnector(accessToken: string, connectorId: number): Promise<PowensConnector> {
    return this.request<PowensConnector>('GET', `/connectors/${connectorId}`, {
      token: accessToken,
    });
  }

  // ============================================
  // Connections
  // ============================================

  /**
   * Create a new bank connection for a user
   */
  async createConnection(
    accessToken: string,
    options: CreateConnectionOptions,
  ): Promise<PowensConnection> {
    return this.request<PowensConnection>('POST', '/users/me/connections', {
      token: accessToken,
      body: options as unknown as Record<string, unknown>,
    });
  }

  /**
   * Get all connections for the authenticated user
   */
  async getConnections(accessToken: string): Promise<{ connections: PowensConnection[] }> {
    return this.request<{ connections: PowensConnection[] }>('GET', '/users/me/connections', {
      token: accessToken,
      params: { expand: 'connector' },
    });
  }

  /**
   * Get a specific connection
   */
  async getConnection(accessToken: string, connectionId: number): Promise<PowensConnection> {
    return this.request<PowensConnection>('GET', `/users/me/connections/${connectionId}`, {
      token: accessToken,
      params: { expand: 'connector,accounts' },
    });
  }

  /**
   * Update connection credentials (for SCA or password update)
   */
  async updateConnection(
    accessToken: string,
    connectionId: number,
    credentials: Record<string, string>,
  ): Promise<PowensConnection> {
    return this.request<PowensConnection>('POST', `/users/me/connections/${connectionId}`, {
      token: accessToken,
      body: credentials,
    });
  }

  /**
   * Force sync of a connection
   */
  async syncConnection(accessToken: string, connectionId: number): Promise<PowensConnection> {
    return this.request<PowensConnection>('PUT', `/users/me/connections/${connectionId}`, {
      token: accessToken,
    });
  }

  /**
   * Delete a connection
   */
  async deleteConnection(accessToken: string, connectionId: number): Promise<void> {
    await this.request<void>('DELETE', `/users/me/connections/${connectionId}`, {
      token: accessToken,
    });
  }

  // ============================================
  // Accounts
  // ============================================

  /**
   * Get all accounts for the authenticated user
   */
  async getAccounts(accessToken: string): Promise<{ accounts: PowensAccount[] }> {
    return this.request<{ accounts: PowensAccount[] }>('GET', '/users/me/accounts', {
      token: accessToken,
    });
  }

  /**
   * Get accounts for a specific connection
   */
  async getAccountsByConnection(
    accessToken: string,
    connectionId: number,
  ): Promise<{ accounts: PowensAccount[] }> {
    return this.request<{ accounts: PowensAccount[] }>(
      'GET',
      `/users/me/connections/${connectionId}/accounts`,
      { token: accessToken },
    );
  }

  /**
   * Get a specific account
   */
  async getAccount(accessToken: string, accountId: number): Promise<PowensAccount> {
    return this.request<PowensAccount>('GET', `/users/me/accounts/${accountId}`, {
      token: accessToken,
    });
  }

  /**
   * Update account settings (name, display)
   */
  async updateAccount(
    accessToken: string,
    accountId: number,
    updates: { name?: string; display?: boolean },
  ): Promise<PowensAccount> {
    return this.request<PowensAccount>('PUT', `/users/me/accounts/${accountId}`, {
      token: accessToken,
      body: updates,
    });
  }

  // ============================================
  // Transactions
  // ============================================

  /**
   * Get transactions for the authenticated user
   */
  async getTransactions(
    accessToken: string,
    options?: {
      min_date?: string;
      max_date?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ transactions: PowensTransaction[] }> {
    const params: Record<string, string> = {};
    if (options?.min_date) params.min_date = options.min_date;
    if (options?.max_date) params.max_date = options.max_date;
    if (options?.limit) params.limit = options.limit.toString();
    if (options?.offset) params.offset = options.offset.toString();

    return this.request<{ transactions: PowensTransaction[] }>('GET', '/users/me/transactions', {
      token: accessToken,
      params,
    });
  }

  /**
   * Get transactions for a specific account
   */
  async getTransactionsByAccount(
    accessToken: string,
    accountId: number,
    options?: {
      min_date?: string;
      max_date?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ transactions: PowensTransaction[] }> {
    const params: Record<string, string> = {};
    if (options?.min_date) params.min_date = options.min_date;
    if (options?.max_date) params.max_date = options.max_date;
    if (options?.limit) params.limit = options.limit.toString();
    if (options?.offset) params.offset = options.offset.toString();

    return this.request<{ transactions: PowensTransaction[] }>(
      'GET',
      `/users/me/accounts/${accountId}/transactions`,
      { token: accessToken, params },
    );
  }

  // ============================================
  // Webview URL Generation
  // ============================================

  /**
   * Generate the URL for the Powens webview (bank connection flow)
   * Uses the official Powens webview at webview.powens.com
   * 
   * @param redirectUri - Optional: URL to redirect after connection (uses config default if not provided)
   * @param connectorId - Optional: pre-select a specific bank
   */
  getWebviewConnectUrl(redirectUri?: string, connectorId?: number): string {
    const params = new URLSearchParams({
      domain: `${this.domain}.biapi.pro`,
      client_id: this.clientId,
      redirect_uri: redirectUri || this.redirectUri,
    });

    if (connectorId) {
      params.append('connector_ids', connectorId.toString());
    }

    return `https://webview.powens.com/connect?${params.toString()}`;
  }

  /**
   * Generate the URL for the Powens webview with state parameter
   * The state will be returned unchanged in the callback
   * 
   * @param redirectUri - URL to redirect after connection
   * @param state - State parameter to pass through the callback (e.g., base64-encoded JSON)
   * @param connectorId - Optional: pre-select a specific bank
   */
  getWebviewConnectUrlWithState(redirectUri: string, state: string, connectorId?: number): string {
    const params = new URLSearchParams({
      domain: `${this.domain}.biapi.pro`,
      client_id: this.clientId,
      redirect_uri: redirectUri,
      state,
    });

    if (connectorId) {
      params.append('connector_ids', connectorId.toString());
    }

    return `https://webview.powens.com/connect?${params.toString()}`;
  }

  /**
   * Generate the URL for the Powens webview with a temporary code
   * 
   * @param code - Temporary code from generateWebviewCode()
   * @param redirectUri - URL to redirect after connection
   * @param connectorId - Optional: pre-select a specific bank
   */
  getWebviewUrl(code: string, redirectUri: string, connectorId?: number): string {
    const params = new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      client_id: this.clientId,
    });

    if (connectorId) {
      params.append('connector_ids', connectorId.toString());
    }

    return `https://webview.powens.com/connect?domain=${this.domain}.biapi.pro&${params.toString()}`;
  }

  /**
   * Generate URL to manage existing connections
   */
  getManageWebviewUrl(code: string, redirectUri: string): string {
    const params = new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      client_id: this.clientId,
    });

    return `https://webview.powens.com/manage?domain=${this.domain}.biapi.pro&${params.toString()}`;
  }

  /**
   * Get the default redirect URI configured
   */
  getDefaultRedirectUri(): string {
    return this.redirectUri;
  }

  // ============================================
  // Health Check
  // ============================================

  /**
   * Check if Powens API is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/connectors?limit=1`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}
