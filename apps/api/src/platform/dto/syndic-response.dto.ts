/**
 * Syndic Response DTO
 * Used for API responses
 */
export class SyndicResponseDto {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Stats (populated from related tables)
  managersCount?: number;
  condominiumsCount?: number;
  ownersCount?: number;
}

export class SyndicListResponseDto {
  data: SyndicResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export class SyndicDetailResponseDto extends SyndicResponseDto {
  managers?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  }[];
  
  condominiums?: {
    id: string;
    name: string;
    address: string;
    city: string;
  }[];
}
