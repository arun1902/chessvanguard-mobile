/** Referrals, CV coins, ratings, onboarding actions, verification and platform lookups. */

export type CreateReferralPayload = {
  name: string;
  email: string;
  /** Exactly 10 digits. */
  whatsappNumber: string;
};

export type Referral = {
  id: string;
  status: string;
  referredName: string;
  referredEmail: string;
  referredWhatsapp: string;
  leadId: string;
  rewardedAt?: string | null;
  createdAt: string;
};

export type CreateReferralResponse = Referral & {
  emailSent: boolean;
  whatsappSent: boolean;
  whatsappError?: string;
  whatsappMessageId?: string;
};

export type WouldRecommend = 'Yes' | 'Maybe' | 'No';

export type SubmitRatingPayload = {
  studentId: string;
  coachId: string;
  /** 1–5 */
  teachingStyle: number;
  patience: number;
  communication: number;
  punctuality: number;
  wouldRecommend: WouldRecommend;
  comment?: string;
};

export type CoachRatingsResponse = {
  ratings: Record<string, unknown>[];
  avgRating: number | null;
};

export type NextActionResponse = {
  action: Record<string, unknown> | null;
  message?: string;
  [key: string]: unknown;
};

export type CompleteActionPayload = { actionId: string; name?: string };

export type VerificationChannel = 'EMAIL' | 'WHATSAPP';

export type SendVerificationPayload = {
  type: VerificationChannel;
  /** Email address or E.164 phone number. */
  target: string;
  purpose?: string;
};

export type ConfirmVerificationPayload = {
  type: VerificationChannel;
  target: string;
  otp: string;
};

export type UpdateMobileContextPayload = {
  /** 10–15 digits. */
  mobileNumber: string;
  whatsappOptIn?: boolean;
};

export type RemarkEntityType = 'Student' | 'Coach' | 'Lead';
