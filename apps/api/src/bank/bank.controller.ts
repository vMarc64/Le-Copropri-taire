import { Controller, Get, Param, Query } from '@nestjs/common';
import { BankService } from './bank.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get('accounts')
  @Public() // TODO: Remove after auth is properly configured
  async findAllAccounts(
    @CurrentTenantId() tenantId: string,
    @Query('condominiumId') condominiumId?: string,
  ) {
    const tid = tenantId || 'default';
    return this.bankService.findAllAccounts(tid, condominiumId);
  }

  @Get('accounts/:id')
  @Public() // TODO: Remove after auth is properly configured
  async findOneAccount(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    const tid = tenantId || 'default';
    return this.bankService.findOneAccount(id, tid);
  }

  @Get('transactions')
  @Public() // TODO: Remove after auth is properly configured
  async findAllTransactions(
    @CurrentTenantId() tenantId: string,
    @Query('accountId') accountId?: string,
    @Query('condominiumId') condominiumId?: string,
  ) {
    const tid = tenantId || 'default';
    return this.bankService.findAllTransactions(tid, accountId, condominiumId);
  }
}
