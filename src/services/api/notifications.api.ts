import { http } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type {
  ListNotificationsQuery,
  NotificationPreference,
  NotificationsPage,
  SuccessResponse,
} from '@/services/api/types';

const E = Endpoints.notifications;

export const notificationsApi = {
  list: (query: ListNotificationsQuery = {}) => http.get<NotificationsPage>(E.list, { query }),
  getUnreadCount: () => http.get<{ count: number }>(E.unreadCount),
  markRead: (notificationId: string) => http.patch<SuccessResponse>(E.markRead(notificationId)),
  markAllRead: () => http.patch<SuccessResponse>(E.markAllRead),
  remove: (notificationId: string) => http.delete<SuccessResponse>(E.remove(notificationId)),

  getPreferences: () => http.get<{ preferences: NotificationPreference[] }>(E.preferences),
  updatePreferences: (preferences: Omit<NotificationPreference, 'id'>[]) =>
    http.put<SuccessResponse>(E.preferences, { preferences }),
  resetPreferences: () => http.post<SuccessResponse>(E.resetPreferences),
};
