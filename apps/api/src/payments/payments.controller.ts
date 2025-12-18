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
import { PaymentsService } from './payments.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { CreatePaymentDto, PaymentFiltersDto, PaymentMethod } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('condominiums/:condominiumId/payments')
export class CondominiumPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query('ownerId') ownerId: string,
    @Query('paymentMethod') paymentMethod: PaymentMethod,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('status') status: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    const filters: PaymentFiltersDto = { ownerId, paymentMethod, from, to, status };
    return this.paymentsService.findAll(tenantId, condominiumId, filters);
  }

  @Post()
  async create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() data: CreatePaymentDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.paymentsService.create(tenantId, condominiumId, data);
  }

  @Get('summary')
  async getSummary(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.paymentsService.getSummary(tenantId, condominiumId);
  }
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.paymentsService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdatePaymentDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.paymentsService.update(tenantId, id, data);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.paymentsService.delete(tenantId, id);
  }
}

@Controller('owners/:ownerId/payments')
export class OwnerPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findByOwner(
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.paymentsService.findByOwner(tenantId, ownerId);
  }

  @Get('balance')
  async getBalance(
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
    @Query('condominiumId') condominiumId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.paymentsService.getOwnerBalance(tenantId, ownerId, condominiumId);
  }
}
