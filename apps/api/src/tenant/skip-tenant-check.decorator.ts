import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_CHECK = 'skipTenantCheck';

/**
 * Decorator to skip tenant isolation check on a route.
 * Use this for routes that don't require tenant context, such as:
 * - Authentication endpoints
 * - Public routes
 * - Platform-level operations
 * 
 * @example
 * @Get('health')
 * @SkipTenantCheck()
 * healthCheck() { ... }
 */
export const SkipTenantCheck = () => SetMetadata(SKIP_TENANT_CHECK, true);
