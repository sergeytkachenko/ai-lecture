import { Controller, Get, Post, Patch, Param, Body, NotFoundException, Res } from '@nestjs/common';
import { Response } from 'express';
import { LecturesService } from './lectures.service';
import { PollGateway } from '../gateway/poll.gateway';
import { StatsService } from '../stats/stats.service';

const STATUS_TO_PHASE: Record<string, string> = {
  pre_lecture: 'start',
  post_lecture: 'end',
};

@Controller()
export class LecturesController {
  constructor(
    private lecturesService: LecturesService,
    private pollGateway: PollGateway,
    private statsService: StatsService,
  ) {}

  @Post('lectures')
  async create(@Body() body: { title: string; speakerName: string }) {
    return this.lecturesService.create(body.title, body.speakerName);
  }

  @Get('lectures/:code')
  async findByCode(@Param('code') code: string) {
    const lecture = await this.lecturesService.findByCode(code);
    if (!lecture) throw new NotFoundException();
    return {
      id: lecture.id,
      title: lecture.title,
      speakerName: lecture.speakerName,
      code: lecture.code,
      status: lecture.status,
      createdAt: lecture.createdAt,
    };
  }

  @Get('lectures/:code/questions')
  async getQuestions(@Param('code') code: string) {
    const lecture = await this.lecturesService.findByCode(code);
    if (!lecture) throw new NotFoundException();
    const phase = STATUS_TO_PHASE[lecture.status];
    if (!phase) return [];
    return this.lecturesService.getQuestionsForPhase(lecture.id, phase);
  }

  @Get('lectures/:code/stats')
  async getPublicStats(@Param('code') code: string) {
    const lecture = await this.lecturesService.findByCode(code);
    if (!lecture) throw new NotFoundException();
    return this.statsService.getStats(lecture.id);
  }

  // Admin routes
  @Get('admin/:adminToken')
  async getAdmin(@Param('adminToken') adminToken: string) {
    const lecture = await this.lecturesService.findByAdminToken(adminToken);
    if (!lecture) throw new NotFoundException();
    const allQuestions = await this.lecturesService.getQuestionsByLecture(lecture.id);
    return { ...lecture, questions: allQuestions };
  }

  @Patch('admin/:adminToken/status')
  async updateStatus(
    @Param('adminToken') adminToken: string,
    @Body() body: { status: string },
  ) {
    const lecture = await this.lecturesService.updateStatus(adminToken, body.status);
    if (!lecture) throw new NotFoundException();
    this.pollGateway.emitToRoom(lecture.code, 'lecture:status', { status: lecture.status });
    return { status: lecture.status };
  }

  @Post('admin/:adminToken/battle')
  async createBattle(
    @Param('adminToken') adminToken: string,
    @Body() body: { text: string; options: string[] },
  ) {
    const lecture = await this.lecturesService.findByAdminToken(adminToken);
    if (!lecture) throw new NotFoundException();
    const question = await this.lecturesService.createBattleQuestion(lecture.id, body.text, body.options);
    this.pollGateway.emitToRoom(lecture.code, 'battle:question', question);
    return question;
  }

  @Patch('admin/:adminToken/battle/:questionId')
  async closeBattle(
    @Param('adminToken') adminToken: string,
    @Param('questionId') questionId: string,
  ) {
    const lecture = await this.lecturesService.findByAdminToken(adminToken);
    if (!lecture) throw new NotFoundException();
    const question = await this.lecturesService.closeBattleQuestion(questionId);
    this.pollGateway.emitToRoom(lecture.code, 'battle:closed', { questionId });
    return question;
  }

  @Get('admin/:adminToken/stats')
  async getAdminStats(@Param('adminToken') adminToken: string) {
    const lecture = await this.lecturesService.findByAdminToken(adminToken);
    if (!lecture) throw new NotFoundException();
    return this.statsService.getDetailedStats(lecture.id);
  }

  @Get('admin/:adminToken/export.csv')
  async exportCsv(@Param('adminToken') adminToken: string, @Res() res: Response) {
    const lecture = await this.lecturesService.findByAdminToken(adminToken);
    if (!lecture) throw new NotFoundException();
    const csv = await this.statsService.exportCsv(lecture.id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="lecture-${lecture.code}-responses.csv"`);
    res.send(csv);
  }
}
