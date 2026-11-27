import { publicHttp } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type {
  ApiRecord,
  ContactPayload,
  DemoCancelPayload,
  DemoHoldPayload,
  DemoPaymentSessionPayload,
  DemoPaymentVerifyPayload,
  DemoReschedulePayload,
  DemoSlotsQuery,
  InquiryPayload,
  MessageResponse,
  NewsletterPayload,
  SendEmailOtpPayload,
  VerifyEmailOtpPayload,
  VerifyWhatsAppOtpPayload,
  WhatsAppOtpPayload,
} from '@/services/api/types';

const E = Endpoints.public;

/** Anonymous routes under `/public` (no login). Registration lives in `authApi`. */
export const publicApi = {
  getSettings: () => publicHttp.get<ApiRecord>(E.settings),

  sendEmailOtp: (payload: SendEmailOtpPayload) => publicHttp.post<ApiRecord>(E.otpSend, payload),
  verifyEmailOtp: (payload: VerifyEmailOtpPayload) => publicHttp.post<ApiRecord>(E.otpVerify, payload),
  sendWhatsAppOtp: (payload: WhatsAppOtpPayload) => publicHttp.post<ApiRecord>(E.whatsappOtpSend, payload),
  verifyWhatsAppOtp: (payload: VerifyWhatsAppOtpPayload) =>
    publicHttp.post<ApiRecord>(E.whatsappOtpVerify, payload),

  /** Requires either `day` or `date`. */
  getDemoSlots: (query: DemoSlotsQuery) => publicHttp.get<ApiRecord>(E.demoSlots, { query }),

  // Guest demo funnel: hold -> pay -> verify/status. 404 unless FUNNEL_BOOKING_ENABLED.
  holdDemo: (payload: DemoHoldPayload) => publicHttp.post<ApiRecord>(E.demoHold, payload),
  createDemoPaymentSession: (payload: DemoPaymentSessionPayload) =>
    publicHttp.post<ApiRecord>(E.demoPaymentSession, payload),
  verifyDemoPayment: (payload: DemoPaymentVerifyPayload) =>
    publicHttp.post<ApiRecord>(E.demoPaymentVerify, payload),
  getDemoStatus: (leadId: string) => publicHttp.get<ApiRecord>(E.demoStatus(leadId)),

  // Booking-link (guest) management, keyed by the permanent booking token.
  getDemoByToken: (token: string) => publicHttp.get<ApiRecord>(E.demoByToken(token)),
  getDemoMeetingStatus: (token: string) => publicHttp.get<ApiRecord>(E.demoMeetingStatus(token)),
  getDemoJoin: (token: string) => publicHttp.get<ApiRecord>(E.demoJoin(token)),
  /** `date` is YYYY-MM-DD. */
  getDemoManageSlots: (token: string, date: string) =>
    publicHttp.get<ApiRecord>(E.demoSlotsByToken(token), { query: { date } }),
  rescheduleDemo: (token: string, payload: DemoReschedulePayload) =>
    publicHttp.post<ApiRecord>(E.demoReschedule(token), payload),
  cancelDemo: (token: string, payload: DemoCancelPayload = {}) =>
    publicHttp.post<ApiRecord>(E.demoCancel(token), payload),
  createDemoPaySession: (token: string, sessionId: string) =>
    publicHttp.post<ApiRecord>(E.demoPaySession(token), { sessionId }),
  confirmDemoPayment: (token: string, sessionId: string) =>
    publicHttp.post<ApiRecord>(E.demoConfirmPayment(token), { sessionId }),

  createInquiry: (payload: InquiryPayload) => publicHttp.post<ApiRecord>(E.inquiry, payload),
  confirmDemo: (payload: ApiRecord) => publicHttp.post<ApiRecord>(E.confirmDemo, payload),

  /** Prefills the student sign-up form from a referral invite link. */
  getReferralPrefill: (token: string) => publicHttp.get<ApiRecord>(E.referralPrefill(token)),

  contactUs: (payload: ContactPayload) => publicHttp.post<MessageResponse>(E.contact, payload),
  subscribeNewsletter: (payload: NewsletterPayload) =>
    publicHttp.post<MessageResponse>(E.newsletter, payload),
};
