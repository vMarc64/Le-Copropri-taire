import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PowensService } from './powens.service';
import { PowensMockService } from './powens-mock.service';
import { PowensController } from './powens.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PowensController],
  providers: [PowensService, PowensMockService],
  exports: [PowensService, PowensMockService],
})
export class PowensModule {}
