import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { UtilitiesService } from './utilities.service';
import {
  CreateLotMeterDto,
  UpdateLotMeterDto,
  CreateUtilityBillDto,
  UpdateUtilityBillDto,
  BulkCreateMeterReadingsDto,
  UpdateMeterReadingDto,
  MeterType,
} from './dto';

@Controller('utilities')
@UseGuards(JwtAuthGuard)
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  // ============================================================================
  // LOT METERS
  // ============================================================================

  @Get('meters/lot/:lotId')
  async getMetersForLot(
    @Param('lotId') lotId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.getMetersForLot(lotId, tenantId);
  }

  @Get('meters/condominium/:condominiumId')
  async getMetersForCondominium(
    @Param('condominiumId') condominiumId: string,
    @Query('type') meterType: MeterType | undefined,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.getMetersForCondominium(condominiumId, tenantId, meterType);
  }

  @Post('meters')
  async createMeter(
    @Body() dto: CreateLotMeterDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.createMeter(dto, tenantId);
  }

  @Patch('meters/:id')
  async updateMeter(
    @Param('id') id: string,
    @Body() dto: UpdateLotMeterDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.updateMeter(id, dto, tenantId);
  }

  @Delete('meters/:id')
  async deleteMeter(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.deleteMeter(id, tenantId);
  }

  // ============================================================================
  // UTILITY BILLS
  // ============================================================================

  @Get('bills/condominium/:condominiumId')
  async getBillsForCondominium(
    @Param('condominiumId') condominiumId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.getBillsForCondominium(condominiumId, tenantId);
  }

  @Get('bills/:id')
  async getBill(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.getBill(id, tenantId);
  }

  @Post('bills')
  async createBill(
    @Body() dto: CreateUtilityBillDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.createBill(dto, tenantId);
  }

  @Patch('bills/:id')
  async updateBill(
    @Param('id') id: string,
    @Body() dto: UpdateUtilityBillDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.updateBill(id, dto, tenantId);
  }

  @Delete('bills/:id')
  async deleteBill(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.deleteBill(id, tenantId);
  }

  @Post('bills/:id/validate')
  async validateBill(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.validateBill(id, tenantId);
  }

  @Post('bills/:id/distribute')
  async distributeBill(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.distributeBill(id, tenantId);
  }

  @Post('bills/:id/initialize-readings')
  async initializeReadingsForBill(
    @Param('id') id: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.initializeReadingsForBill(id, tenantId);
  }

  // ============================================================================
  // METER READINGS
  // ============================================================================

  @Get('readings/:billId')
  async getReadingsForBill(
    @Param('billId') billId: string,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.getReadingsForBill(billId, tenantId);
  }

  @Post('readings')
  async bulkCreateReadings(
    @Body() dto: BulkCreateMeterReadingsDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.bulkCreateReadings(dto, tenantId);
  }

  @Patch('readings/:id')
  async updateReading(
    @Param('id') id: string,
    @Body() dto: UpdateMeterReadingDto,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.utilitiesService.updateReading(id, dto, tenantId);
  }
}
