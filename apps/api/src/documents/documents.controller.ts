import { Controller, Get, Param, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CurrentTenantId } from '../tenant/current-tenant.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Public() // TODO: Remove after auth is properly configured
  async findAll(
    @CurrentTenantId() tenantId: string,
    @Query('condominiumId') condominiumId?: string,
  ) {
    const tid = tenantId || 'default';
    return this.documentsService.findAll(tid, condominiumId);
  }

  @Get(':id')
  @Public() // TODO: Remove after auth is properly configured
  async findOne(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    const tid = tenantId || 'default';
    return this.documentsService.findOne(id, tid);
  }
}
