import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlatformService } from './platform.service';
import { CreateSyndicDto, UpdateSyndicDto } from './dto';
import { Zone } from '../guards/zones';
import { ZoneAccess } from '../guards/zone.decorator';
import { SkipTenantCheck } from '../tenant/skip-tenant-check.decorator';

/**
 * Platform Controller
 * 
 * Endpoints for Platform Admins to manage Syndics (Property Managers)
 * All routes are protected by ZoneGuard for ADMIN zone
 */
@Controller('platform')
@ZoneAccess(Zone.ADMIN)
@SkipTenantCheck() // Platform admin has no tenant context
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  /**
   * Get platform dashboard stats
   */
  @Get('stats')
  async getStats() {
    return this.platformService.getPlatformStats();
  }

  /**
   * List all syndics with pagination
   */
  @Get('syndics')
  async listSyndics(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.platformService.findAllSyndics({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      status,
      sortBy,
      sortOrder,
    });
  }

  /**
   * Get a single syndic by ID
   */
  @Get('syndics/:id')
  async getSyndic(@Param('id', ParseUUIDPipe) id: string) {
    return this.platformService.findOneSyndic(id);
  }

  /**
   * Create a new syndic
   */
  @Post('syndics')
  @HttpCode(HttpStatus.CREATED)
  async createSyndic(@Body() dto: CreateSyndicDto) {
    return this.platformService.createSyndic(dto);
  }

  /**
   * Update a syndic
   */
  @Patch('syndics/:id')
  async updateSyndic(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSyndicDto,
  ) {
    return this.platformService.updateSyndic(id, dto);
  }

  /**
   * Soft delete a syndic (suspend)
   */
  @Delete('syndics/:id')
  async deleteSyndic(@Param('id', ParseUUIDPipe) id: string) {
    return this.platformService.deleteSyndic(id);
  }
}
