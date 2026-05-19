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
          <div style="background-color: #f8fafc; padding: 40px 0;">
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px; color: #1f2937; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #f1f5f9;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #8b3a62 0%, #e11d48 100%); width: 64px; height: 64px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(225, 29, 72, 0.3);">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: auto;">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
              </div>
              <h1 style="font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 16px; color: #0f172a; letter-spacing: -0.03em;">
                Verify your email
              </h1>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: center;">
                Hello <strong>\${name}</strong>,<br/>
                Welcome to WedPass! To complete your sign-up, please use the following 6-digit verification code. This code will expire in 10 minutes.
              </p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);">
                <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #64748b; margin-bottom: 12px; margin-top: 0;">
                  Verification Code
                </p>
                <p style="font-size: 52px; font-weight: 800; letter-spacing: 0.2em; color: #e11d48; margin: 0; font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; text-shadow: 0 2px 10px rgba(225, 29, 72, 0.1);">
                  \${otp}
                </p>
              </div>
              <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center; margin-bottom: 0;">
                If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
              </p>
              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="font-size: 13px; color: #cbd5e1; margin: 0; font-weight: 500;">
                  &copy; 2026 WedPass. All rights reserved.
                </p>
              </div>
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
