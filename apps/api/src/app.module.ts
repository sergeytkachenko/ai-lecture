import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LecturesModule } from './lectures/lectures.module';
import { ResponsesModule } from './responses/responses.module';
import { StatsModule } from './stats/stats.module';
import { PollGateway } from './gateway/poll.gateway';
import { HealthController } from './health/health.controller';
import { UtilsController } from './utils/utils.controller';

@Module({
  imports: [
    LecturesModule,
    ResponsesModule,
    StatsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'slides', 'dist'),
      serveRoot: '/slides',
      serveStaticOptions: {
        index: ['index.html'],
      },
    }),
  ],
  controllers: [HealthController, UtilsController],
  providers: [PollGateway],
})
export class AppModule {}
