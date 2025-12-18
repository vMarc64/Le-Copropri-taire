import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './cache';
import { QueueModule } from './queue';
import { AuthModule, JwtAuthGuard, RolesGuard, PermissionsGuard } from './auth';
import { TenantModule, TenantGuard } from './tenant';
import { ZoneGuard } from './guards';
import { StripeModule } from './integrations/stripe';
import { PowensModule } from './integrations/powens';
import { OwnersModule } from './owners';
import { DocumentsModule } from './documents';
import { BankModule } from './bank';
import { CondominiumsModule } from './condominiums';
import { DashboardModule } from './dashboard';
import { PlatformModule } from './platform';
import { PortalModule } from './portal';
import { UtilitiesModule } from './utilities';
import { MonitoringModule } from './monitoring';
import { InvoicesModule } from './invoices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule,
    QueueModule,
    AuthModule,
    TenantModule,
    StripeModule,
    PowensModule,
    OwnersModule,
    DocumentsModule,
    BankModule,
    CondominiumsModule,
    DashboardModule,
    PlatformModule,
    PortalModule,
    UtilitiesModule,
    MonitoringModule,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Enable JWT authentication globally
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Enable zone-based access control globally
    {
      provide: APP_GUARD,
      useClass: ZoneGuard,
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


