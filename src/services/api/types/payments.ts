export type PaymentTokenDetails = {
  studentId: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  mobileNumber?: string | null;
  expectedNextDueDate: string;
  status: string;
  sessionBalance: number;
  isTrial?: boolean;
  isOneOnOne: boolean;
};

export type GeneratePaymentLinkPayload = { amount: number; credits: number };

export type CreateRefillSessionPayload = {
  planId: string;
  cvCoinsToRedeem?: number;
};

export type RefillSession = {
  payments_session_id: string;
  amount: number;
  credits: number;
  baseAmount: number;
  cvCoinsToRedeem: number;
};

export type ConfirmRefillResponse = {
  message: string;
  credits?: number;
  [key: string]: unknown;
};

export type PricingPlanClassMode = 'group' | 'one_on_one' | 'both';

export type PricingPlan = {
  id: string;
  name: string;
  description: string | null;
  sessions_included: number;
  original_price: number;
  effective_discounted_price: number | null;
  discount_expires_at: string | null;
  badge_label: string | null;
  class_mode: PricingPlanClassMode;
  display_order: number;
};
