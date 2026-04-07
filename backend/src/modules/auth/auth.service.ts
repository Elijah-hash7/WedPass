import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './schemas/user.schema';
import { EmailService } from './email.service';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const existing = await this.userModel.findOne({ email: email.toLowerCase() });

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
      existing.passwordHash = passwordHash;
      existing.name = name;
      existing.verificationOtp = otp;
      existing.otpExpiresAt = otpExpiresAt;
      await existing.save();
    } else {
      await this.userModel.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        verificationOtp: otp,
        otpExpiresAt,
      });
    }

    await this.emailService.sendVerificationOtp(email, name, otp);
    return { message: 'Verification code sent to your email.' };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });

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

    user.isVerified = true;
    user.verificationOtp = null;
    user.otpExpiresAt = null;
    await user.save();

    const payload = { sub: (user._id as any).toString(), email: user.email };

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

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });

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

    const payload = { sub: (user._id as any).toString(), email: user.email };

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
    let user = await this.userModel.findOne({
      $or: [{ googleId: googleUser.googleId }, { email: googleUser.email.toLowerCase() }],
    });

    if (user) {
      // Update existing user if needed
      user.googleId = googleUser.googleId;
      user.avatar = googleUser.avatar;
      user.provider = 'google';
      user.isVerified = true; // Google users are pre-verified
      await user.save();
    } else {
      user = await this.userModel.create({
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.googleId,
        avatar: googleUser.avatar,
        provider: 'google',
        isVerified: true,
      });
    }

    const payload = { sub: (user._id as any).toString(), email: user.email };

    return {
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
