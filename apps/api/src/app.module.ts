import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './queue';
import { AuthModule, JwtAuthGuard, RolesGuard } from './auth';

@Module({
  imports: [QueueModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Enable JWT authentication globally
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Enable role-based access control globally
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
