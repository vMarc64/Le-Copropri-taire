import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantRequest } from './tenant.middleware';

/**
 * Decorator to extract the current tenant ID from the request.
 * 
 * @example
 * @Get()
 * findAll(@CurrentTenantId() tenantId: string) {
 *   return this.service.findByTenant(tenantId);
 * }
 */
export const CurrentTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    return request.tenantId;
  },
);
