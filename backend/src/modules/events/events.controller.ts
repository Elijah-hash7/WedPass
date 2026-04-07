import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createEvent(@Body() createEventDto: CreateEventDto, @Req() req: any) {
    return this.eventsService.createEvent(createEventDto, req.user.id);
  }

  @Get('by-invite-token/:token')
  async getEventByInviteToken(@Param('token') token: string) {
    const event = await this.eventsService.findByInviteeToken(token);
    return this.eventsService.toEventResponse(event);
  }

  @Get('by-usher-token/:token')
  async getEventByUsherToken(@Param('token') token: string) {
    const event = await this.eventsService.findByUsherToken(token);
    return this.eventsService.toEventResponse(event);
  }

  @Get(':eventId')
  @UseGuards(JwtAuthGuard)
  async getEventById(@Param('eventId') eventId: string, @Req() req: any) {
    const event = await this.eventsService.findById(eventId, req.user.id);
    return this.eventsService.toEventResponse(event);
  }

  @Patch(':eventId')
  @UseGuards(JwtAuthGuard)
  updateEvent(
    @Param('eventId') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: any,
  ) {
    return this.eventsService.updateEvent(eventId, updateEventDto, req.user.id);
  }

  @Delete(':eventId')
  @UseGuards(JwtAuthGuard)
  deleteEvent(@Param('eventId') eventId: string, @Req() req: any) {
    return this.eventsService.deleteEvent(eventId, req.user.id);
  }

  @Get(':eventId/metrics')
  @UseGuards(JwtAuthGuard)
  async getMetrics(@Param('eventId') eventId: string, @Req() req: any) {
    return this.eventsService.getMetrics(eventId, req.user.id);
  }
}
