export type UserRole = 'Admin' | 'SalesAgent' | 'Student' | 'Coach';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterStudentCredentials = {
  email: string;
  password: string;
  name?: string;
  whatsappNumber?: string;
  referralToken?: string;
};

export type RegisterCoachCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
