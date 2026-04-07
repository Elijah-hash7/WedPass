import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './common/controllers/app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CheckInModule } from './modules/check-in/check-in.module';
import { EventsModule } from './modules/events/events.module';
import { InviteesModule } from './modules/invitees/invitees.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URL as string
    ),
    AuthModule,
    EventsModule,
    InviteesModule,
    CheckInModule,
    MetricsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

