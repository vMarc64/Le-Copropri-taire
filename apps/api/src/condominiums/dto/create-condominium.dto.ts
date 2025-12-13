import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, Matches } from 'class-validator';

export class CreateCondominiumDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}$/, { message: 'Le code postal doit contenir 5 chiffres' })
  postalCode: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{14}$/, { message: 'Le SIRET doit contenir 14 chiffres' })
  siret?: string;

  @IsBoolean()
  @IsOptional()
  sepaEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  cbEnabled?: boolean;
}
