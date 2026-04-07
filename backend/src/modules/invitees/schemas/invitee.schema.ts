import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InviteeDocument = HydratedDocument<Invitee>;

@Schema({ timestamps: true })
export class Invitee {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true })
  eventId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  accessCode: string;

  @Prop({ default: false })
  checkedIn: boolean;

  @Prop()
  checkedInAt?: Date;
}

export const InviteeSchema = SchemaFactory.createForClass(Invitee);
