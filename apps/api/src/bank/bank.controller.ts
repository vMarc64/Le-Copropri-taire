import { Controller, Get, Param, Query, ForbiddenException } from '@nestjs/common';
import { BankService } from './bank.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

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
}
