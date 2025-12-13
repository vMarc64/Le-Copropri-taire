import { Controller, Get, Param, ForbiddenException } from '@nestjs/common';
import { CondominiumsService } from './condominiums.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';

@Controller('condominiums')
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Get()
  async findAll(@CurrentTenantId() tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.condominiumsService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.condominiumsService.findOne(id, tenantId);
  }
}
