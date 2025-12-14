import { Controller, Get, Post, Param, Query, ForbiddenException, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { BankService } from './bank.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { PowensService } from '../integrations/powens/powens.service';
import { ConfigService } from '@nestjs/config';
import { SkipTenantCheck } from '../tenant/skip-tenant-check.decorator';

@Controller('bank')
export class BankController {
  private readonly frontendUrl: string;

  constructor(
    private readonly bankService: BankService,
    private readonly powensService: PowensService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  @Get('accounts')
  async findAllAccounts(
    @CurrentTenantId() tenantId: string,
    @Query('condominiumId') condominiumId?: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.bankService.findAllAccounts(tenantId, condominiumId);
  }

  @Get('accounts/:id')
  async findOneAccount(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.bankService.findOneAccount(id, tenantId);
  }

  @Get('transactions')
  async findAllTransactions(
    @CurrentTenantId() tenantId: string,
    @Query('accountId') accountId?: string,
    @Query('condominiumId') condominiumId?: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.bankService.findAllTransactions(tenantId, accountId, condominiumId);
  }

  // ============ SYNC & TRANSACTIONS ============

  /**
   * Sync bank account transactions from Powens
   */
  @Post('sync/:condominiumId')
  async syncTransactions(
    @Param('condominiumId') condominiumId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.bankService.syncTransactionsFromPowens(tenantId, condominiumId, this.powensService);
  }

  // ============ POWENS CONNECT FLOW ============

  /**
   * Get Powens connect URL for a specific condominium
   * The state parameter contains condominiumId and tenantId for the callback
   */
  @Get('connect/:condominiumId')
  async getConnectUrl(
    @Param('condominiumId') condominiumId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }

    if (!this.powensService.isConfigured()) {
      return {
        configured: false,
        message: 'Powens is not configured. Please set POWENS_CLIENT_ID and POWENS_CLIENT_SECRET.',
      };
    }

    // Create state with condominiumId and tenantId (will be passed back in callback)
    const state = Buffer.from(JSON.stringify({ condominiumId, tenantId })).toString('base64');
    
    // Build callback URL from API_URL + POWENS_REDIRECT_URI path
    const apiUrl = this.configService.get<string>('API_URL', 'http://localhost:3002');
    const redirectPath = this.configService.get<string>('POWENS_REDIRECT_URI', '/powens/callback');
    const callbackUrl = `${apiUrl}${redirectPath}`;
    
    const url = this.powensService.getWebviewConnectUrlWithState(callbackUrl, state);

    return {
      configured: true,
      url,
      state,
    };
  }

  /**
   * Callback from Powens after bank connection
   * Stores the connection in database and redirects to frontend
   */
  @SkipTenantCheck()
  @Get('connect/callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
    @Query('error_description') errorDescription?: string,
    @Query('connection_id') connectionIdStr?: string,
    @Res() res?: Response,
  ) {
    // Decode state to get condominiumId and tenantId
    let condominiumId: string;
    let tenantId: string;
    
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      condominiumId = stateData.condominiumId;
      tenantId = stateData.tenantId;
    } catch {
      return res?.redirect(`${this.frontendUrl}/app/condominiums?error=invalid_state`);
    }

    if (error) {
      return res?.redirect(`${this.frontendUrl}/app/condominiums/${condominiumId}/bank?error=${encodeURIComponent(error)}`);
    }

    try {
      // Exchange code for permanent token
      const tokenResult = await this.powensService.exchangeCode(code);
      
      // Create Powens connection in database
      const connection = await this.bankService.createPowensConnection({
        tenantId,
        condominiumId,
        accessToken: tokenResult.access_token,
        powensUserId: tokenResult.id_user,
        powensConnectionId: connectionIdStr ? parseInt(connectionIdStr, 10) : undefined,
      });

      // Fetch accounts from Powens and store them
      try {
        const { accounts } = await this.powensService.getAccounts(tokenResult.access_token);
        
        for (const powensAccount of accounts) {
          await this.bankService.createBankAccount({
            tenantId,
            condominiumId,
            powensConnectionId: connection.id,
            powensAccountId: powensAccount.id,
            bankName: powensAccount.company_name || powensAccount.original_name,
            accountName: powensAccount.name,
            accountType: powensAccount.type,
            iban: powensAccount.iban || undefined,
            bic: powensAccount.bic || undefined,
            balance: powensAccount.balance,
            currency: powensAccount.currency?.id || 'EUR',
          });
        }
      } catch (accountError) {
        console.error('Failed to fetch/store accounts:', accountError);
        // Connection is still valid, accounts can be synced later
      }

      return res?.redirect(`${this.frontendUrl}/app/condominiums/${condominiumId}/bank?success=true`);
    } catch (tokenError) {
      console.error('Token exchange failed:', tokenError);
      return res?.redirect(`${this.frontendUrl}/app/condominiums/${condominiumId}/bank?error=token_exchange_failed`);
    }
  }

  /**
   * Finalize Powens connection (called from frontend callback)
   * This endpoint is used when the callback is handled by the frontend (iframe mode)
   */
  @SkipTenantCheck()
  @Post('connect/finalize')
  async finalizeConnection(
    @Body() body: { code: string; state: string; connectionId?: string },
  ) {
    const { code, state, connectionId } = body;

    // Decode state to get condominiumId and tenantId
    let condominiumId: string;
    let tenantId: string;
    
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      condominiumId = stateData.condominiumId;
      tenantId = stateData.tenantId;
    } catch {
      return { success: false, error: 'invalid_state' };
    }

    try {
      // Exchange code for permanent token
      const tokenResult = await this.powensService.exchangeCode(code);
      
      // Create Powens connection in database
      const connection = await this.bankService.createPowensConnection({
        tenantId,
        condominiumId,
        accessToken: tokenResult.access_token,
        powensUserId: tokenResult.id_user,
        powensConnectionId: connectionId ? parseInt(connectionId, 10) : undefined,
      });

      // Fetch accounts from Powens and store them
      try {
        const { accounts } = await this.powensService.getAccounts(tokenResult.access_token);
        
        for (const powensAccount of accounts) {
          await this.bankService.createBankAccount({
            tenantId,
            condominiumId,
            powensConnectionId: connection.id,
            powensAccountId: powensAccount.id,
            bankName: powensAccount.company_name || powensAccount.original_name,
            accountName: powensAccount.name,
            accountType: powensAccount.type,
            iban: powensAccount.iban || undefined,
            bic: powensAccount.bic || undefined,
            balance: powensAccount.balance,
            currency: powensAccount.currency?.id || 'EUR',
          });
        }
      } catch (accountError) {
        console.error('Failed to fetch/store accounts:', accountError);
        // Connection is still valid, accounts can be synced later
      }

      return { success: true, condominiumId };
    } catch (tokenError) {
      console.error('Token exchange failed:', tokenError);
      return { success: false, error: 'token_exchange_failed' };
    }
  }
}
