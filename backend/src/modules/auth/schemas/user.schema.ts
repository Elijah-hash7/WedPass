import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, default: null })
  passwordHash: string | null;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: String, default: null })
  verificationOtp: string | null;

  @Prop({ type: Date, default: null })
  otpExpiresAt: Date | null;

  @Prop({ type: String, enum: ['local', 'google'], default: 'local' })
  provider: 'local' | 'google';

  @Prop({ type: String, default: null })
  googleId: string | null;

  @Prop({ type: String, default: null })
  avatar: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);