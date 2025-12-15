import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, IsIn, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================================
// METER TYPES
// ============================================================================

export const METER_TYPES = ['cold_water', 'hot_water', 'heating'] as const;
export type MeterType = typeof METER_TYPES[number];

export const UTILITY_TYPES = ['cold_water', 'hot_water', 'electricity_common', 'gas', 'heating', 'fuel_oil'] as const;
export type UtilityType = typeof UTILITY_TYPES[number];

export const UTILITY_UNITS = ['m3', 'kwh', 'liters', 'units'] as const;
export type UtilityUnit = typeof UTILITY_UNITS[number];

export const BILL_STATUSES = ['draft', 'validated', 'distributed'] as const;
export type BillStatus = typeof BILL_STATUSES[number];

// ============================================================================
// LOT METERS DTOs
// ============================================================================

export class CreateLotMeterDto {
  @IsUUID()
  lotId: string;

  @IsString()
  @IsIn(METER_TYPES)
  meterType: MeterType;

  @IsOptional()
  @IsString()
  meterNumber?: string;

  @IsOptional()
  @IsBoolean()
  isDualTariff?: boolean;
}

export class UpdateLotMeterDto {
  @IsOptional()
  @IsString()
  meterNumber?: string;

  @IsOptional()
  @IsBoolean()
  isDualTariff?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================================================
// UTILITY BILLS DTOs
// ============================================================================

export class CreateUtilityBillDto {
  @IsUUID()
  condominiumId: string;

  @IsString()
  @IsIn(UTILITY_TYPES)
  utilityType: UtilityType;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  globalIndexStart?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  globalIndexEnd?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  globalIndexOffPeakStart?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  globalIndexOffPeakEnd?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalConsumption?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalConsumptionOffPeak?: number;

  @IsString()
  @IsIn(UTILITY_UNITS)
  unit: UtilityUnit;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateUtilityBillDto {
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  globalIndexStart?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  globalIndexEnd?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  globalIndexOffPeakStart?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  globalIndexOffPeakEnd?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalConsumption?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalConsumptionOffPeak?: number;

  @IsOptional()
  @IsString()
  @IsIn(UTILITY_UNITS)
  unit?: UtilityUnit;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsString()
  @IsIn(BILL_STATUSES)
  status?: BillStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================================================
// METER READINGS DTOs
// ============================================================================

export class CreateMeterReadingDto {
  @IsUUID()
  lotMeterId: string;

  @IsNumber()
  @Type(() => Number)
  previousIndex: number;

  @IsNumber()
  @Type(() => Number)
  currentIndex: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  previousIndexOffPeak?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  currentIndexOffPeak?: number;
}

export class BulkCreateMeterReadingsDto {
  @IsUUID()
  utilityBillId: string;

  readings: CreateMeterReadingDto[];
}

export class UpdateMeterReadingDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  currentIndex?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  currentIndexOffPeak?: number;
}
