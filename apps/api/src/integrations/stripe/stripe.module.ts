import { Module } from '@nestjs/common';
import { StripeMockService } from './stripe-mock.service';
import { StripeController } from './stripe.controller';

@Module({
  controllers: [StripeController],
  providers: [StripeMockService],
  exports: [StripeMockService],
})
export class StripeModule {}
