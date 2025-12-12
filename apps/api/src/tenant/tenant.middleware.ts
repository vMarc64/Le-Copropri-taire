import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

/**
 * Extended Express Request with tenant context
 */
export interface TenantRequest extends Request {
  tenantId?: string;
  user?: {
    sub: string;
    email: string;
    role: string;
    tenantId?: string;
  };
}

/**
 * Middleware that extracts tenant context from JWT and adds it to the request.
 * This ensures multi-tenant data isolation at the request level.
 * 
 * Platform admins can optionally specify a tenant via X-Tenant-Id header.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: TenantRequest, res: Response, next: NextFunction) {
    // Skip for public routes (no auth header)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = this.jwtService.verify(token);

      // Platform admins can impersonate a tenant
      if (payload.role === 'platform_admin') {
        const headerTenantId = req.headers['x-tenant-id'] as string;
        req.tenantId = headerTenantId || undefined; // No tenant = cross-tenant access
      } else {
        // Regular users are bound to their tenant
        if (!payload.tenantId) {
          throw new ForbiddenException('User is not associated with any tenant');
        }
        req.tenantId = payload.tenantId;
      }
    } catch (error) {
      // Token validation will be handled by JwtAuthGuard
      // We just don't set tenantId here
    }

    next();
  }
}
