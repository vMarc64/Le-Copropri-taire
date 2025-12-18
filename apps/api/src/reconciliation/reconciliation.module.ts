import { Module } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';
import { ReconciliationController, ReconciliationsController } from './reconciliation.controller';

@Module({
  controllers: [ReconciliationController, ReconciliationsController],
  providers: [ReconciliationService],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
