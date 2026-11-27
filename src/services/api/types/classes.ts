import type { CancelClassPayload } from '@/services/api/types/coaches';

export type ClassStatus = 'upcoming' | 'completed' | 'cancelled' | 'not_conducted' | 'unresolved';

export type ClassRecording = {
  url: string;
  objectName: string;
  expiresAt: string;
  label?: string;
};

export type ClassSessionStudent = {
  studentId: string;
  studentName: string;
  joinedAt?: string;
  status: ClassStatus;
  isLateCancel?: boolean;
};

export type ClassItem = {
  id: string;
  enrollmentId: string;
  timingId: string;
  classSessionId?: string;
  type: 'Demo' | 'Regular' | 'Group';
  studentId: string;
  studentName: string;
  coachId: string;
  coachName: string;
  scheduledDate: string;
  day: string;
  time: string;
  isActive?: boolean;
  recordings?: ClassRecording[];
  status: ClassStatus;
  isLateCancel?: boolean;
  demoJoinedAt?: string;
  hasRated?: boolean;
  isStarted?: boolean;
  startedAt?: string;
  studentJoinedAt?: string;
  enrolledStudents?: ClassSessionStudent[];
  enrolledCount?: number;
  scheduledEndAt?: string;
  completionAllowedAt?: string;
  finalStatus?: string;
  topic?: string;
  completionNotes?: string;
  studentFacingStatus?: string;
  studentFacingMessage?: string;
  cancellationReason?: string;
  internalReason?: string;
  internalCancelCode?: string;
  refundStatus?: string | null;
};

export type ListClassesQuery = {
  status?: ClassStatus;
  type?: 'Demo' | 'Regular' | 'Group';
  dateFrom?: string;
  dateTo?: string;
};

export type CancelClassViaClassesPayload = CancelClassPayload & { coachId?: string };

export type MeetingStatus = {
  isStarted: boolean;
  startedAt: string | null;
  googleMeetLink?: string | null;
  joinUrl: string | null;
};
