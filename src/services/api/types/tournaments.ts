export type TournamentEventStatus =
  | 'Scheduled'
  | 'Live'
  | 'Completed'
  | 'Cancelled'
  | 'CreatingOnLichess'
  | 'CreatedOnLichess'
  | 'CreationRetryPending'
  | 'CreationFailed';

export type TournamentParticipantStatus = 'Enrolled' | 'Joined' | 'Attended' | 'Missed' | 'Excused' | 'Late';

export type CreateTournamentEventPayload = {
  coachId: string;
  timingId: string;
  /** ISO datetime. */
  startAt: string;
  endAt: string;
  timezone?: string;
  isMandatory?: boolean;
  tournamentUrl?: string;
  meetingUrl?: string;
};

export type UpdateTournamentEventPayload = Partial<
  Omit<CreateTournamentEventPayload, 'coachId' | 'timingId'>
>;

export type RegisterPhysicalTournamentPayload = {
  category: string;
  studentName?: string;
};

export type PricePreviewPayload = {
  categoryIds: string[];
  customFieldValues?: Record<string, unknown>;
};

export type RegistrationSubmissionPayload = {
  studentName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  email: string;
  parentName: string;
  emergencyContact: string;
  upiId: string;
  fideId?: string;
  categoryIds: string[];
  customFieldValues?: Record<string, unknown>;
};

export type RegistrationPaymentSession = {
  payments_session_id?: string;
  amount?: number;
  [key: string]: unknown;
};
