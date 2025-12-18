import { IsString, IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { FundCallType } from './create-fund-call.dto';

export enum FundCallStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class UpdateFundCallDto {
  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(FundCallType)
  type?: FundCallType;

  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(FundCallStatus)
  status?: FundCallStatus;

  @IsOptional()
  @IsUUID()
  documentId?: string;
}
