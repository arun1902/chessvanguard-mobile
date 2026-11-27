export type SendEmailOtpPayload = {
  name: string;
  email: string;
  /** Exactly 10 digits. */
  mobileNumber: string;
  leadId?: string;
};

export type VerifyEmailOtpPayload = {
  email: string;
  /** 6 characters. */
  code: string;
};

export type WhatsAppOtpPayload = {
  /** 10-digit Indian mobile number starting with 6-9. */
  mobileNumber: string;
};

export type VerifyWhatsAppOtpPayload = WhatsAppOtpPayload & {
  code: string;
};

export type DemoSlotsQuery = { day?: string; date?: string };

export type DemoHoldPayload = {
  slotId: string;
  /** ISO datetime with offset. */
  startsAt: string;
  campaign?: string;
  name: string;
  phone: string;
  email?: string;
  ageBand?: string;
  utm?: Record<string, string>;
  fbc?: string;
  fbp?: string;
  consent?: { accepted: boolean; policyVersion?: string; textVersion?: string };
  captchaToken: string;
  honeypot?: string;
};

export type DemoPaymentSessionPayload = { leadId: string; captchaToken: string };
export type DemoPaymentVerifyPayload = { leadId: string; paymentSessionId: string };
export type DemoReschedulePayload = { slotId: string; startsAt: string };
export type DemoCancelPayload = { reason?: string };

export type InquiryPayload = {
  email: string;
  notes?: string;
  recaptchaToken: string;
  demoSlotId?: string;
  demoDate?: string;
};

export type ContactPayload = {
  name?: string;
  mobileNumber?: string;
  email?: string;
  parentName?: string;
  parentEmail?: string;
  source?: string;
  notes?: string;
  demoDate?: string;
  demoSlotId?: string;
  city?: string;
  age?: number;
  subject?: string;
  message?: string;
  question?: string;
  from?: string;
};

/** Either `email` or `mobileNumber` is required. */
export type NewsletterPayload = { email?: string; mobileNumber?: string };
