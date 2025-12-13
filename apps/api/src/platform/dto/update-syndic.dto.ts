import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';

export enum SyndicStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export class UpdateSyndicDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  siret?: string;

  @IsEnum(SyndicStatus)
  @IsOptional()
  status?: SyndicStatus;
}
