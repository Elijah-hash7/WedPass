import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { InviteesModule } from '../invitees/invitees.module';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [EventsModule, InviteesModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
