import { IsUUID, IsNumber, IsString, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CASH = 'cash',
  CARD = 'card',
  SEPA_DIRECT_DEBIT = 'sepa_direct_debit',
}

export enum PaymentType {
  REGULAR = 'regular',
  ADJUSTMENT = 'adjustment',
  EXCEPTIONAL = 'exceptional',
}

export class CreatePaymentDto {
  @IsUUID()
  ownerCondominiumId: string;

  @IsOptional()
  @IsUUID()
  fundCallItemId?: string;

  @IsOptional()
  @IsUUID()
  lotId?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PaymentFiltersDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
