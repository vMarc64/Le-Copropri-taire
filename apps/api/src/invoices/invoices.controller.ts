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
import { InvoicesService } from './invoices.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';

@Controller('condominiums/:condominiumId/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() data: CreateInvoiceDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    // Override condominiumId from URL
    return this.invoicesService.create(tenantId, { ...data, condominiumId });
  }

  @Get()
  async findAll(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query('status') status: string,
    @Query('category') category: string,
    @Query('supplier') supplier: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.invoicesService.findAll(tenantId, condominiumId, {
      status,
      category,
      supplier,
      from,
      to,
    });
  }

  @Get('stats')
  async getStats(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.invoicesService.getStats(tenantId, condominiumId);
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
    return this.invoicesService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateInvoiceDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.invoicesService.update(tenantId, id, data);
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
    return this.invoicesService.delete(tenantId, id);
  }

  @Post(':id/mark-paid')
  async markAsPaid(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.invoicesService.markAsPaid(tenantId, id);
  }
}
