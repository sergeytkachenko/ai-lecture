import { Injectable, Logger } from '@nestjs/common';
import { db } from '../db/connection';
import { responses } from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ResponsesService {
  private readonly logger = new Logger(ResponsesService.name);

  async submit(data: { questionId: string; value: string; fingerprint: string }[]) {
    if (data.length === 0) {
      this.logger.warn('submit called with empty data array');
      return [];
    }
    const values = data.map(d => ({
      questionId: d.questionId,
      sessionFingerprint: d.fingerprint,
      value: d.value,
    }));
    this.logger.log(`Inserting ${values.length} responses into DB`);
    const result = await db.insert(responses).values(values).returning();
    this.logger.log(`DB insert complete: ${result.length} rows created`);
    return result;
  }

  async hasResponded(questionId: string, fingerprint: string): Promise<boolean> {
    const rows = await db
      .select()
      .from(responses)
      .where(and(eq(responses.questionId, questionId), eq(responses.sessionFingerprint, fingerprint)));
    this.logger.log(`hasResponded check: questionId=${questionId} fingerprint=${fingerprint} found=${rows.length > 0}`);
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
    this.logger.log(`countByLecture: lectureId=${lectureId} questions=${questionIds.length} uniqueRespondents=${fingerprints.size}`);
    return fingerprints.size;
  }
}
