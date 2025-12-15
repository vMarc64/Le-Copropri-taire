import { Controller, Get, Post, Delete, Param, Query, Body, ForbiddenException, ParseUUIDPipe } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { ZoneAccess } from '../guards/zone.decorator';
import { Zone } from '../guards/zones';

@Controller('owners')
@ZoneAccess(Zone.MANAGE)
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

  @Get(':id/condominiums')
  async getOwnerCondominiums(
    @Param('id', ParseUUIDPipe) ownerId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.ownersService.getOwnerCondominiums(ownerId, tenantId);
  }

  @Post(':id/condominiums')
  async updateOwnerCondominiums(
    @Param('id', ParseUUIDPipe) ownerId: string,
    @Body() body: { condominiumIds: string[] },
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.ownersService.updateOwnerCondominiums(ownerId, body.condominiumIds, tenantId);
  }

  @Post(':id/condominiums/:condoId')
  async addCondominiumToOwner(
    @Param('id', ParseUUIDPipe) ownerId: string,
    @Param('condoId', ParseUUIDPipe) condoId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.ownersService.addCondominiumToOwner(ownerId, condoId, tenantId);
  }

  @Delete(':id/condominiums/:condoId')
  async removeCondominiumFromOwner(
    @Param('id', ParseUUIDPipe) ownerId: string,
    @Param('condoId', ParseUUIDPipe) condoId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.ownersService.removeCondominiumFromOwner(ownerId, condoId, tenantId);
  }

  // ============ LOTS ENDPOINTS ============

  @Get(':id/lots')
  async getOwnerLots(
    @Param('id', ParseUUIDPipe) ownerId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.ownersService.getOwnerLots(ownerId, tenantId);
  }

  @Get(':id/lots/available')
  async getAvailableLots(
    @Param('id', ParseUUIDPipe) ownerId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.ownersService.getAvailableLots(ownerId, tenantId);
  }

  @Post(':id/lots')
  async updateOwnerLots(
    @Param('id', ParseUUIDPipe) ownerId: string,
    @Body() body: { lotIds: string[] },
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.ownersService.updateOwnerLots(ownerId, body.lotIds, tenantId);
  }
}
