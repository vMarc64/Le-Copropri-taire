import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ZONE_KEY } from './zone.decorator';
import { Zone, ZONE_ROLES } from './zones';

/**
 * Guard that validates access based on zone configuration.
 * This is an additional layer on top of RolesGuard for zone-specific logic.
 */
@Injectable()
export class ZoneGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const zone = this.reflector.getAllAndOverride<Zone>(ZONE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No zone specified, allow access (will be handled by other guards)
    if (!zone) {
      return true;
    }

    // Public zone always allowed
    if (zone === Zone.PUBLIC) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required for this zone');
    }

    const allowedRoles = ZONE_ROLES[zone];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Zone '${zone}' requires one of: ${allowedRoles.join(', ')}`,
      );
    }

    return true;
  }
}
