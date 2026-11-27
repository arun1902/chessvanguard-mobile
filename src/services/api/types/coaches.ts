import type { ClassType, DayOfWeek, PaginationParams, TimingType } from '@/services/api/types/common';

export type CoachStatus = 'Active' | 'Inactive' | 'Verified' | 'Pending';

export type CoachTiming = {
  id: string;
  coachId?: string;
  day: DayOfWeek;
  /** HH:MM */
  time: string;
  label?: string;
  type: TimingType;
};

export type CoachTimingSlot = {
  id: string;
  time: string;
  day: string;
  label?: string;
};

export type CoachTimingsResponse = {
  slots: CoachTimingSlot[];
  availableDays: string[];
};

export type CoachTimingsQuery = {
  /** YYYY-MM-DD. Required unless `type` is `Regular`. */
  date?: string;
  type?: TimingType;
};

export type AvailableCoach = {
  id: string;
  name: string;
  specialization?: string;
  perDemoRate?: number;
  listingDemoPrice?: number;
  languages?: string[];
  experienceYears?: number;
  bio?: string;
  freeDemoSlotsCount?: number;
};

export type ListCoachesQuery = PaginationParams & {
  status?: CoachStatus;
  search?: string;
};

export type CoachProfile = {
  id: string;
  name: string;
  email: string;
  specialization: string;
  mobileNumber?: string;
  perRegularRate?: number;
  perDemoRate?: number;
  status?: CoachStatus;
  isListed?: boolean;
  profilePicture?: string | null;
  languages?: string[];
  bio?: string;
  education?: string;
  experienceYears?: number;
  displayRating?: string | null;
  studentsTaughtCount?: number | null;
  googleMeetLink?: string | null;
  weekly_timings?: CoachTiming[];
  [key: string]: unknown;
};

/** PUT /coaches/:id — full CoachInputSchema; coaches cannot change their own rates. */
export type UpdateCoachPayload = {
  name: string;
  email: string;
  specialization: string;
  weekly_timings: (Omit<CoachTiming, 'id' | 'coachId'> & { id?: string })[];
  mobileNumber?: string;
  profilePicture?: string | null;
  languages?: string[];
  bio?: string;
  education?: string;
  experienceYears?: number;
  displayRating?: string | null;
  studentsTaughtCount?: number | null;
  googleMeetLink?: string | null;
};

export type UpdateMyBioPayload = {
  name?: string;
  bio?: string;
  specialization?: string;
  fideId?: string;
  lichessId?: string;
  chessComId?: string;
  languages?: string[];
  education?: string;
  experienceYears?: number;
  resumeKey?: string;
};

export type AddMyTimingPayload = {
  day: DayOfWeek;
  time: string;
  type: TimingType;
  label?: string;
};

export type UploadUrlResponse = {
  uploadUrl?: string;
  url?: string;
  key?: string;
  fileName?: string;
  publicUrl?: string;
  isMock?: boolean;
  [key: string]: unknown;
};

export type ResumeUploadQuery = { fileName: string; contentType: string };
export type ProfilePictureUploadPayload = { coachId: string; contentType: string };

export type HiringStartPayload = {
  name: string;
  email: string;
  mobileNumber: string;
  fideId?: string;
  lichessId?: string;
  chessComId?: string;
  address?: string;
  nonFideRating?: number;
};

export type HiringVerifyOtpPayload = {
  email: string;
  mobileNumber: string;
  emailOtp: string;
  mobileOtp: string;
};

/** Identifies a class session either by id or by timing + date. */
export type ClassSessionRef =
  | { classSessionId: string; timingId?: string; scheduledDate?: string }
  | { classSessionId?: undefined; timingId: string; scheduledDate: string };

export type JoinClassPayload = {
  timingId: string;
  scheduledDate: string;
  classType?: ClassType;
};

export type JoinClassResponse = {
  joinUrl?: string | null;
  opensAt?: string;
  [key: string]: unknown;
};

export type InternalCancelCode =
  | 'coach_not_available'
  | 'slot_conflict'
  | 'technical_issue'
  | 'reschedule_requested'
  | 'violation_or_safety'
  | 'student_no_show_risk'
  | 'other';

export type CancelClassPayload = ClassSessionRef & {
  cutoffHours?: number;
  /** Omit or `false` to preview the cancellation; `true` to actually cancel. */
  confirm?: boolean;
  internalCancelCode?: InternalCancelCode;
  reasonCode?: string;
  internalReason?: string;
};

export type CompleteClassPayload = ClassSessionRef & {
  topic?: string;
  notes?: string;
};

export type MarkNotConductedPayload = ClassSessionRef & {
  internalReason?: string;
  studentFacingStatus?: string;
};
