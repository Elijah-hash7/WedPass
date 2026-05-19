import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/services/prisma.service';
import { EmailService } from './email.service';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (existing?.isVerified) {
      throw new ConflictException(
        'An account with this email already exists. Please sign in.',
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existing) {
      // Resend OTP to unverified account
      await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          name,
          verificationOtp: otp,
          otpExpiresAt,
        },
      });
    } else {
      await this.prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          verificationOtp: otp,
          otpExpiresAt,
        },
      });
    }

    await this.emailService.sendVerificationOtp(email, name, otp);
    return { message: 'Verification code sent to your email.' };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      throw new NotFoundException('No account found for this email.');
    }
    if (user.isVerified) {
      throw new BadRequestException('This account is already verified.');
    }
    if (!user.verificationOtp || user.verificationOtp !== otp) {
      throw new BadRequestException('Incorrect verification code.');
    }
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException(
        'Verification code has expired. Please sign up again to get a new one.',
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationOtp: null,
        otpExpiresAt: null,
      },
    });

    const payload = { sub: updatedUser.id, email: updatedUser.email };

    return {
      user: {
        id: payload.sub,
        name: updatedUser.name,
        email: updatedUser.email,
        provider: updatedUser.provider,
        avatar: updatedUser.avatar,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      throw new NotFoundException(
        'No account found with this email. Please sign up first.',
      );
    }
    if (user.provider === 'google') {
      throw new BadRequestException(
        'This account uses Google sign-in. Please use the "Continue with Google" button.',
      );
    }
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before signing in.',
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account does not have a password set. Please use Google sign-in.',
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Incorrect password. Please try again.');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      user: {
        id: payload.sub,
        name: user.name,
        email: user.email,
        provider: user.provider,
        avatar: user.avatar,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  async findOrCreateGoogleUser(googleUser: {
    googleId: string;
    email: string;
    name: string;
    avatar: string;
  }) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.googleId },
          { email: googleUser.email.toLowerCase() },
        ],
      },
    });

    let isNew = false;

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.googleId,
          avatar: googleUser.avatar,
          provider: 'google',
          isVerified: true,
        },
      });
    } else {
      isNew = true;
      user = await this.prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email.toLowerCase(),
          googleId: googleUser.googleId,
          avatar: googleUser.avatar,
          provider: 'google',
          isVerified: true,
        },
      });
    }

    const payload = { sub: user.id, email: user.email };

    return {
      isNew,
      user: {
        id: payload.sub,
        name: user.name,
        email: user.email,
        provider: 'google',
        avatar: user.avatar,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
}
