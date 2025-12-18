import { Module } from '@nestjs/common';
import { FundCallsController, FundCallItemsController } from './fund-calls.controller';
import { FundCallsService } from './fund-calls.service';

@Module({
  controllers: [FundCallsController, FundCallItemsController],
  providers: [FundCallsService],
  exports: [FundCallsService],
})
export class FundCallsModule {}
