export enum LectureStatus {
  DRAFT = 'draft',
  PRE_LECTURE = 'pre_lecture',
  IN_PROGRESS = 'in_progress',
  POST_LECTURE = 'post_lecture',
  CLOSED = 'closed',
}

export enum QuestionType {
  SCALE = 'scale',
  SINGLE_CHOICE = 'single_choice',
}

export enum Phase {
  START = 'start',
  END = 'end',

}

export interface ScaleConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface SingleChoiceConfig {
  options: string[];
}

export type QuestionConfig = ScaleConfig | SingleChoiceConfig;

export interface LectureDto {
  id: string;
  title: string;
  speakerName: string;
  code: string;
  status: LectureStatus;
  presentationLink: string | null;
  createdAt: string;
}

export interface QuestionDto {
  id: string;
  lectureId: string;
  text: string;
  type: QuestionType;
  phase: Phase;
  order: number;
  config: QuestionConfig;
  isActive: boolean;
}

export interface ResponseDto {
  questionId: string;
  value: string;
}

export interface SubmitResponsesDto {
  responses: ResponseDto[];
  fingerprint: string;
}

export interface CreateLectureDto {
  title: string;
  speakerName: string;
}


export interface StatsQuestion {
  question: QuestionDto;
  responses: { value: string; count: number }[];
  total: number;
  average?: number;
}

export interface LectureStats {
  lecture: LectureDto;
  questions: StatsQuestion[];
}
