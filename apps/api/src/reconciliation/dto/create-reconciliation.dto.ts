import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum ReconciliationTargetType {
  PAYMENT = 'payment',
  INVOICE = 'invoice',
  UTILITY_BILL = 'utility_bill',
  FUND_CALL_ITEM = 'fund_call_item',
}

export class CreateReconciliationDto {
  @IsUUID()
  transactionId: string;

  @IsEnum(ReconciliationTargetType)
  targetType: ReconciliationTargetType;

  @IsUUID()
  targetId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SuggestReconciliationDto {
  @IsUUID()
  transactionId: string;

  @IsEnum(ReconciliationTargetType)
  suggestedTargetType: ReconciliationTargetType;

  @IsUUID()
  suggestedTargetId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceScore: number;

  @IsOptional()
  matchingDetails?: Record<string, number>;
}

export class AutoMatchDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minConfidence?: number; // Default 85
}
