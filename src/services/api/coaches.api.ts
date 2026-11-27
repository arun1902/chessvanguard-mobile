import { http, publicHttp } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type {
  AddMyTimingPayload,
  ApiRecord,
  CancelClassPayload,
  CoachProfile,
  CoachTiming,
  CoachTimingsQuery,
  CoachTimingsResponse,
  CompleteClassPayload,
  HiringStartPayload,
  HiringVerifyOtpPayload,
  JoinClassPayload,
  JoinClassResponse,
  ListCoachesQuery,
  MarkNotConductedPayload,
  MessageResponse,
  ProfilePictureUploadPayload,
  ResumeUploadQuery,
  UpdateCoachPayload,
  UpdateMyBioPayload,
  UploadUrlResponse,
} from '@/services/api/types';

const E = Endpoints.coaches;

/** Public coach-hiring funnel (no login). */
export const coachHiringApi = {
  start: (payload: HiringStartPayload) => publicHttp.post<ApiRecord>(E.hiringStart, payload),
  verifyOtp: (payload: HiringVerifyOtpPayload) => publicHttp.post<ApiRecord>(E.hiringVerifyOtp, payload),
  checkFide: (fideId: string) => publicHttp.get<ApiRecord>(E.hiringCheckFide(fideId)),
  checkLichess: (username: string) => publicHttp.get<ApiRecord>(E.hiringCheckLichess(username)),
  checkChessCom: (username: string) => publicHttp.get<ApiRecord>(E.hiringCheckChessCom(username)),
  submit: (payload: ApiRecord) => publicHttp.post<ApiRecord>(E.hiringSubmit, payload),
  getProfilePictureUploadUrl: (payload: ProfilePictureUploadPayload) =>
    http.post<UploadUrlResponse>(E.profilePictureUploadUrl, payload),
};

export const coachesApi = {
  /** Student: browse listed coaches. */
  list: (query: ListCoachesQuery = {}) => http.get<ApiRecord>(E.list, { query }),

  /** Coach: own profile (coachId must be the signed-in coach). */
  getDetails: (coachId: string) => http.get<CoachProfile>(E.details(coachId)),
  getResumeDownloadUrl: (coachId: string) => http.get<ApiRecord>(E.resume(coachId)),
  update: (coachId: string, payload: UpdateCoachPayload) => http.put<ApiRecord>(E.update(coachId), payload),

  /** Bookable slots for a coach. `date` (YYYY-MM-DD) is required unless type is `Regular`. */
  getTimings: (coachId: string, { date, type = 'Demo' }: CoachTimingsQuery = {}) =>
    http.get<CoachTimingsResponse>(E.timings(coachId), {
      query: { type, date: type === 'Regular' ? undefined : date },
    }),

  // --- Coach self-service (profile setup action flow) ---
  getMyResumeUploadUrl: (query: ResumeUploadQuery) =>
    http.get<UploadUrlResponse>(E.myResumeUploadUrl, { query }),
  updateMyBio: (payload: UpdateMyBioPayload) => http.patch<MessageResponse>(E.myBio, payload),
  getMyTimings: () => http.get<ApiRecord>(E.myTimings),
  addMyTiming: (payload: AddMyTimingPayload) => http.post<{ timing: CoachTiming }>(E.myTimings, payload),
  deleteMyTiming: (timingId: string) => http.delete<ApiRecord>(E.myTiming(timingId)),
  acceptRateConsent: () => http.post<ApiRecord>(E.myRateConsent),

  /** Earnings, optionally filtered by month (YYYY-MM). */
  getMyEarnings: (month?: string) => http.get<ApiRecord>(E.myPayments, { query: { month } }),

  // --- Class lifecycle (coachId must be the signed-in coach) ---
  joinClass: (coachId: string, payload: JoinClassPayload) =>
    http.post<JoinClassResponse>(E.joinClass(coachId), payload),
  /** Call without `confirm` to preview the impact, then with `confirm: true` to cancel. */
  cancelClass: (coachId: string, payload: CancelClassPayload) =>
    http.post<ApiRecord>(E.cancelClass(coachId), payload),
  completeClass: (coachId: string, payload: CompleteClassPayload) =>
    http.post<ApiRecord>(E.completeClass(coachId), payload),
  markNotConducted: (coachId: string, payload: MarkNotConductedPayload) =>
    http.post<ApiRecord>(E.markNotConducted(coachId), payload),
};
