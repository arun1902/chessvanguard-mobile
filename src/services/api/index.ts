import { authApi } from '@/services/api/auth.api';
import { classesApi, leadDemosApi, meetingsApi } from '@/services/api/classes.api';
import { coachesApi, coachHiringApi } from '@/services/api/coaches.api';
import {
  actionsApi,
  blogsApi,
  coachInsightsApi,
  platformApi,
  ratingsApi,
  referralsApi,
  userVerificationApi,
} from '@/services/api/engagement.api';
import { notificationsApi } from '@/services/api/notifications.api';
import { paymentsApi, pricingPlansApi } from '@/services/api/payments.api';
import { publicApi } from '@/services/api/public.api';
import { assignmentsApi, puzzlesApi, themesApi } from '@/services/api/puzzles.api';
import { studentsApi } from '@/services/api/students.api';
import { registrationTournamentsApi, tournamentsApi } from '@/services/api/tournaments.api';

/**
 * Single entry point for the ChessVanguard V2 backend.
 *
 * @example
 * import { api } from '@/services/api';
 * const { classes } = await api.classes.list({ status: 'upcoming' });
 */
export const api = {
  auth: authApi,
  public: publicApi,
  payments: paymentsApi,
  pricingPlans: pricingPlansApi,
  platform: platformApi,
  coaches: coachesApi,
  coachHiring: coachHiringApi,
  coachInsights: coachInsightsApi,
  userVerification: userVerificationApi,
  students: studentsApi,
  referrals: referralsApi,
  classes: classesApi,
  meetings: meetingsApi,
  leadDemos: leadDemosApi,
  tournaments: tournamentsApi,
  registrationTournaments: registrationTournamentsApi,
  ratings: ratingsApi,
  blogs: blogsApi,
  actions: actionsApi,
  puzzles: puzzlesApi,
  themes: themesApi,
  assignments: assignmentsApi,
  notifications: notificationsApi,
} as const;

export { ApiError } from '@/features/auth/types';
export { getApiBaseUrl } from '@/services/api/client';
export type * from '@/services/api/types';
