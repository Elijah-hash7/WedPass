import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateToken } from '../../common/utils/code-generator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(createEventDto: CreateEventDto, ownerId: string) {
    const { name, date, guestLimit, venue } = createEventDto;

    if (!name?.trim()) {
      throw new BadRequestException('Event name is required');
    }

    if (!date || Number.isNaN(new Date(date).getTime())) {
      throw new BadRequestException('Event date must be a valid date');
    }

    if (!guestLimit || guestLimit < 1) {
      throw new BadRequestException('Guest limit must be at least 1');
    }

    const event = await this.prisma.event.create({
      data: {
        name: name.trim(),
        date: new Date(date),
        guestLimit,
        venue: venue?.trim() || '',
        checkInEnabled: false,
        inviteeToken: generateToken(),
        usherToken: generateToken(),
        ownerId,
      },
    });
    return this.toEventResponse(event, 'Event created successfully');
  }

  async findByInviteeToken(inviteeToken: string) {
    const event = await this.prisma.event.findUnique({ where: { inviteeToken } });

    if (!event) {
      throw new NotFoundException('Invite link is invalid');
    }

    return event;
  }

  async findByUsherToken(usherToken: string) {
    const event = await this.prisma.event.findUnique({ where: { usherToken } });

    if (!event) {
      throw new NotFoundException('Usher link is invalid');
    }

    return event;
  }

  async findById(eventId: string, ownerId?: string) {
    const filter: any = { id: eventId };
    if (ownerId) {
      filter.ownerId = ownerId;
    }

    const event = await this.prisma.event.findFirst({ where: filter });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    return event;
  }

  async updateEvent(eventId: string, updateEventDto: UpdateEventDto, ownerId: string) {
    const event = await this.findById(eventId, ownerId);
    const { name, date, guestLimit, venue, checkInEnabled } = updateEventDto;

    const updateData: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        throw new BadRequestException('Event name is required');
      }
      updateData.name = name.trim();
    }

    if (date !== undefined) {
      if (!date || Number.isNaN(new Date(date).getTime())) {
        throw new BadRequestException('Event date must be a valid date');
      }
      updateData.date = new Date(date);
    }

    if (guestLimit !== undefined) {
      if (!guestLimit || guestLimit < 1) {
        throw new BadRequestException('Guest limit must be at least 1');
      }

      const inviteeCount = await this.prisma.invitee.count({ where: { eventId: event.id } });
      if (guestLimit < inviteeCount) {
        throw new BadRequestException(
          `Guest limit cannot be lower than current registrations (${inviteeCount})`,
        );
      }

      updateData.guestLimit = guestLimit;
    }

    if (venue !== undefined) {
      updateData.venue = venue.trim();
    }

    if (checkInEnabled !== undefined) {
      updateData.checkInEnabled = Boolean(checkInEnabled);
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: event.id },
      data: updateData,
    });

    return this.toEventResponse(updatedEvent, 'Event updated successfully');
  }

  async deleteEvent(eventId: string, ownerId: string) {
    const event = await this.findById(eventId, ownerId);
    await this.prisma.event.delete({ where: { id: event.id } });

    return {
      message: 'Event deleted successfully',
      eventId,
    };
  }

  toEventResponse(event: any, message?: string) {
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL;

    return {
      ...(message ? { message } : {}),
      eventId: event.id,
      name: event.name,
      date: event.date,
      guestLimit: event.guestLimit,
      venue: event.venue,
      checkInEnabled: event.checkInEnabled,
      inviteeLink: `${frontendBaseUrl}/invite/${event.inviteeToken}`,
      usherLink: `${frontendBaseUrl}/usher/${event.usherToken}`,
    };
  }

  async getMetrics(eventId: string, ownerId: string) {
    const event = await this.findById(eventId, ownerId);
    const totalInvitees = await this.prisma.invitee.count({ where: { eventId: event.id } });
    const checkedInCount = await this.prisma.invitee.count({ where: { eventId: event.id, checkedIn: true } });

    return {
      eventId: String(event.id),
      guestLimit: event.guestLimit,
      totalInvitees,
      checkedInCount,
      remainingCount: totalInvitees - checkedInCount,
      availableSpots: event.guestLimit - totalInvitees,
    };
  }
}
