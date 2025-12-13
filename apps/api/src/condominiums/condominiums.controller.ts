import { Controller, Get, Param } from '@nestjs/common';
import { CondominiumsService } from './condominiums.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('condominiums')
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Get()
  @Public() // TODO: Remove after auth is properly configured
  async findAll(@CurrentTenantId() tenantId: string) {
    const tid = tenantId || 'default';
    return this.condominiumsService.findAll(tid);
  }

  @Get(':id')
  @Public() // TODO: Remove after auth is properly configured
  async findOne(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    const tid = tenantId || 'default';
    return this.condominiumsService.findOne(id, tid);
  }
}
