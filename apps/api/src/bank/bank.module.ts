import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';
import { PowensService } from '../integrations/powens/powens.service';

@Module({
  imports: [ConfigModule],
  controllers: [BankController],
  providers: [BankService, PowensService],
  exports: [BankService],
})
export class BankModule {}
