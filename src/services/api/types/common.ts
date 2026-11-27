export type { UserRole } from '@/features/auth/types';

/** Untyped JSON object for endpoints whose backend response is a raw service/entity payload. */
export type ApiRecord = Record<string, unknown>;

export type MessageResponse = { message: string };
export type SuccessResponse = { success: boolean; message?: string };

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type TimingType = 'Regular' | 'Demo' | 'Tournament';
export type ClassType = 'Demo' | 'Regular';

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
