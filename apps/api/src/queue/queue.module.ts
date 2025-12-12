import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor, EMAIL_QUEUE } from './processors/email.processor';
import { SepaProcessor, SEPA_QUEUE } from './processors/sepa.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue(
      { name: EMAIL_QUEUE },
      { name: SEPA_QUEUE },
    ),
  ],
  providers: [EmailProcessor, SepaProcessor],
  exports: [BullModule],
})
export class QueueModule {}
