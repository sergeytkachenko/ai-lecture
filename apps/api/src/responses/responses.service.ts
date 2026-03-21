import { Injectable } from '@nestjs/common';
import { db } from '../db/connection';
import { responses } from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ResponsesService {
  async submit(data: { questionId: string; value: string; fingerprint: string }[]) {
    if (data.length === 0) return [];
    const values = data.map(d => ({
      questionId: d.questionId,
      sessionFingerprint: d.fingerprint,
      value: d.value,
    }));
    return db.insert(responses).values(values).returning();
  }

  async hasResponded(questionId: string, fingerprint: string): Promise<boolean> {
    const rows = await db
      .select()
      .from(responses)
      .where(and(eq(responses.questionId, questionId), eq(responses.sessionFingerprint, fingerprint)));
    return rows.length > 0;
  }

  async countByLecture(lectureId: string): Promise<number> {
    const { questions } = await import('../db/schema');
    const allQuestions = await db.select().from(questions).where(eq(questions.lectureId, lectureId));
    const questionIds = allQuestions.map(q => q.id);
    if (questionIds.length === 0) return 0;

    const allResponses = await db.select().from(responses);
    const fingerprints = new Set(
      allResponses
        .filter(r => questionIds.includes(r.questionId))
        .map(r => r.sessionFingerprint),
    );
    return fingerprints.size;
  }
}
