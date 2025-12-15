import { IsString, IsOptional, IsBoolean, IsIn, Matches } from 'class-validator';

// Types for utility billing
export type UtilityBillingType = 'individual' | 'global_metered' | 'global_fixed' | 'none';

export class UpdateCondominiumSettingsDto {
  // General info
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{5}$/, { message: 'Le code postal doit contenir 5 chiffres' })
  postalCode?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{14}$/, { message: 'Le SIRET doit contenir 14 chiffres' })
  siret?: string;

  // Financial settings
  @IsString()
  @IsOptional()
  @IsIn(['monthly', 'quarterly'], { message: 'La fréquence doit être mensuelle ou trimestrielle' })
  callFrequency?: 'monthly' | 'quarterly';

  // Payment methods
  @IsBoolean()
  @IsOptional()
  sepaEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  cbEnabled?: boolean;

  // Manual bank details
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/, { message: 'IBAN invalide' })
  bankIban?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/, { message: 'BIC invalide' })
  bankBic?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  // Utility billing settings
  @IsString()
  @IsOptional()
  @IsIn(['individual', 'global_metered', 'global_fixed', 'none'], { message: 'Type de facturation invalide' })
  coldWaterBilling?: UtilityBillingType;

  @IsString()
  @IsOptional()
  @IsIn(['individual', 'global_metered', 'global_fixed', 'none'], { message: 'Type de facturation invalide' })
  hotWaterBilling?: UtilityBillingType;

  @IsString()
  @IsOptional()
  @IsIn(['individual', 'global_metered', 'global_fixed', 'none'], { message: 'Type de facturation invalide' })
  heatingBilling?: UtilityBillingType;

  @IsString()
  @IsOptional()
  @IsIn(['individual', 'global_metered', 'global_fixed', 'none'], { message: 'Type de facturation invalide' })
  gasBilling?: UtilityBillingType;

  @IsString()
  @IsOptional()
  @IsIn(['individual', 'global_metered', 'global_fixed', 'none'], { message: 'Type de facturation invalide' })
  electricityCommonBilling?: UtilityBillingType;
}
