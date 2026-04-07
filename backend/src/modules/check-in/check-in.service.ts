import { BadRequestException, Injectable } from '@nestjs/common';
import { InviteesService } from '../invitees/invitees.service';

@Injectable()
export class CheckInService {
  constructor(private readonly inviteesService: InviteesService) {}

  async checkIn(accessCode: string, eventId: string) {
    if (!accessCode?.trim()) {
      throw new BadRequestException('Access code is required');
    }

    if (!eventId?.trim()) {
      throw new BadRequestException('Event is required');
    }

    const invitee = await this.inviteesService.findByAccessCodeAndEventId(
      accessCode,
      eventId,
    );

    if (!invitee) {
      return {
        status: 'invalid',
        message: 'Code not recognised for this event',
      };
    }

    if (invitee.checkedIn) {
      return {
        status: 'already_checked',
        message: 'Code has already been used',
        name: invitee.name,
      };
    }

    invitee.checkedIn = true;
    invitee.checkedInAt = new Date();
    await invitee.save();

    return {
      status: 'valid',
      message: 'Check-in successful',
      name: invitee.name,
    };
  }
}
