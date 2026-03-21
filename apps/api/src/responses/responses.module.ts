import { Module, forwardRef } from '@nestjs/common';
import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';
import { LecturesModule } from '../lectures/lectures.module';

@Module({
  imports: [forwardRef(() => LecturesModule)],
  controllers: [ResponsesController],
  providers: [ResponsesService],
  exports: [ResponsesService],
})
export class ResponsesModule {}
