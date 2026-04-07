import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { InviteesService } from '../invitees/invitees.service';

@Injectable()
export class MetricsService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly inviteesService: InviteesService,
  ) {}

  async getEventMetrics(eventId: string) {
    const event = await this.eventsService.findById(eventId);

    const totalInvitees = await this.inviteesService.countByEventId(eventId);
    const checkedInCount =
      await this.inviteesService.countCheckedInByEventId(eventId);

    return {
      eventId,
      guestLimit: event.guestLimit,
      totalInvitees,
      checkedInCount,
      remainingCount: Math.max(totalInvitees - checkedInCount, 0),
      availableSpots: Math.max(event.guestLimit - totalInvitees, 0),
    };
  }
}
