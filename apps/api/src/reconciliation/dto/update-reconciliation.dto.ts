import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum ReconciliationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export enum QueueStatus {
  PENDING = 'pending',
  SUGGESTED = 'suggested',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  IGNORED = 'ignored',
}

export class UpdateReconciliationDto {
  @IsOptional()
  @IsEnum(ReconciliationStatus)
  status?: ReconciliationStatus;

  @IsOptional()
  @IsEnum(QueueStatus)
  queueStatus?: QueueStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectReconciliationDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
