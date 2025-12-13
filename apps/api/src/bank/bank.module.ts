import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';
import { PowensService } from '../integrations/powens/powens.service';
import { PowensCallbackController } from '../integrations/powens-callback.controller';

@Module({
  imports: [ConfigModule],
  controllers: [BankController, PowensCallbackController],
  providers: [BankService, PowensService],
  exports: [BankService],
})
export class BankModule {}
