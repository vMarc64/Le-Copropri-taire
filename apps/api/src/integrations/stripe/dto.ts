import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

export class CreateSepaPaymentMethodDto {
  @IsString()
  iban: string;

  @IsString()
  accountHolderName: string;

  @IsString()
  email: string;
}

export class CreatePaymentIntentDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  mandateId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
