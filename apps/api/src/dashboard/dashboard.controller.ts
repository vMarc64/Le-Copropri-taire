import { Controller, Get, ForbiddenException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@CurrentTenantId() tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.dashboardService.getStats(tenantId);
  }

  @Get('condominiums-with-unpaid')
  async getCondominiumsWithUnpaid(@CurrentTenantId() tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.dashboardService.getCondominiumsWithUnpaid(tenantId);
  }
}
