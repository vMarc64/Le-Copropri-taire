import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MonitoringService, SystemMetrics } from './monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CacheService } from '../cache';
import type { CacheStats } from '../cache';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Get system metrics (CPU, RAM, Disk)
   * Only accessible by platform_admin
   */
  @Get('metrics')
  @Roles('platform_admin')
  async getMetrics(): Promise<SystemMetrics> {
    return this.monitoringService.getSystemMetrics();
  }

  /**
   * Get cache statistics
   * Only accessible by platform_admin
   */
  @Get('cache')
  @Roles('platform_admin')
  getCacheStats(): CacheStats {
    return this.cacheService.getStats();
  }

  /**
   * Clear all cache
   * Only accessible by platform_admin
   */
  @Post('cache/clear')
  @Roles('platform_admin')
  clearCache() {
    this.cacheService.clear();
    return { success: true, message: 'Cache cleared' };
  }
}
