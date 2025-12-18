import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsUUID, Min, IsArray } from 'class-validator';

export enum FundCallType {
  REGULAR = 'regular',
  EXCEPTIONAL = 'exceptional',
}

export class CreateFundCallDto {
  @IsUUID()
  condominiumId: string;

  @IsString()
  reference: string;

  @IsString()
  title: string;

  @IsEnum(FundCallType)
  type: FundCallType;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsUUID()
  documentId?: string;
}

export class GenerateFundCallDto {
  @IsUUID()
  condominiumId: string;

  @IsEnum(FundCallType)
  type: FundCallType;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number; // If not provided, will be calculated from budget
}

export class UpdateFundCallItemDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;
}
