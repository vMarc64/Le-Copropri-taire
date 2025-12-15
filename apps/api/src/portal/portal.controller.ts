import { Controller, Get, Query } from '@nestjs/common';
import { PortalService } from './portal.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZoneAccess } from '../guards/zone.decorator';
import { Zone } from '../guards/zones';

interface CurrentUserPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string | null;
}

@Controller('portal')
@ZoneAccess(Zone.PORTAL)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  /**
   * Get dashboard data for the current owner
   */
  @Get('dashboard')
  async getDashboard(
    @CurrentUser() user: CurrentUserPayload,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.portalService.getDashboardData(user.sub, tenantId);
  }

  /**
   * Get payments for the current owner
   */
  @Get('payments')
  async getPayments(
    @CurrentUser() user: CurrentUserPayload,
    @CurrentTenantId() tenantId: string,
    @Query('condominiumId') condominiumId?: string,
  ) {
    return this.portalService.getPayments(user.sub, tenantId, condominiumId);
  }

  /**
   * Get documents accessible to the current owner
   */
  @Get('documents')
  async getDocuments(
    @CurrentUser() user: CurrentUserPayload,
    @CurrentTenantId() tenantId: string,
    @Query('condominiumId') condominiumId?: string,
  ) {
    return this.portalService.getDocuments(user.sub, tenantId, condominiumId);
  }
}
