import { http, publicHttp } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type {
  ApiRecord,
  ConfirmRefillResponse,
  CreateRefillSessionPayload,
  GeneratePaymentLinkPayload,
  PaymentTokenDetails,
  PricingPlan,
  RefillSession,
} from '@/services/api/types';

const E = Endpoints.payments;

export const paymentsApi = {
  /** Public: resolve a payment-link token to the student's billing details. */
  verifyToken: (token: string) => publicHttp.get<PaymentTokenDetails>(E.verifyToken(token)),

  /** Student: secure payment token for the signed-in student. */
  getSelfToken: () => http.get<ApiRecord>(E.selfToken),

  /** Public: generate or reuse a Zoho payment link for a payment token. */
  generateLink: (token: string, payload: GeneratePaymentLinkPayload) =>
    publicHttp.post<ApiRecord>(E.generateLink(token), payload),

  /** Public: poll the status of a Zoho payment link. */
  checkStatus: (linkId: string) => publicHttp.post<ApiRecord>(E.checkStatus, { linkId }),

  /** Student: start a refill checkout for a pricing plan (optionally redeeming CV coins). */
  createRefillSession: ({ planId, cvCoinsToRedeem = 0 }: CreateRefillSessionPayload) =>
    http.post<RefillSession>(E.createRefillSession, { plan_id: planId, cvCoinsToRedeem }),

  /** Student: confirm a refill after the payment sheet completes. */
  confirmRefill: (paymentsSessionId: string) =>
    http.post<ConfirmRefillResponse>(E.confirmRefill, { payments_session_id: paymentsSessionId }),

  /** Student: re-check pending refills against Zoho (call when the refill screen opens). */
  reconcilePending: () => http.post<ApiRecord>(E.reconcilePending),
};

export const pricingPlansApi = {
  /** Active plans with the student's effective discounted price. */
  list: () => http.get<{ plans: PricingPlan[] }>(Endpoints.pricingPlans.list),
};
