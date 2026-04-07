import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from '../events/events.module';
import { InviteesController } from './invitees.controller';
import { InviteesService } from './invitees.service';
import { Invitee, InviteeSchema } from './schemas/invitee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invitee.name, schema: InviteeSchema }]),
    EventsModule,
  ],
  controllers: [InviteesController],
  providers: [InviteesService],
  exports: [InviteesService, MongooseModule],
})
export class InviteesModule {}
