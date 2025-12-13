import { Controller, Get, Post, Param, Query, ForbiddenException, ParseUUIDPipe } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';

@Controller('owners')
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Get()
  async findAll(@CurrentTenantId() tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.ownersService.findAll(tenantId);
  }

  @Get('search')
  async searchOrphanOwners(@Query('q') query: string) {
    // Search for orphan owners (no tenant) - accessible by any authenticated manager
    return this.ownersService.searchOrphanOwners(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.ownersService.findOne(id, tenantId);
  }

  @Post(':id/associate')
  async associateToSyndic(
    @Param('id', ParseUUIDPipe) ownerId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.ownersService.associateToSyndic(ownerId, tenantId);
  }
}
