import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { Zone, ZONE_ROLES } from './zones';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { SkipTenantCheck } from '../tenant/skip-tenant-check.decorator';

export const ZONE_KEY = 'zone';

/**
 * Decorator to mark a controller or route as belonging to a specific zone.
 * Automatically applies the appropriate role restrictions.
 * 
 * @example
 * @Controller('portal/profile')
 * @Zone(Zone.PORTAL)
 * export class ProfileController { ... }
 * 
 * @example
 * @Controller('admin/tenants')
 * @Zone(Zone.ADMIN)
 * export class AdminTenantsController { ... }
 */
export function ZoneAccess(zone: Zone) {
  const decorators = [SetMetadata(ZONE_KEY, zone)];

  if (zone === Zone.PUBLIC) {
    decorators.push(Public());
    decorators.push(SkipTenantCheck());
  } else {
    const roles = ZONE_ROLES[zone];
    if (roles.length > 0) {
      decorators.push(Roles(...roles));
    }
  }

  return applyDecorators(...decorators);
}

/**
 * Shorthand decorators for common zones
 */

/**
 * Public zone - no auth required
 */
export const PublicZone = () => ZoneAccess(Zone.PUBLIC);

/**
 * Owner portal zone - for owners, tenants, council members
 */
export const PortalZone = () => ZoneAccess(Zone.PORTAL);

/**
 * Manager zone - for property managers and admins
 */
export const ManageZone = () => ZoneAccess(Zone.MANAGE);

/**
 * Platform admin zone - for super admins only
 */
export const AdminZone = () => ZoneAccess(Zone.ADMIN);
