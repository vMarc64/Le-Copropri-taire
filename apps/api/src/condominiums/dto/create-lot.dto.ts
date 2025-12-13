import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateLotDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  type: string; // appartement, parking, cave, commerce, bureau, etc.

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-5)
  @Max(100)
  floor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  surface?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  tantiemes?: number;

  @IsOptional()
  @IsString()
  ownerId?: string;
}
