import type { InternalCancelCode } from '@/services/api/types/coaches';

export const COACH_CANCEL_CUTOFF_HOURS = 24;

export const INTERNAL_CANCEL_REASON_CODES: InternalCancelCode[] = [
  'coach_not_available',
  'slot_conflict',
  'technical_issue',
  'reschedule_requested',
  'violation_or_safety',
  'student_no_show_risk',
  'other',
];

export const INTERNAL_CANCEL_REASON_LABELS: Record<InternalCancelCode, string> = {
  coach_not_available: 'Coach not available',
  slot_conflict: 'Slot conflict',
  technical_issue: 'Technical issue',
  reschedule_requested: 'Reschedule requested',
  violation_or_safety: 'Violation or safety',
  student_no_show_risk: 'Student no-show risk',
  other: 'Other',
};

export const STUDENT_FACING_STATUS_OPTIONS = [
  { value: 'technical_issue', label: 'Technical issue' },
  { value: 'coach_unavailable', label: 'Coach unavailable' },
  { value: 'rescheduled_by_academy', label: 'Rescheduled by academy' },
] as const;

export type StudentFacingStatus = (typeof STUDENT_FACING_STATUS_OPTIONS)[number]['value'];

export function labelForInternalCancelCode(code: InternalCancelCode | ''): string {
  if (!code) return 'Select a reason';
  return INTERNAL_CANCEL_REASON_LABELS[code];
}

export function internalCancelCodeFromLabel(label: string): InternalCancelCode | null {
  const entry = (Object.entries(INTERNAL_CANCEL_REASON_LABELS) as [InternalCancelCode, string][]).find(
    ([, value]) => value === label,
  );
  return entry?.[0] ?? null;
}

export function labelForStudentFacingStatus(value: StudentFacingStatus | ''): string {
  if (!value) return 'Select a reason';
  return STUDENT_FACING_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? 'Select a reason';
}

export function studentFacingStatusFromLabel(label: string): StudentFacingStatus | null {
  return STUDENT_FACING_STATUS_OPTIONS.find((option) => option.label === label)?.value ?? null;
}

export function coachCancelSuccessMessage(isLateCancel: boolean): string {
  return isLateCancel
    ? 'Class cancelled. Late cancellation policy will apply.'
    : 'Class cancelled successfully.';
}
