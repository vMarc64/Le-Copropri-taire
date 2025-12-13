/**
 * Manager Response DTO
 */
export class ManagerResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ManagerListResponseDto {
  data: ManagerResponseDto[];
  total: number;
}
