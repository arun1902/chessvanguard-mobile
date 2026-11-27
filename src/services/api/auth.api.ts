import type {
  LoginCredentials,
  LoginResponse,
  RegisterCoachCredentials,
  RegisterStudentCredentials,
} from '@/features/auth/types';
import { publicHttp } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type { ApiRecord, MessageResponse } from '@/services/api/types';

export async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  return publicHttp.post<LoginResponse>(Endpoints.auth.login, {
    email: credentials.email.trim(),
    password: credentials.password,
  });
}

/** POST /public/register-student — returns same { token, user } shape as login. */
export async function registerStudentApi(
  credentials: RegisterStudentCredentials,
): Promise<LoginResponse> {
  return publicHttp.post<LoginResponse>(Endpoints.public.registerStudent, {
    email: credentials.email.trim(),
    password: credentials.password,
    ...(credentials.name?.trim() ? { name: credentials.name.trim() } : {}),
    ...(credentials.whatsappNumber?.trim()
      ? { whatsappNumber: credentials.whatsappNumber.trim() }
      : {}),
    ...(credentials.referralToken?.trim()
      ? { referralToken: credentials.referralToken.trim() }
      : {}),
  });
}

/** POST /public/register-coach — returns same { token, user } shape as login. */
export async function registerCoachApi(
  credentials: RegisterCoachCredentials,
): Promise<LoginResponse> {
  return publicHttp.post<LoginResponse>(Endpoints.public.registerCoach, {
    email: credentials.email.trim(),
    password: credentials.password,
  });
}

export const authApi = {
  login: loginApi,
  registerStudent: registerStudentApi,
  registerCoach: registerCoachApi,

  forgotPassword: (email: string) =>
    publicHttp.post<MessageResponse>(Endpoints.auth.forgotPassword, { email: email.trim() }),

  /** Validates an invitation / password-setup link token. */
  verifySetupToken: (token: string) => publicHttp.get<ApiRecord>(Endpoints.auth.verifySetupToken(token)),

  /** Password must be at least 8 characters. */
  setupPassword: (token: string, password: string) =>
    publicHttp.post<MessageResponse>(Endpoints.auth.setupPassword, { token, password }),
};
