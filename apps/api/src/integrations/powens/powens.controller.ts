import { Controller, Get, Post, Body, Param, Delete, Query, Headers, HttpException, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PowensService } from './powens.service';
import { PowensMockService } from './powens-mock.service';
import { CreateConnectionDto } from './dto';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('powens')
export class PowensController {
  constructor(
    private readonly powensService: PowensService,
    private readonly powensMockService: PowensMockService,
  ) {}

  // ============ HEALTH & CONFIG ============

  @Public()
  @Get('health')
  async healthCheck() {
    const isConfigured = this.powensService.isConfigured();
    const isReachable = isConfigured ? await this.powensService.healthCheck() : false;
    
    return {
      configured: isConfigured,
      reachable: isReachable,
      mode: isConfigured ? 'sandbox' : 'mock',
    };
  }

  // ============ WEBVIEW CONNECT FLOW ============

  /**
   * Get the webview connect URL (direct, no code needed)
   * This is the simplest way to start a bank connection flow
   */
  @Public()
  @Get('connect')
  getConnectUrl(@Query('connector_id') connectorId?: string) {
    if (!this.powensService.isConfigured()) {
      throw new HttpException('Powens not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    const url = this.powensService.getWebviewConnectUrl(
      undefined,
      connectorId ? parseInt(connectorId, 10) : undefined,
    );
    return { url };
  }

  /**
   * Redirect directly to Powens webview
   */
  @Public()
  @Get('connect/redirect')
  redirectToConnect(
    @Res() res: Response,
    @Query('connector_id') connectorId?: string,
  ) {
    if (!this.powensService.isConfigured()) {
      throw new HttpException('Powens not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    const url = this.powensService.getWebviewConnectUrl(
      undefined,
      connectorId ? parseInt(connectorId, 10) : undefined,
    );
    res.redirect(url);
  }

  /**
   * Callback endpoint for Powens webview
   * Powens redirects here after user completes bank connection
   * Automatically exchanges the code for a permanent token
   */
  @Public()
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
    @Query('error_description') errorDescription?: string,
    @Query('connection_id') connectionId?: string,
  ) {
    if (error) {
      return {
        success: false,
        error,
        error_description: errorDescription,
      };
    }

    // Automatically exchange the code for a permanent access token
    try {
      const tokenResult = await this.powensService.exchangeCode(code);
      
      // In a real implementation, you would:
      // 1. Store the token in your database linked to the user
      // 2. Redirect to your frontend with success status
      
      return {
        success: true,
        message: 'Bank connection successful and token obtained!',
        connection_id: connectionId,
        state,
        access_token: tokenResult.access_token,
        token_type: tokenResult.token_type,
        id_user: tokenResult.id_user,
        note: 'Store this access_token to fetch accounts and transactions later.',
      };
    } catch (tokenError) {
      // If token exchange fails, return the code for manual exchange
      return {
        success: true,
        message: 'Bank connection successful but token exchange failed',
        code,
        connection_id: connectionId,
        state,
        token_error: tokenError.message,
        next_steps: [
          'Try exchanging the code manually using POST /powens/token',
        ],
      };
    }
  }

  /**
   * Exchange a temporary code for a permanent access token
   */
  @Public()
  @Post('token')
  async exchangeToken(@Body('code') code: string) {
    if (!this.powensService.isConfigured()) {
      throw new HttpException('Powens not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    if (!code) {
      throw new HttpException('Code is required', HttpStatus.BAD_REQUEST);
    }
    
    const result = await this.powensService.exchangeCode(code);
    
    return {
      success: true,
      access_token: result.access_token,
      token_type: result.token_type,
      id_user: result.id_user,
      message: 'Token obtained successfully. Use this token to fetch accounts and transactions.',
    };
  }

  // ============ SANDBOX API (Real Powens) ============

  /**
   * Create a new Powens user (sandbox)
   * Returns access token for subsequent API calls
   */
  @Post('sandbox/users')
  async createSandboxUser() {
    if (!this.powensService.isConfigured()) {
      throw new HttpException('Powens not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    return this.powensService.createUser();
  }

  /**
   * Get webview code for bank connection flow
   */
  @Post('sandbox/webview/code')
  async getWebviewCode(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.powensService.generateWebviewCode(token);
  }

  /**
   * Get webview URL for connecting a bank
   */
  @Post('sandbox/webview/url')
  async getWebviewUrl(
    @Body('code') code: string,
    @Body('redirect_uri') redirectUri: string,
    @Body('connector_id') connectorId?: number,
  ) {
    if (!this.powensService.isConfigured()) {
      throw new HttpException('Powens not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    const url = this.powensService.getWebviewUrl(code, redirectUri, connectorId);
    return { url };
  }

  /**
   * Get available bank connectors (sandbox)
   */
  @Get('sandbox/connectors')
  async getSandboxConnectors(
    @Headers('authorization') authHeader: string,
    @Query('country') country?: string,
  ) {
    const token = this.extractToken(authHeader);
    return this.powensService.getConnectors(token, { country });
  }

  /**
   * Get user's bank connections (sandbox)
   */
  @Get('sandbox/connections')
  async getSandboxConnections(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.powensService.getConnections(token);
  }

  /**
   * Get a specific connection (sandbox)
   */
  @Get('sandbox/connections/:id')
  async getSandboxConnection(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const token = this.extractToken(authHeader);
    return this.powensService.getConnection(token, parseInt(id, 10));
  }

  /**
   * Sync a connection (sandbox)
   */
  @Post('sandbox/connections/:id/sync')
  async syncSandboxConnection(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const token = this.extractToken(authHeader);
    return this.powensService.syncConnection(token, parseInt(id, 10));
  }

  /**
   * Delete a connection (sandbox)
   */
  @Delete('sandbox/connections/:id')
  async deleteSandboxConnection(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const token = this.extractToken(authHeader);
    await this.powensService.deleteConnection(token, parseInt(id, 10));
    return { success: true };
  }

  /**
   * Get user's bank accounts (sandbox)
   */
  @Get('sandbox/accounts')
  async getSandboxAccounts(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.powensService.getAccounts(token);
  }

  /**
   * Get a specific account (sandbox)
   */
  @Get('sandbox/accounts/:id')
  async getSandboxAccount(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const token = this.extractToken(authHeader);
    return this.powensService.getAccount(token, parseInt(id, 10));
  }

  /**
   * Get transactions (sandbox)
   */
  @Get('sandbox/transactions')
  async getSandboxTransactions(
    @Headers('authorization') authHeader: string,
    @Query('account_id') accountId?: string,
    @Query('min_date') minDate?: string,
    @Query('max_date') maxDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const token = this.extractToken(authHeader);
    const options = {
      min_date: minDate,
      max_date: maxDate,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    };

    if (accountId) {
      return this.powensService.getTransactionsByAccount(token, parseInt(accountId, 10), options);
    }
    return this.powensService.getTransactions(token, options);
  }

  // ============ MOCK API (Development) ============

  @Get('banks')
  async listBanks(@Query('country') country?: string) {
    return this.powensMockService.listBanks(country);
  }

  @Get('banks/:id')
  async getBank(@Param('id') id: string) {
    return this.powensMockService.getBank(id);
  }

  @Post('connections')
  async createConnection(@Body() dto: CreateConnectionDto) {
    return this.powensMockService.createConnection(dto);
  }

  @Get('connections')
  async listConnections(@Query('userId') userId?: string) {
    return this.powensMockService.listConnections(userId);
  }

  @Get('connections/:id')
  async getConnection(@Param('id') id: string) {
    return this.powensMockService.getConnection(id);
  }

  @Post('connections/:id/sync')
  async syncConnection(@Param('id') id: string) {
    return this.powensMockService.syncConnection(id);
  }

  @Delete('connections/:id')
  async deleteConnection(@Param('id') id: string) {
    await this.powensMockService.deleteConnection(id);
    return { success: true };
  }

  @Get('accounts')
  async listAccounts(
    @Query('userId') userId?: string,
    @Query('connectionId') connectionId?: string,
  ) {
    return this.powensMockService.listAccounts(userId, connectionId);
  }

  @Get('accounts/:id')
  async getAccount(@Param('id') id: string) {
    return this.powensMockService.getAccount(id);
  }

  @Post('accounts/:id/disable')
  async disableAccount(@Param('id') id: string) {
    return this.powensMockService.disableAccount(id);
  }

  @Get('transactions')
  async listTransactions(
    @Query('accountId') accountId?: string,
    @Query('min_date') minDate?: string,
    @Query('max_date') maxDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.powensMockService.listTransactions(accountId, {
      min_date: minDate,
      max_date: maxDate,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string) {
    return this.powensMockService.getTransaction(id);
  }

  @Post('transactions/:id/categorize')
  async categorizeTransaction(
    @Param('id') id: string,
    @Body('categoryId') categoryId: number,
    @Body('categoryName') categoryName: string,
  ) {
    return this.powensMockService.categorizeTransaction(id, categoryId, categoryName);
  }

  @Post('webhooks/simulate')
  async simulateWebhook(
    @Body('type') type: 'connection.synced' | 'connection.error' | 'account.created' | 'transactions.created',
    @Body('data') data: Record<string, unknown>,
  ) {
    return this.powensMockService.simulateWebhook(type, data);
  }

  // ============ REAL WEBHOOKS FROM POWENS ============

  /**
   * Receive webhooks from Powens
   * Configure this endpoint in your Powens console: https://console.powens.com
   * 
   * Webhook events:
   * - connection.synced: Connection sync completed successfully
   * - connection.deleted: Connection was deleted
   * - connection.error: Connection has an error (SCA required, wrong password, etc.)
   * - user.deleted: User was deleted
   */
  @Public()
  @Post('webhooks')
  async handlePowensWebhook(
    @Body() payload: {
      id_webhook_data: number;
      id_user: number;
      id_connection?: number;
      id_account?: number;
      type: string;
      timestamp: string;
      push_type?: string; // For connection events: 'connection.synced', 'connection.deleted', etc.
    },
    @Headers('x-powens-signature') signature?: string,
  ) {
    // TODO: Verify webhook signature with POWENS_WEBHOOK_SECRET
    // const isValid = this.powensService.verifyWebhookSignature(payload, signature);
    
    console.log('[Powens Webhook] Received:', {
      type: payload.type || payload.push_type,
      id_user: payload.id_user,
      id_connection: payload.id_connection,
      id_account: payload.id_account,
      timestamp: payload.timestamp,
    });

    const eventType = payload.push_type || payload.type;

    switch (eventType) {
      case 'connection.synced':
        // Connection sync completed - fetch new transactions
        // TODO: Queue a job to sync transactions for this connection
        console.log(`[Powens Webhook] Connection ${payload.id_connection} synced for user ${payload.id_user}`);
        break;

      case 'connection.deleted':
        // Connection was deleted - update status in DB
        console.log(`[Powens Webhook] Connection ${payload.id_connection} deleted for user ${payload.id_user}`);
        break;

      case 'connection.error':
        // Connection has an error - notify user to reconnect
        console.log(`[Powens Webhook] Connection ${payload.id_connection} has an error for user ${payload.id_user}`);
        break;

      case 'user.deleted':
        // User was deleted in Powens
        console.log(`[Powens Webhook] User ${payload.id_user} was deleted`);
        break;

      default:
        console.log(`[Powens Webhook] Unknown event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return { received: true, event: eventType };
  }

  // ============ HELPERS ============

  private extractToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException('Missing or invalid authorization header', HttpStatus.UNAUTHORIZED);
    }
    return authHeader.substring(7);
  }
}
