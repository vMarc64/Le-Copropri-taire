import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './queue';
import { AuthModule, JwtAuthGuard, RolesGuard, PermissionsGuard } from './auth';
import { TenantModule, TenantGuard } from './tenant';

@Module({
  imports: [QueueModule, AuthModule, TenantModule],
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
    // Enable permission-based access control globally
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    // Enable tenant isolation globally
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}

