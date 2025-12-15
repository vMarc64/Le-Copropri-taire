import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponse } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  /**
   * Verify if current user is a platform_admin
   * Used by nginx auth_request to protect SigNoz
   */
  @Get('verify-admin')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyAdmin(@Req() req: Request): Promise<{ ok: boolean }> {
    const user = req.user as { role?: string };
    if (user?.role !== 'platform_admin') {
      throw new UnauthorizedException('Not a platform admin');
    }
    return { ok: true };
  }
}
