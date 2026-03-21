import { Controller, Post, Param, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { LecturesService } from '../lectures/lectures.service';
import { PollGateway } from '../gateway/poll.gateway';

@Controller()
export class ResponsesController {
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
    const lecture = await this.lecturesService.findByCode(code);
    if (!lecture) throw new NotFoundException();

    if (!body.fingerprint || !body.responses?.length) {
      throw new BadRequestException('Missing fingerprint or responses');
    }

    // Check if already responded to first question
    const alreadyResponded = await this.responsesService.hasResponded(
      body.responses[0].questionId,
      body.fingerprint,
    );
    if (alreadyResponded) {
      throw new BadRequestException('Already responded');
    }

    const data = body.responses.map(r => ({
      questionId: r.questionId,
      value: r.value,
      fingerprint: body.fingerprint,
    }));

    const result = await this.responsesService.submit(data);

    // Emit real-time updates
    const count = await this.responsesService.countByLecture(lecture.id);
    this.pollGateway.emitToRoom(lecture.code, 'responses:count', { count });
    this.pollGateway.emitToRoom(lecture.code, 'stats:update', { lectureCode: lecture.code });

    return { submitted: result.length };
  }
}
