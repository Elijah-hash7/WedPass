import { Body, Controller, Post } from '@nestjs/common';
import { CreateInviteeDto } from './dto/create-invitee.dto';
import { InviteesService } from './invitees.service';

@Controller('invitees')
export class InviteesController {
  constructor(private readonly inviteesService: InviteesService) {}

  @Post()
  createInvitee(@Body() createInviteeDto: CreateInviteeDto) {
    return this.inviteesService.createInvitee(createInviteeDto);
  }
}
