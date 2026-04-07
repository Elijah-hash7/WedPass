import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, min: 1 })
  guestLimit: number;

  @Prop({ required: false, trim: true })
  venue: string;

  @Prop({ default: false })
  checkInEnabled: boolean;

  @Prop({ required: true, unique: true })
  inviteeToken: string;

  @Prop({ required: true, unique: true })
  usherToken: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: User;
}

export const EventSchema = SchemaFactory.createForClass(Event);
