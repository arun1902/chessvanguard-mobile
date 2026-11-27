import type { AuthUser } from '@/features/auth/types';

function displayName(user: Pick<AuthUser, 'name' | 'email'> | null | undefined) {
  const raw = user?.name?.trim();
  if (raw && raw.toLowerCase() !== 'null' && raw.toLowerCase() !== 'undefined') {
    return raw;
  }
  const fromEmail = user?.email?.split('@')[0]?.trim();
  return fromEmail || 'there';
}

/** Existing account sign-in. */
export function welcomeBackMessage(user: Pick<AuthUser, 'name' | 'email'>) {
  return `Welcome back, ${displayName(user)}!`;
}

/** First-time student account creation. */
export function studentAccountCreatedMessage(user: Pick<AuthUser, 'name' | 'email'>) {
  return `Welcome to ChessVanguard, ${displayName(user)}! Your student account is ready.`;
}

/** First-time coach account creation. */
export function coachAccountCreatedMessage(user: Pick<AuthUser, 'name' | 'email'>) {
  return `Welcome to ChessVanguard, ${displayName(user)}! Your coach account is ready.`;
}

/** Normalize API "already exists" errors for register flows. */
export function alreadyRegisteredMessage(raw: string, role: 'student' | 'coach') {
  const lower = raw.toLowerCase();
  if (
    lower.includes('already') ||
    lower.includes('exists') ||
    lower.includes('registered') ||
    lower.includes('in use')
  ) {
    if (lower.includes('mobile') || lower.includes('phone') || lower.includes('whatsapp')) {
      return 'This mobile number is already registered. Please sign in or use a different number.';
    }
    return `This email is already registered${
      role === 'coach' ? ' as a coach account' : ''
    }. Please sign in instead.`;
  }
  return raw;
}
