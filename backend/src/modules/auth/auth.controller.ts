import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, VerifyEmailDto } from './dto/auth.dto';

import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}



  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email, dto.password);
  }
// ... rest of the existing methods (can be removed later)

  @Post('verify')
  async verify(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.otp);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    if (!req.user || !req.user.accessToken) {
      return res.redirect(
        `${process.env.FRONTEND_BASE_URL}/auth/login?error=google_failed`,
      );
    }

    const { user, accessToken } = req.user;

    const params = new URLSearchParams({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      token: accessToken,
    });

    return res.redirect(
      `${process.env.FRONTEND_BASE_URL}/auth/callback?${params.toString()}`,
    );
  }
}
