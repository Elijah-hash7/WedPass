import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { InviteesModule } from '../invitees/invitees.module';
import { CheckInController } from './check-in.controller';
import { CheckInService } from './check-in.service';

@Module({
  imports: [InviteesModule, EventsModule],
  controllers: [CheckInController],
  providers: [CheckInService],
})
export class CheckInModule {}
