import { Module } from '@nestjs/common';
import { LecturesModule } from './lectures/lectures.module';
import { ResponsesModule } from './responses/responses.module';
import { StatsModule } from './stats/stats.module';
import { PollGateway } from './gateway/poll.gateway';
import { HealthController } from './health/health.controller';

@Module({
  imports: [LecturesModule, ResponsesModule, StatsModule],
  controllers: [HealthController],
  providers: [PollGateway],
})
export class AppModule {}
