import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiInfo() {
    return {
      message: 'WedPass backend is running',
      docsHint: 'Use /events, /invitees, /check-in, and /metrics routes',
    };
  }
}
