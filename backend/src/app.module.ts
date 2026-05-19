import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './common/controllers/app.controller';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckInModule } from './modules/check-in/check-in.module';
import { EventsModule } from './modules/events/events.module';
import { InviteesModule } from './modules/invitees/invitees.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    EventsModule,
    InviteesModule,
    CheckInModule,
    MetricsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

