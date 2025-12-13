import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { CondominiumsService } from './condominiums.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { CreateCondominiumDto } from './dto';

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
}
