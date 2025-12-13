import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CondominiumsService } from './condominiums.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { CreateCondominiumDto, CreateLotDto } from './dto';

@Controller('condominiums')
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Post()
  async create(
    @Body() data: CreateCondominiumDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.condominiumsService.create(tenantId, data);
  }

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

  @Get(':id/owners')
  async getOwners(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.condominiumsService.getOwners(id, tenantId);
  }

  @Get(':id/lots/available')
  async getAvailableLots(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('forOwner') forOwnerId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.condominiumsService.getAvailableLots(id, tenantId, forOwnerId);
  }

  @Post(':id/owners/:ownerId/lots')
  async updateOwnerLots(
    @Param('id', ParseUUIDPipe) condoId: string,
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
    @Body() body: { lotIds: string[] },
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.condominiumsService.updateOwnerLotsInCondominium(
      condoId,
      ownerId,
      body.lotIds,
      tenantId
    );
  }

  @Get(':id/lots')
  async getLots(
    @Param('id', ParseUUIDPipe) condoId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.condominiumsService.getLots(condoId, tenantId);
  }

  @Post(':id/lots')
  async createLot(
    @Param('id', ParseUUIDPipe) condoId: string,
    @Body() data: CreateLotDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.condominiumsService.createLot(condoId, tenantId, data);
  }
}
