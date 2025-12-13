import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Public() // TODO: Remove after auth is properly configured
  async getStats(@CurrentTenantId() tenantId: string) {
    const tid = tenantId || 'default';
    return this.dashboardService.getStats(tid);
  }

  @Get('condominiums-with-unpaid')
  @Public() // TODO: Remove after auth is properly configured
  async getCondominiumsWithUnpaid(@CurrentTenantId() tenantId: string) {
    const tid = tenantId || 'default';
    return this.dashboardService.getCondominiumsWithUnpaid(tid);
  }
}
