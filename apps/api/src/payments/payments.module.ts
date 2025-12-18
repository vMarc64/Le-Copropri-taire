import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  CondominiumPaymentsController,
  PaymentsController,
  OwnerPaymentsController,
} from './payments.controller';

@Module({
  controllers: [CondominiumPaymentsController, PaymentsController, OwnerPaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
