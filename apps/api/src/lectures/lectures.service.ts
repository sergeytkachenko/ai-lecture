import { Injectable } from '@nestjs/common';
import { db } from '../db/connection';
import { lectures, questions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { seedDefaultQuestions } from '../db/seed';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

@Injectable()
export class LecturesService {
  async create(title: string, speakerName: string) {
    const code = generateCode();
    const [lecture] = await db.insert(lectures).values({ title, speakerName, code }).returning();
    await seedDefaultQuestions(db, lecture.id);
    return { code: lecture.code, adminToken: lecture.adminToken };
  }

  async findByCode(code: string) {
    const [lecture] = await db.select().from(lectures).where(eq(lectures.code, code.toUpperCase()));
    return lecture || null;
  }

  async findByAdminToken(adminToken: string) {
    const [lecture] = await db.select().from(lectures).where(eq(lectures.adminToken, adminToken));
    return lecture || null;
  }

  async updateStatus(adminToken: string, status: string) {
    const [lecture] = await db
      .update(lectures)
      .set({ status: status as any })
      .where(eq(lectures.adminToken, adminToken))
      .returning();
    return lecture;
  }

  async getQuestionsForPhase(lectureId: string, phase: string) {
    return db
      .select()
      .from(questions)
      .where(eq(questions.lectureId, lectureId))
      .then(rows => rows.filter(q => q.phase === phase).sort((a, b) => a.order - b.order));
  }

  async getQuestionsByLecture(lectureId: string) {
    return db.select().from(questions).where(eq(questions.lectureId, lectureId));
  }

  async createBattleQuestion(lectureId: string, text: string, options: string[]) {
    const existing = await db
      .select()
      .from(questions)
      .where(eq(questions.lectureId, lectureId))
      .then(rows => rows.filter(q => q.phase === 'battle'));

    const [question] = await db
      .insert(questions)
      .values({
        lectureId,
        text,
        type: 'single_choice',
        phase: 'battle',
        order: existing.length + 1,
        config: { options },
        isActive: true,
      })
      .returning();
    return question;
  }

  async closeBattleQuestion(questionId: string) {
    const [question] = await db
      .update(questions)
      .set({ isActive: false })
      .where(eq(questions.id, questionId))
      .returning();
    return question;
  }
}
