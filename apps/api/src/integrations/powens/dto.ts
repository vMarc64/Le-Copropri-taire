import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateConnectionDto {
  @IsString()
  userId: string;

  @IsString()
  bankId: string;

  @IsOptional()
  @IsObject()
  credentials?: {
    login?: string;
    password?: string;
  };
}

export class SyncConnectionDto {
  @IsString()
  connectionId: string;
}
