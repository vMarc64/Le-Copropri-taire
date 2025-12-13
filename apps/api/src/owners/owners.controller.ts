import { Controller, Get, Param } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('owners')
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Get()
  @Public() // TODO: Remove after auth is properly configured
  async findAll(@CurrentTenantId() tenantId: string) {
    // For now, use a default tenant ID if not provided
    const tid = tenantId || 'default';
    return this.ownersService.findAll(tid);
  }

  @Get(':id')
  @Public() // TODO: Remove after auth is properly configured
  async findOne(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    const tid = tenantId || 'default';
    return this.ownersService.findOne(id, tid);
  }
}
