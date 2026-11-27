import type { PaginationParams } from '@/services/api/types/common';

export type ListPuzzlesQuery = PaginationParams & {
  theme?: string;
  minRating?: number;
  maxRating?: number;
  puzzleId?: string;
};

export type ThemePuzzlesQuery = PaginationParams & {
  systemTheme?: string;
  minRating?: number;
  maxRating?: number;
};

export type CreateThemePayload = { name: string; description?: string };
export type AddThemePuzzlesPayload = { puzzle_ids: string[] };

export type CreateAssignmentsPayload = {
  student_ids: string[];
  theme_id: string;
  puzzle_ids: string[];
  due_date?: string;
};

export type RecordAttemptPayload = {
  solved: boolean;
  /** Seconds spent on the puzzle. */
  time_taken?: number;
};

export type TrainingAttemptPayload = RecordAttemptPayload & { puzzle_id: string };
