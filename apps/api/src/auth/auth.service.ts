import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, AuthResponse } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

// TODO: Replace with actual database queries using Drizzle
interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'platform_admin' | 'manager' | 'owner' | 'tenant';
  tenantId: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    // TODO: Replace with actual database query
    const user = await this.findUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
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
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // TODO: Replace with actual database query
    const existingUser = await this.findUserByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // TODO: Replace with actual database insert
    const user: User = {
      id: crypto.randomUUID(),
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: 'manager', // Default role for new registrations
      tenantId: null, // Will be set when creating a tenant
    };

    // TODO: Save user to database

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User ${user.email} registered successfully`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<JwtPayload | null> {
    // TODO: Optionally validate user still exists in database
    return payload;
  }

  // Placeholder - replace with Drizzle query
  private async findUserByEmail(email: string): Promise<User | null> {
    // TODO: Implement with Drizzle ORM
    // return await db.query.users.findFirst({ where: eq(users.email, email) });
    return null;
  }
}
