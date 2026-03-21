import { Controller, Post, Param, Body, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { LecturesService } from '../lectures/lectures.service';
import { PollGateway } from '../gateway/poll.gateway';

@Controller()
export class ResponsesController {
  private readonly logger = new Logger(ResponsesController.name);

  constructor(
    private responsesService: ResponsesService,
    private lecturesService: LecturesService,
    private pollGateway: PollGateway,
  ) {}

  @Post('lectures/:code/responses')
  async submit(
    @Param('code') code: string,
    @Body() body: { responses: { questionId: string; value: string }[]; fingerprint: string },
  ) {
    this.logger.log(`POST /lectures/${code}/responses fingerprint=${body.fingerprint} responsesCount=${body.responses?.length}`);

    const lecture = await this.lecturesService.findByCode(code);
    if (!lecture) {
      this.logger.warn(`Lecture not found: code=${code}`);
      throw new NotFoundException();
    }
    this.logger.log(`Lecture found: id=${lecture.id} status=${lecture.status}`);

    if (!body.fingerprint || !body.responses?.length) {
      this.logger.warn(`Bad request: fingerprint=${body.fingerprint} responsesLength=${body.responses?.length}`);
      throw new BadRequestException('Missing fingerprint or responses');
    }

    // Check if already responded to first question
    const alreadyResponded = await this.responsesService.hasResponded(
      body.responses[0].questionId,
      body.fingerprint,
    );
    if (alreadyResponded) {
      this.logger.warn(`Duplicate submission: fingerprint=${body.fingerprint} questionId=${body.responses[0].questionId}`);
      throw new BadRequestException('Already responded');
    }

    const data = body.responses.map(r => ({
      questionId: r.questionId,
      value: r.value,
      fingerprint: body.fingerprint,
    }));

    this.logger.log(`Inserting ${data.length} responses: ${JSON.stringify(data)}`);
    const result = await this.responsesService.submit(data);
    this.logger.log(`Inserted ${result.length} responses: ids=${result.map(r => r.id).join(',')}`);

    // Emit real-time updates
    const count = await this.responsesService.countByLecture(lecture.id);
    this.logger.log(`Emitting updates: lecture=${lecture.code} totalRespondents=${count}`);
    this.pollGateway.emitToRoom(lecture.code, 'responses:count', { count });
    this.pollGateway.emitToRoom(lecture.code, 'stats:update', { lectureCode: lecture.code });

    return { submitted: result.length };
  }
}
