import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  async onModuleInit() {
    await this.initializeTransporter();
  }

  private async initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const rawSecure = process.env.SMTP_SECURE;
    let secure = rawSecure ? rawSecure === 'true' : port === 465;

    if (host && user && pass) {
      if (port === 587 && secure) {
        this.logger.warn(
          'SMTP_SECURE=true with port 587 is invalid for most providers. Falling back to secure=false.',
        );
        secure = false;
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log(`SMTP configured: ${host}:${port} (secure: ${secure})`);

      try {
        await this.transporter.verify();
        this.logger.log('SMTP connection verified successfully');
      } catch (error) {
        this.logger.error(
          `SMTP verification failed: ${this.formatError(error)}`,
        );
      }
    } else {
      this.logger.warn('⚠️ SMTP NOT CONFIGURED. OTPs will be printed to the backend console ONLY.');
      this.logger.warn('Fill in SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env to send real emails.');
    }
  }

  async sendVerificationOtp(to: string, name: string, otp: string): Promise<void> {
    const from = process.env.SMTP_FROM ?? '"WedPass" <noreply@wedpass.app>';

    if (!this.transporter) {
      this.logger.warn(`[DEV MODE] OTP for ${to}: ${otp} (User: ${name})`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: 'Verify your WedPass account',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #09090b; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px;">
            <div style="margin-bottom: 24px;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b3a62" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 12px; font-family: serif; color: #09090b;">
              Verify your email
            </h1>
            <p style="color: #71717a; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
              Hello ${name},<br/>
              To complete your sign-up, please use the following 6-digit verification code. This code will expire in 10 minutes.
            </p>
            <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
              <p style="font-size: 11px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; color: #71717a; margin-bottom: 16px;">
                Verification Code
              </p>
              <p style="font-size: 48px; font-weight: 700; letter-spacing: 0.15em; color: #8b3a62; margin: 0; font-family: monospace;">
                ${otp}
              </p>
            </div>
            <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5;">
              If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
            </p>
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f4f4f5; text-align: center;">
              <p style="font-size: 12px; color: #a1a1aa; margin: 0;">
                &copy; 2026 WedPass. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Verification OTP sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification OTP to ${to}: ${this.formatError(error)}`,
      );
      throw new InternalServerErrorException(
        'Failed to send verification email. Check your SMTP settings.',
      );
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
