import { Injectable } from '@nestjs/common';
import { db } from '../db/connection';
import { questions, responses } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';

@Injectable()
export class StatsService {
  async getStats(lectureId: string) {
    const allQuestions = await db.select().from(questions).where(eq(questions.lectureId, lectureId));
    const questionIds = allQuestions.map(q => q.id);
    const allResponses = questionIds.length > 0
      ? await db.select().from(responses).where(inArray(responses.questionId, questionIds))
      : [];

    return allQuestions
      .sort((a, b) => {
        const phaseOrder = { start: 0, end: 1, battle: 2 };
        const pa = phaseOrder[a.phase] ?? 99;
        const pb = phaseOrder[b.phase] ?? 99;
        if (pa !== pb) return pa - pb;
        return a.order - b.order;
      })
      .map(q => {
        const qResponses = allResponses.filter(r => r.questionId === q.id);
        const valueCounts: Record<string, number> = {};
        for (const r of qResponses) {
          valueCounts[r.value] = (valueCounts[r.value] || 0) + 1;
        }
        const distribution = Object.entries(valueCounts).map(([value, count]) => ({ value, count }));

        let average: number | undefined;
        if (q.type === 'scale' && qResponses.length > 0) {
          const sum = qResponses.reduce((s, r) => s + Number(r.value), 0);
          average = Math.round((sum / qResponses.length) * 100) / 100;
        }

        return {
          question: q,
          responses: distribution,
          total: qResponses.length,
          average,
        };
      });
  }

  async getDetailedStats(lectureId: string) {
    const stats = await this.getStats(lectureId);
    const questionIds = stats.map(s => s.question.id);
    const allResponses = questionIds.length > 0
      ? await db.select().from(responses).where(inArray(responses.questionId, questionIds))
      : [];

    const detailed = stats.map(s => {
      const individualResponses = allResponses
        .filter(r => r.questionId === s.question.id)
        .map(r => ({
          fingerprint: r.sessionFingerprint,
          value: r.value,
          createdAt: r.createdAt,
        }));

      let median: number | undefined;
      let stdDev: number | undefined;
      if (s.question.type === 'scale' && individualResponses.length > 0) {
        const values = individualResponses.map(r => Number(r.value)).sort((a, b) => a - b);
        const mid = Math.floor(values.length / 2);
        median = values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        stdDev = Math.round(Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length) * 100) / 100;
      }

      return { ...s, individualResponses, median, stdDev };
    });

    return detailed;
  }

  async exportCsv(lectureId: string): Promise<string> {
    const allQuestions = await db.select().from(questions).where(eq(questions.lectureId, lectureId));
    const questionIds = allQuestions.map(q => q.id);
    const allResponses = questionIds.length > 0
      ? await db.select().from(responses).where(inArray(responses.questionId, questionIds))
      : [];

    const rows: string[] = ['question_text,question_type,phase,fingerprint,value,created_at'];

    for (const q of allQuestions) {
      const qResponses = allResponses.filter(r => r.questionId === q.id);
      for (const r of qResponses) {
        const text = q.text.replace(/"/g, '""');
        rows.push(`"${text}",${q.type},${q.phase},${r.sessionFingerprint},${r.value},${r.createdAt.toISOString()}`);
      }
    }

    return rows.join('\n');
  }
}
