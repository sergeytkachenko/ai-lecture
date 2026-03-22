import { pgTable, uuid, varchar, integer, boolean, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const lectureStatusEnum = pgEnum('lecture_status', ['draft', 'pre_lecture', 'in_progress', 'post_lecture', 'closed']);
export const questionTypeEnum = pgEnum('question_type', ['scale', 'single_choice']);
export const phaseEnum = pgEnum('phase', ['start', 'end']);

export const lectures = pgTable('lectures', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  speakerName: varchar('speaker_name', { length: 255 }).notNull(),
  code: varchar('code', { length: 6 }).unique().notNull(),
  status: lectureStatusEnum('status').default('draft').notNull(),
  adminToken: uuid('admin_token').defaultRandom().notNull(),
  presentationLink: varchar('presentation_link', { length: 2048 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  lectureId: uuid('lecture_id').references(() => lectures.id).notNull(),
  text: varchar('text', { length: 1000 }).notNull(),
  type: questionTypeEnum('type').notNull(),
  phase: phaseEnum('phase').notNull(),
  order: integer('order').notNull(),
  config: jsonb('config').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
});

export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').references(() => questions.id).notNull(),
  sessionFingerprint: varchar('session_fingerprint', { length: 64 }).notNull(),
  value: varchar('value', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
