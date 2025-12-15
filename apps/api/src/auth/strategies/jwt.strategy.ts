import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

export type UserRole = 'platform_admin' | 'admin' | 'manager' | 'council' | 'owner' | 'tenant';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  tenantId: string | null; // null for platform_admin
}

/**
 * Extract JWT from cookie or Authorization header
 */
const cookieOrHeaderExtractor = (req: Request): string | null => {
  // Try cookie first (for nginx auth_request)
  if (req?.cookies?.access_token) {
    return req.cookies.access_token;
  }
  // Fall back to Authorization header
  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: cookieOrHeaderExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }
    return payload;
  }
}
