import { Module, forwardRef } from '@nestjs/common';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';
import { PollGateway } from '../gateway/poll.gateway';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [forwardRef(() => StatsModule)],
  controllers: [LecturesController],
  providers: [LecturesService, PollGateway],
  exports: [LecturesService, PollGateway],
})
export class LecturesModule {}
