import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsUUID, Min } from 'class-validator';

export enum InvoiceCategory {
  INSURANCE = 'insurance',
  MAINTENANCE = 'maintenance',
  WORKS = 'works',
  FEES = 'fees',
  CLEANING = 'cleaning',
  GARDENING = 'gardening',
  ELEVATOR = 'elevator',
  OTHER = 'other',
}

export class CreateInvoiceDto {
  @IsUUID()
  condominiumId: string;

  @IsString()
  supplierName: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  supplierReference?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountHt?: number;

  @IsNumber()
  @Min(0)
  amountTtc: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vatAmount?: number;

  @IsDateString()
  issueDate: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @IsEnum(InvoiceCategory)
  category: InvoiceCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  documentId?: string;
}
