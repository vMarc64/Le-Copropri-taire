import { SetMetadata } from '@nestjs/common';
import { Permission } from '../rbac/permissions';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions on a route
 * @example @Permissions(Permission.USER_CREATE, Permission.USER_UPDATE)
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
