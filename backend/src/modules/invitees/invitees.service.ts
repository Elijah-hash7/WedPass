import { BadRequestException, Injectable } from '@nestjs/common';
import { generateAccessCode } from '../../common/utils/code-generator';
import { EventsService } from '../events/events.service';
import { CreateInviteeDto } from './dto/create-invitee.dto';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class InviteesService {
  constructor(
    private prisma: PrismaService,
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

    const inviteeCount = await this.prisma.invitee.count({
      where: { eventId: event.id },
    });

    if (inviteeCount >= event.guestLimit) {
      throw new BadRequestException(
        'This event is full. The host needs to increase the guest limit before another pass can be generated.',
      );
    }

    const accessCode = await this.generateUniqueAccessCode();

    const invitee = await this.prisma.invitee.create({
      data: {
        eventId: event.id,
        name: name.trim(),
        accessCode,
      },
    });

    return {
      message: 'Invitee registered successfully',
      inviteeId: invitee.id,
      eventId: invitee.eventId,
      name: invitee.name,
      accessCode: invitee.accessCode,
    };
  }

  async findByAccessCode(accessCode: string) {
    return this.prisma.invitee.findUnique({ where: { accessCode: accessCode.toUpperCase() } });
  }

  async findByAccessCodeAndEventId(accessCode: string, eventId: string) {
    const invitee = await this.prisma.invitee.findUnique({
      where: { accessCode: accessCode.toUpperCase() },
    });

    if (!invitee) {
      return null;
    }

    return invitee.eventId === eventId ? invitee : null;
  }

  async countByEventId(eventId: string) {
    return this.prisma.invitee.count({ where: { eventId } });
  }

  async countCheckedInByEventId(eventId: string) {
    return this.prisma.invitee.count({ where: { eventId, checkedIn: true } });
  }

  private async generateUniqueAccessCode() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const accessCode = generateAccessCode();
      const existingInvitee = await this.prisma.invitee.findUnique({ where: { accessCode } });

      if (!existingInvitee) {
        return accessCode;
      }
    }

    throw new BadRequestException('Could not generate a unique access code');
  }
}
