import { http } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type {
  ApiRecord,
  AttendanceFeedback,
  AvailableCoach,
  AvailableCoachesQuery,
  BookClassPayload,
  BookClassResult,
  CountResponse,
  CreatePauseWindowPayload,
  JoinClassPayload,
  JoinClassResponse,
  LichessConnectionStatus,
  LichessOAuthConnectPayload,
  ListStudentsQuery,
  MessageResponse,
  Paginated,
  PaginationParams,
  Student,
  StudentAssignmentsQuery,
  UpdateStudentPayload,
  WeeklyReportQuery,
} from '@/services/api/types';

const E = Endpoints.students;

/**
 * `studentId` is the student's user id. A parent account may also pass the id
 * of a child that shares its parent email (see `getMyChildren`).
 */
export const studentsApi = {
  // --- Profile ---
  getDetails: (studentId: string) => http.get<Student>(E.details(studentId)),
  update: (studentId: string, payload: UpdateStudentPayload) =>
    http.put<ApiRecord>(E.update(studentId), payload),
  getMyChildren: () => http.get<ApiRecord>(E.myChildren),

  /** Coach: list own students. */
  list: (query: ListStudentsQuery = {}) => http.get<ApiRecord>(E.list, { query }),

  // --- Attendance, credits & history ---
  /** Coach: log attendance + feedback for a student. */
  logAttendance: (studentId: string, feedback: AttendanceFeedback) =>
    http.post<ApiRecord>(E.attendance(studentId), { feedback }),
  getAttendance: (studentId: string, query: PaginationParams = {}) =>
    http.get<ApiRecord>(E.attendance(studentId), { query }),
  getLedger: (studentId: string) => http.get<ApiRecord>(E.ledger(studentId)),
  getClassHistory: (studentId: string, query: PaginationParams = {}) =>
    http.get<ApiRecord>(E.classHistory(studentId), { query }),

  // --- Pause windows ---
  createPauseWindow: (studentId: string, payload: CreatePauseWindowPayload) =>
    http.post<ApiRecord>(E.pauseWindows(studentId), payload),
  listPauseWindows: (studentId: string) => http.get<ApiRecord>(E.pauseWindows(studentId)),
  resumePauseWindow: (studentId: string, pauseWindowId: string) =>
    http.post<ApiRecord>(E.resumePauseWindow(studentId, pauseWindowId)),

  // --- Coach discovery & booking ---
  listAvailableCoaches: ({ page = 1, limit = 20, date }: AvailableCoachesQuery = {}) =>
    http.get<Paginated<AvailableCoach>>(E.availableCoaches, {
      query: { page, limit, date: date?.trim() },
    }),
  bookClass: (studentId: string, payload: BookClassPayload) =>
    http.post<BookClassResult>(E.bookClass(studentId), payload),
  /** Finalise a paid demo booking once the payment sheet succeeds. */
  verifyAndConfirmBooking: (studentId: string, holdId: string) =>
    http.post<ApiRecord>(E.verifyAndConfirmBooking(studentId), { holdId }),
  getMyPendingBooking: () => http.get<ApiRecord>(E.myPendingBooking),
  cancelPendingBooking: (timingId: string) => http.post<ApiRecord>(E.cancelPendingBooking(timingId)),
  joinClass: (studentId: string, payload: JoinClassPayload) =>
    http.post<JoinClassResponse>(E.joinClass(studentId), payload),

  // --- Tournaments ---
  getTournamentUpcoming: (studentId: string) => http.get<ApiRecord>(E.tournamentUpcoming(studentId)),
  getTournamentHistory: (studentId: string, limit?: number) =>
    http.get<ApiRecord>(E.tournamentHistory(studentId), { query: { limit } }),
  joinTournament: (studentId: string) => http.post<ApiRecord>(E.tournamentJoin(studentId)),

  // --- Lichess ---
  saveLichessUsername: (studentId: string, username: string) =>
    http.post<ApiRecord>(E.lichessUsername(studentId), { username: username.trim() }),
  connectLichess: (studentId: string, payload: LichessOAuthConnectPayload) =>
    http.post<ApiRecord>(E.lichessOAuthConnect(studentId), payload),
  disconnectLichess: (studentId: string) => http.delete<MessageResponse>(E.lichessOAuthDisconnect(studentId)),
  getLichessStatus: (studentId: string) => http.get<LichessConnectionStatus>(E.lichessOAuthStatus(studentId)),
  getLichessTournamentResults: (studentId: string, nb = 30) =>
    http.get<{ results: ApiRecord[] }>(E.lichessOAuthTournamentResults(studentId), { query: { nb } }),

  // --- Puzzles & gamified dashboard ---
  getAssignments: (studentId: string, query: StudentAssignmentsQuery = {}) =>
    http.get<ApiRecord>(E.assignments(studentId), { query }),
  checkActiveAssignment: (studentId: string) => http.get<ApiRecord>(E.activeAssignmentCheck(studentId)),
  getQuests: (studentId: string) => http.get<ApiRecord>(E.quests(studentId)),
  getToday: (studentId: string) => http.get<ApiRecord>(E.today(studentId)),
  getWeeklyReport: (studentId: string, query: WeeklyReportQuery = {}) =>
    http.get<ApiRecord>(E.weeklyReport(studentId), { query }),
  getTrainingCount: (studentId: string) => http.get<CountResponse>(E.trainingCount(studentId)),
};
