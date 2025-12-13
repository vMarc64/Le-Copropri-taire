import { Controller, Get, Param, Query, ForbiddenException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query('condominiumId') condominiumId?: string,
  ) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.documentsService.findAll(tenantId, condominiumId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }
    return this.documentsService.findOne(id, tenantId);
  }
}
