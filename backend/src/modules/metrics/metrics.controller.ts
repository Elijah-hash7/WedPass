import { Controller, Get, Param } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get(':eventId')
  getEventMetrics(@Param('eventId') eventId: string) {
    return this.metricsService.getEventMetrics(eventId);
  }
}
