import {
  Body,
  ForbiddenException,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckInService } from './check-in.service';

@Controller('check-in')
export class CheckInController {
  constructor(
    private readonly checkInService: CheckInService,
    private readonly eventsService: EventsService,
  ) {}

  @Post()
  async checkIn(
    @Body() checkInDto: CheckInDto,
    @Headers('x-usher-token') usherToken?: string,
  ) {
    // The usher token keeps this route protected without changing the endpoint shape.
    if (!usherToken) {
      throw new UnauthorizedException('Usher token is required');
    }

    const event = await this.eventsService.findByUsherToken(usherToken);

    if (!event.checkInEnabled) {
      throw new ForbiddenException('Event not started yet');
    }

    return this.checkInService.checkIn(checkInDto.accessCode, event.id);
  }
}
