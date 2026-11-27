import { http } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type {
  ApiRecord,
  CancelClassViaClassesPayload,
  ClassItem,
  ListClassesQuery,
  MeetingStatus,
} from '@/services/api/types';

/** Classes are scoped by role on the backend: students see theirs, coaches theirs. */
export const classesApi = {
  list: (query: ListClassesQuery = {}) => http.get<{ classes: ClassItem[] }>(Endpoints.classes.list, { query }),
  getDetails: (classId: string) => http.get<ApiRecord>(Endpoints.classes.details(classId)),
  /** Coach: call without `confirm` to preview, then with `confirm: true` to cancel. */
  cancel: (payload: CancelClassViaClassesPayload) => http.post<ApiRecord>(Endpoints.classes.cancel, payload),
};

/** Live meeting state for a regular class slot (`/student-coach-timings/:timingId`). */
export const meetingsApi = {
  /** Coach: start the meeting for a timing slot. */
  start: (timingId: string, scheduledDate?: string) =>
    http.post<Omit<MeetingStatus, 'googleMeetLink'>>(Endpoints.meetings.start(timingId), { scheduledDate }),
  /** Student: record that the student joined. */
  markJoined: (timingId: string, scheduledDate?: string) =>
    http.post<ApiRecord>(Endpoints.meetings.markJoined(timingId), { scheduledDate }),
  getStatus: (timingId: string, scheduledDate?: string) =>
    http.get<MeetingStatus>(Endpoints.meetings.status(timingId), { query: { scheduledDate } }),
};

/** Coach: lead (guest) demo classes. */
export const leadDemosApi = {
  getMeetingStatus: (leadId: string) => http.get<ApiRecord>(Endpoints.leads.meetingStatus(leadId)),
  start: (leadId: string) => http.post<ApiRecord>(Endpoints.leads.startDemo(leadId)),
};
