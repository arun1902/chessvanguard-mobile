import type { ClassType, PaginationParams } from '@/services/api/types/common';

export type StudentStatus = 'Active' | 'Inactive' | 'Overdue' | 'Paused';

export type Student = {
  id: string;
  name: string;
  email?: string;
  parentName?: string;
  parentEmail?: string;
  mobileNumber?: string;
  joiningDate?: string;
  coachId?: string;
  status?: StudentStatus;
  sessionBalance?: number;
  lowBalanceThreshold?: number;
  isOneOnOne?: boolean;
  [key: string]: unknown;
};

export type ListStudentsQuery = PaginationParams & {
  status?: StudentStatus;
  search?: string;
  sortBy?: string;
};

export type UpdateStudentPayload = {
  name?: string;
  email?: string;
  parentName?: string;
  parentEmail?: string;
  /** Exactly 10 digits. */
  mobileNumber?: string;
  goal?: string;
  chessLevel?: string;
  fideId?: string;
  lichessUsername?: string;
  chessDotComUsername?: string;
};

export type HomeworkStatus = 'Done' | 'NotDone' | 'PartiallyDone';

export type PerformanceTag =
  | 'DeepFocus'
  | 'TacticSpotter'
  | 'SolidDefense'
  | 'OpeningMaster'
  | 'BraveAttacker'
  | 'Patience'
  | 'Sportsmanship'
  | 'CuriousMind';

export type AttendanceFeedback = {
  /** ISO datetime. */
  date: string;
  homework: HomeworkStatus;
  performanceTags: PerformanceTag[];
  notes?: string;
};

export type CreatePauseWindowPayload = {
  startDate: string;
  endDate: string;
  notes?: string;
};

export type BookClassPayload = {
  coachId: string;
  /** Use `timingId` for demos, `timingIds` for multi-slot regular enrolments. */
  timingId?: string;
  timingIds?: string[];
  /** YYYY-MM-DD — required for demos. */
  scheduledDate?: string;
  classType: ClassType;
};

export type BookClassResult =
  | {
      requiresPayment: true;
      holdId: string;
      payments_session_id: string;
      paymentStatus?: string;
      amount: number;
      holdExpiresAt?: string;
    }
  | {
      requiresPayment?: false;
      [key: string]: unknown;
    };

export type AvailableCoachesQuery = PaginationParams & {
  /** YYYY-MM-DD */
  date?: string;
};

export type StudentAssignmentsQuery = { includeUnassigned?: boolean };
export type WeeklyReportQuery = { view?: 'parent' };

export type LichessOAuthConnectPayload = {
  code: string;
  /** 43–128 characters (PKCE). */
  codeVerifier: string;
  redirectUri: string;
};

export type LichessConnectionStatus = {
  connected: boolean;
  lichessId?: string;
  connectedAt?: string;
  tokenExpired: boolean;
};

export type CountResponse = { count: number };
