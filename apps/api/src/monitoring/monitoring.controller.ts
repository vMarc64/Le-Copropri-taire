import { Controller, Get, UseGuards } from '@nestjs/common';
import { MonitoringService, SystemMetrics } from './monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * Get system metrics (CPU, RAM, Disk)
   * Only accessible by platform_admin
   */
  @Get('metrics')
  @Roles('platform_admin')
  async getMetrics(): Promise<SystemMetrics> {
    return this.monitoringService.getSystemMetrics();
  }
}
