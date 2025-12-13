import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { LoginDto, RegisterDto, AuthResponse } from './dto/auth.dto';
import { JwtPayload, UserRole } from './strategies/jwt.strategy';
import { db } from '../database/client';
import { users, tenants } from '../database/schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.findUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        tenantId: user.tenantId,
      },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.findUserByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create tenant (property management company) for the new manager
    const [newTenant] = await db.insert(tenants).values({
      name: dto.companyName || `${dto.firstName} ${dto.lastName}`,
      email: dto.email,
      status: 'active',
    }).returning();

    // Create the user with manager role linked to the tenant
    const [newUser] = await db.insert(users).values({
      tenantId: newTenant.id,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: 'manager',
      status: 'active',
    }).returning();

    const payload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role as UserRole,
      tenantId: newUser.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User ${newUser.email} registered successfully with tenant ${newTenant.id}`);

    return {
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role as UserRole,
        tenantId: newUser.tenantId,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<JwtPayload | null> {
    // Validate user still exists and is active
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });

    if (!user || user.status !== 'active') {
      return null;
    }

    return payload;
  }

  private async findUserByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }
}
