import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FundCallsService } from './fund-calls.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { CreateFundCallDto, GenerateFundCallDto, UpdateFundCallItemDto } from './dto/create-fund-call.dto';
import { UpdateFundCallDto } from './dto/update-fund-call.dto';

@Controller('condominiums/:condominiumId/fund-calls')
export class FundCallsController {
  constructor(private readonly fundCallsService: FundCallsService) {}

  @Post()
  async create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() data: CreateFundCallDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.create(tenantId, { ...data, condominiumId });
  }

  @Post('generate')
  async generate(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() data: GenerateFundCallDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.generate(tenantId, { ...data, condominiumId });
  }

  @Get()
  async findAll(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query('status') status: string,
    @Query('type') type: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.findAll(tenantId, condominiumId, { status, type });
  }

  @Get(':id')
  async findOne(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateFundCallDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.update(tenantId, id, data);
  }

  @Delete(':id')
  async delete(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.delete(tenantId, id);
  }

  @Post(':id/send')
  async send(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.send(tenantId, id);
  }

  @Post(':id/remind')
  async remind(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.remind(tenantId, id);
  }

  @Get(':id/items')
  async getItems(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.getItems(tenantId, id);
  }
}

@Controller('fund-call-items')
export class FundCallItemsController {
  constructor(private readonly fundCallsService: FundCallsService) {}

  @Get(':id')
  async getItem(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.getItem(tenantId, id);
  }

  @Put(':id')
  async updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateFundCallItemDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.fundCallsService.updateItem(tenantId, id, data);
  }
}
