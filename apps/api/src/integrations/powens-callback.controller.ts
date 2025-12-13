import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { BankService } from '../bank/bank.service';
import { PowensService } from './powens/powens.service';
import { ConfigService } from '@nestjs/config';
import { SkipTenantCheck } from '../tenant/skip-tenant-check.decorator';

@Controller('powens')
export class PowensCallbackController {
  private readonly frontendUrl: string;

  constructor(
    private readonly bankService: BankService,
    private readonly powensService: PowensService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  /**
   * Callback from Powens after bank connection (iframe mode)
   * Returns HTML that communicates with parent iframe
   */
  @SkipTenantCheck()
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
    @Query('error_description') errorDescription?: string,
    @Query('connection_id') connectionIdStr?: string,
    @Res() res?: Response,
  ) {
    // Decode state to get condominiumId and tenantId
    let condominiumId = '';
    let tenantId = '';
    
    try {
      if (state) {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        condominiumId = stateData.condominiumId;
        tenantId = stateData.tenantId;
      }
    } catch {
      return res?.send(this.generateHtmlResponse('error', 'Paramètres invalides', condominiumId));
    }

    if (error) {
      return res?.send(this.generateHtmlResponse('error', errorDescription || error, condominiumId));
    }

    if (!code) {
      return res?.send(this.generateHtmlResponse('error', 'Code d\'autorisation manquant', condominiumId));
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
      }

      return res?.send(this.generateHtmlResponse('success', 'Compte bancaire connecté avec succès !', condominiumId));
    } catch (tokenError) {
      console.error('Token exchange failed:', tokenError);
      return res?.send(this.generateHtmlResponse('error', 'Erreur lors de la connexion', condominiumId));
    }
  }

  private generateHtmlResponse(status: 'success' | 'error', message: string, condominiumId: string): string {
    const isSuccess = status === 'success';
    const redirectUrl = condominiumId 
      ? `${this.frontendUrl}/app/condominiums/${condominiumId}/bank?${status}=true`
      : `${this.frontendUrl}/app`;
      
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSuccess ? 'Connexion réussie' : 'Erreur'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #0a0a0a;
      color: #fafafa;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
    }
    .icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .icon.success { background: rgba(34, 197, 94, 0.1); }
    .icon.error { background: rgba(239, 68, 68, 0.1); }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #a1a1aa; margin-bottom: 1.5rem; }
    button {
      background: #f59e0b;
      color: #0a0a0a;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }
    button:hover { background: #d97706; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon ${status}">
      ${isSuccess ? '✓' : '✕'}
    </div>
    <h1>${isSuccess ? 'Connexion réussie !' : 'Une erreur est survenue'}</h1>
    <p>${message}</p>
    <button onclick="handleClose()">
      ${isSuccess ? 'Continuer' : 'Réessayer'}
    </button>
  </div>
  <script>
    function handleClose() {
      if (window.parent !== window) {
        window.parent.postMessage({ 
          type: 'powens-callback', 
          status: '${status}',
          condominiumId: '${condominiumId}'
        }, '*');
      } else {
        window.location.href = '${redirectUrl}';
      }
    }
    
    // Auto-notify parent after 1 second
    setTimeout(() => {
      if (window.parent !== window) {
        window.parent.postMessage({ 
          type: 'powens-callback', 
          status: '${status}',
          condominiumId: '${condominiumId}'
        }, '*');
      }
    }, 1000);
  </script>
</body>
</html>
    `;
  }
}
