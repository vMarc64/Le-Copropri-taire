import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

const redisEnabled = process.env.REDIS_ENABLED === 'true';

const bullModules = redisEnabled
  ? [
      BullModule.forRoot({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
      }),
    ]
  : [];

@Module({
  imports: bullModules,
  providers: [],
  exports: redisEnabled ? [BullModule] : [],
})
export class QueueModule implements OnModuleInit {
  private readonly logger = new Logger(QueueModule.name);

  onModuleInit() {
    if (!redisEnabled) {
      this.logger.warn('Redis is disabled. Queue functionality is not available.');
    }
  }
}
