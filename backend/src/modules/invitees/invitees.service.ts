import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateAccessCode } from '../../common/utils/code-generator';
import { EventsService } from '../events/events.service';
import { CreateInviteeDto } from './dto/create-invitee.dto';
import { Invitee, InviteeDocument } from './schemas/invitee.schema';

@Injectable()
export class InviteesService {
  constructor(
    @InjectModel(Invitee.name)
    private readonly inviteeModel: Model<InviteeDocument>,
    private readonly eventsService: EventsService,
  ) {}

  async createInvitee(createInviteeDto: CreateInviteeDto) {
    const { inviteeToken, name } = createInviteeDto;

    if (!inviteeToken?.trim()) {
      throw new BadRequestException('Invitee token is required');
    }

    if (!name?.trim()) {
      throw new BadRequestException('Invitee name is required');
    }

    const event = await this.eventsService.findByInviteeToken(inviteeToken);

    const inviteeCount = await this.inviteeModel.countDocuments({
      eventId: event._id,
    });

    if (inviteeCount >= event.guestLimit) {
      throw new BadRequestException(
        'This event is full. The host needs to increase the guest limit before another pass can be generated.',
      );
    }

    const accessCode = await this.generateUniqueAccessCode();

    const invitee = await this.inviteeModel.create({
      eventId: event._id,
      name: name.trim(),
      accessCode,
    });

    return {
      message: 'Invitee registered successfully',
      inviteeId: invitee.id,
      eventId: String(invitee.eventId),
      name: invitee.name,
      accessCode: invitee.accessCode,
    };
  }

  async findByAccessCode(accessCode: string) {
    return this.inviteeModel.findOne({ accessCode: accessCode.toUpperCase() });
  }

  async findByAccessCodeAndEventId(accessCode: string, eventId: string) {
    const invitee = await this.inviteeModel.findOne({
      accessCode: accessCode.toUpperCase(),
    });

    if (!invitee) {
      return null;
    }

    return String(invitee.eventId) === eventId ? invitee : null;
  }

  async countByEventId(eventId: string) {
    return this.inviteeModel.countDocuments({ eventId });
  }

  async countCheckedInByEventId(eventId: string) {
    return this.inviteeModel.countDocuments({ eventId, checkedIn: true });
  }

  private async generateUniqueAccessCode() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const accessCode = generateAccessCode();
      const existingInvitee = await this.inviteeModel.findOne({ accessCode });

      if (!existingInvitee) {
        return accessCode;
      }
    }

    throw new BadRequestException('Could not generate a unique access code');
  }
}
