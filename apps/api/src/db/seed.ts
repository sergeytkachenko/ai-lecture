import { Database } from './connection';
import { questions } from './schema';

export async function seedDefaultQuestions(db: Database, lectureId: string) {
  const defaultQuestions = [
    // START phase
    {
      lectureId,
      text: 'Чи використовуєте ви AI?',
      type: 'scale' as const,
      phase: 'start' as const,
      order: 1,
      config: { min: 1, max: 10, minLabel: 'Ніколи не пробував(ла)', maxLabel: 'Щодня, не уявляю без нього' },
    },
    {
      lectureId,
      text: 'Чи страшно вам, що AI забере у вас професію психолога в майбутньому?',
      type: 'scale' as const,
      phase: 'start' as const,
      order: 2,
      config: { min: 1, max: 10, minLabel: 'Взагалі не хвилює', maxLabel: 'Дуже страшно' },
    },
    // END phase
    {
      lectureId,
      text: 'Чи використовуєте ви AI?',
      type: 'scale' as const,
      phase: 'end' as const,
      order: 1,
      config: { min: 1, max: 10, minLabel: 'Ніколи не пробував(ла)', maxLabel: 'Щодня, не уявляю без нього' },
    },
    {
      lectureId,
      text: 'Чи страшно вам, що AI забере у вас професію психолога в майбутньому?',
      type: 'scale' as const,
      phase: 'end' as const,
      order: 2,
      config: { min: 1, max: 10, minLabel: 'Взагалі не хвилює', maxLabel: 'Дуже страшно' },
    },
    {
      lectureId,
      text: 'Уявіть, що через 10 років вам потрібен психотерапевт. До кого ви підете?',
      type: 'single_choice' as const,
      phase: 'end' as const,
      order: 3,
      config: { options: ['Психотерапевт-людина', 'AI-психотерапевт', 'Психотерапевт-людина, якому допомагає AI'] },
    },
    {
      lectureId,
      text: 'Вам сподобалась лекція?',
      type: 'scale' as const,
      phase: 'end' as const,
      order: 4,
      config: { min: 1, max: 10, minLabel: 'Ні', maxLabel: 'Дуже сподобалась' },
    },
  ];

  await db.insert(questions).values(defaultQuestions);
}
