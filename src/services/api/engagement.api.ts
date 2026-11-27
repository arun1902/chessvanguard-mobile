import { http, publicHttp } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type {
  ApiRecord,
  CoachRatingsResponse,
  CompleteActionPayload,
  ConfirmVerificationPayload,
  CreateReferralPayload,
  CreateReferralResponse,
  MessageResponse,
  NextActionResponse,
  Referral,
  RemarkEntityType,
  SendVerificationPayload,
  SubmitRatingPayload,
  SuccessResponse,
  UpdateMobileContextPayload,
} from '@/services/api/types';

/** Student: refer friends and earn CV coins. */
export const referralsApi = {
  create: (payload: CreateReferralPayload) => http.post<CreateReferralResponse>(Endpoints.referrals.create, payload),
  listMine: () => http.get<{ data: Referral[] }>(Endpoints.referrals.mine),
  getMyCoins: () => http.get<ApiRecord>(Endpoints.referrals.myCoins),
};

export const ratingsApi = {
  submit: (payload: SubmitRatingPayload) => http.post<ApiRecord>(Endpoints.ratings.submit, payload),
  trackDemoJoined: (coachId: string) => http.post<MessageResponse>(Endpoints.ratings.demoJoined, { coachId }),
  getCoachRatings: (coachId: string) => http.get<CoachRatingsResponse>(Endpoints.ratings.coach(coachId)),
};

/** Onboarding "next step" prompts shown after login. */
export const actionsApi = {
  getNext: () => http.get<NextActionResponse>(Endpoints.actions.next),
  complete: (payload: CompleteActionPayload) => http.post<SuccessResponse>(Endpoints.actions.complete, payload),
  skip: (actionId: string) => http.post<SuccessResponse>(Endpoints.actions.skip, { actionId }),
};

/** Email / WhatsApp OTP verification for the signed-in user. */
export const userVerificationApi = {
  send: (payload: SendVerificationPayload) => http.post<MessageResponse>(Endpoints.userVerification.send, payload),
  confirm: (payload: ConfirmVerificationPayload) =>
    http.post<SuccessResponse>(Endpoints.userVerification.confirm, payload),
  getMobileContext: () => http.get<ApiRecord>(Endpoints.userVerification.mobileContext),
  updateMobileContext: (payload: UpdateMobileContextPayload) =>
    http.post<ApiRecord>(Endpoints.userVerification.mobileContext, payload),
};

/** Student / Coach: verify chess platform ratings. */
export const platformApi = {
  verifyFide: (fideId: string) => http.get<ApiRecord>(Endpoints.platform.fide(fideId)),
  verifyChessCom: (username: string) => http.get<ApiRecord>(Endpoints.platform.chessCom(username)),
  verifyLichess: (username: string) => http.get<ApiRecord>(Endpoints.platform.lichess(username)),
};

/** Coach: read-only remarks on their own profile, plus summary stats. */
export const coachInsightsApi = {
  listRemarks: (entityType: RemarkEntityType, entityId: string) =>
    http.get<ApiRecord>(Endpoints.remarks.list(entityType, entityId)),
  getDashboardStats: () => http.get<ApiRecord>(Endpoints.dashboard.stats),
};

export const blogsApi = {
  getBySlug: (slug: string) => publicHttp.get<ApiRecord>(Endpoints.blogs.bySlug(slug)),
};
