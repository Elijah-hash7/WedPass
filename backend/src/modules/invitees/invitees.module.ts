import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { InviteesController } from './invitees.controller';
import { InviteesService } from './invitees.service';

@Module({
  imports: [EventsModule],
  controllers: [InviteesController],
  providers: [InviteesService],
  exports: [InviteesService],
})
export class InviteesModule {}
