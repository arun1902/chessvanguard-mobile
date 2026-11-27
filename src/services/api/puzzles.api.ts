import { http } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type {
  AddThemePuzzlesPayload,
  ApiRecord,
  CountResponse,
  CreateAssignmentsPayload,
  CreateThemePayload,
  ListPuzzlesQuery,
  RecordAttemptPayload,
  ThemePuzzlesQuery,
  TrainingAttemptPayload,
} from '@/services/api/types';

export const puzzlesApi = {
  list: (query: ListPuzzlesQuery = {}) => http.get<ApiRecord>(Endpoints.puzzles.list, { query }),
  getById: (puzzleId: string) => http.get<ApiRecord>(Endpoints.puzzles.byId(puzzleId)),

  /** Training ground (free practice, separate from homework). */
  recordTrainingAttempt: (payload: TrainingAttemptPayload) =>
    http.post<ApiRecord>(Endpoints.puzzles.trainingAttempt, payload),
  getTrainingCount: () => http.get<CountResponse>(Endpoints.puzzles.trainingCount),
};

export const themesApi = {
  /** Visible themes, scoped by role. */
  list: () => http.get<ApiRecord>(Endpoints.themes.list),
  /** Coach: create a custom theme. */
  create: (payload: CreateThemePayload) => http.post<ApiRecord>(Endpoints.themes.create, payload),
  getPuzzlesForSelection: (themeId: string, query: ThemePuzzlesQuery = {}) =>
    http.get<ApiRecord>(Endpoints.themes.puzzlesForSelection(themeId), { query }),
  /** Coach: add puzzles to an owned theme. */
  addPuzzles: (themeId: string, payload: AddThemePuzzlesPayload) =>
    http.post<ApiRecord>(Endpoints.themes.addPuzzles(themeId), payload),
};

export const assignmentsApi = {
  /** Coach: assign puzzles to students. */
  create: (payload: CreateAssignmentsPayload) => http.post<ApiRecord>(Endpoints.assignments.create, payload),
  /** Coach: unassign a batch they own. */
  removeBatch: (batchId: string) => http.delete<ApiRecord>(Endpoints.assignments.batch(batchId)),
  getBatch: (batchId: string) => http.get<ApiRecord>(Endpoints.assignments.batch(batchId)),
  /** Student: record an attempt on an assigned puzzle. */
  recordAttempt: (assignmentRowId: string, payload: RecordAttemptPayload) =>
    http.post<ApiRecord>(Endpoints.assignments.attempt(assignmentRowId), payload),
};
