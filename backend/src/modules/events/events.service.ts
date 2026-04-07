import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateToken } from '../../common/utils/code-generator';
import { Invitee, InviteeDocument } from '../invitees/schemas/invitee.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument } from './schemas/event.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Invitee.name)
    private readonly inviteeModel: Model<InviteeDocument>,
  ) {}

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

    const event = await this.eventModel.create({
      name: name.trim(),
      date: new Date(date),
      guestLimit,
      venue: venue?.trim() || '',
      checkInEnabled: false,
      inviteeToken: generateToken(),
      usherToken: generateToken(),
      owner: ownerId as any,
    });
    return this.toEventResponse(event, 'Event created successfully');
  }

  async findByInviteeToken(inviteeToken: string) {
    const event = await this.eventModel.findOne({ inviteeToken });

    if (!event) {
      throw new NotFoundException('Invite link is invalid');
    }

    return event;
  }

  async findByUsherToken(usherToken: string) {
    const event = await this.eventModel.findOne({ usherToken });

    if (!event) {
      throw new NotFoundException('Usher link is invalid');
    }

    return event;
  }

  async findById(eventId: string, ownerId?: string) {
    const filter: any = { _id: eventId };
    if (ownerId) {
      filter.owner = ownerId;
    }
    
    const event = await this.eventModel.findOne(filter);

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    return event;
  }

  async updateEvent(eventId: string, updateEventDto: UpdateEventDto, ownerId: string) {
    const event = await this.findById(eventId, ownerId);
    const { name, date, guestLimit, venue, checkInEnabled } = updateEventDto;

    if (name !== undefined) {
      if (!name.trim()) {
        throw new BadRequestException('Event name is required');
      }
      event.name = name.trim();
    }

    if (date !== undefined) {
      if (!date || Number.isNaN(new Date(date).getTime())) {
        throw new BadRequestException('Event date must be a valid date');
      }
      event.date = new Date(date);
    }

    if (guestLimit !== undefined) {
      if (!guestLimit || guestLimit < 1) {
        throw new BadRequestException('Guest limit must be at least 1');
      }

      const inviteeCount = await this.inviteeModel.countDocuments({ eventId: event._id });
      if (guestLimit < inviteeCount) {
        throw new BadRequestException(
          `Guest limit cannot be lower than current registrations (${inviteeCount})`,
        );
      }

      event.guestLimit = guestLimit;
    }

    if (venue !== undefined) {
      event.venue = venue.trim();
    }

    if (checkInEnabled !== undefined) {
      event.checkInEnabled = Boolean(checkInEnabled);
    }

    await event.save();
    return this.toEventResponse(event, 'Event updated successfully');
  }

  async deleteEvent(eventId: string, ownerId: string) {
    const event = await this.findById(eventId, ownerId);
    await this.inviteeModel.deleteMany({ eventId: event._id });
    await event.deleteOne();

    return {
      message: 'Event deleted successfully',
      eventId,
    };
  }

  toEventResponse(event: EventDocument, message?: string) {
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
    const totalInvitees = await this.inviteeModel.countDocuments({ eventId: event._id });
    const checkedInCount = await this.inviteeModel.countDocuments({ eventId: event._id, checkedIn: true });

    return {
      eventId: String(event._id),
      guestLimit: event.guestLimit,
      totalInvitees,
      checkedInCount,
      remainingCount: totalInvitees - checkedInCount,
      availableSpots: event.guestLimit - totalInvitees,
    };
  }
}
