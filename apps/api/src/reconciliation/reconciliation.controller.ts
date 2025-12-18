import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReconciliationDto, AutoMatchDto } from './dto/create-reconciliation.dto';
import { RejectReconciliationDto } from './dto/update-reconciliation.dto';

@Controller('condominiums/:condominiumId/reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get('queue')
  async getQueue(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query('status') status: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.reconciliationService.getQueue(tenantId, condominiumId, { status });
  }

  @Get('candidates/:transactionId')
  async getCandidates(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.reconciliationService.getCandidates(tenantId, condominiumId, transactionId);
  }

  @Post()
  async create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() data: CreateReconciliationDto,
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: { id: string },
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.reconciliationService.create(tenantId, user.id, data);
  }

  @Post('auto-match')
  async autoMatch(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() data: AutoMatchDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.reconciliationService.autoMatch(tenantId, condominiumId, data.minConfidence);
  }

  @Get('history')
  async getHistory(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.reconciliationService.getHistory(tenantId, condominiumId, { from, to });
  }
}

@Controller('reconciliations')
export class ReconciliationsController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Post(':id/reject')
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: RejectReconciliationDto,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.reconciliationService.reject(tenantId, id, data);
  }

  @Post(':id/ignore')
  async ignore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.reconciliationService.ignore(tenantId, id);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.reconciliationService.delete(tenantId, id);
  }
}
