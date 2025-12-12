import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantRequest } from './tenant.middleware';
import { SKIP_TENANT_CHECK } from './skip-tenant-check.decorator';

/**
 * Guard that ensures a tenant context exists on the request.
 * Use this guard on routes that require tenant isolation.
 * 
 * Platform admins are exempted and can access cross-tenant data.
 * Use @SkipTenantCheck() to bypass this guard for specific routes.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check for skip decorator
    const skipCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_CHECK,
      [context.getHandler(), context.getClass()],
    );

    if (skipCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TenantRequest>();
    const user = request.user;

    // No auth yet (will be handled by JwtAuthGuard)
    if (!user) {
      return true;
    }

    // Platform admins can access any tenant or cross-tenant
    if (user.role === 'platform_admin') {
      return true;
    }

    // Other users must have a tenant context
    if (!request.tenantId) {
      throw new ForbiddenException(
        'Tenant context is required for this operation',
      );
    }

    return true;
  }
}

