import { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/features/auth/session';
import { api, type AppNotification } from '@/services/api';
import { formatTimeAgo } from '@/utils/format';

export type NotificationListItem = {
  id: string;
  title: string;
  body: string;
  timeAgo: string;
  unread: boolean;
  type?: string;
};

function toListItem(item: AppNotification): NotificationListItem {
  return {
    id: item.id,
    title: item.title || 'Notification',
    body: item.body || '',
    timeAgo: formatTimeAgo(item.created_at),
    unread: item.status === 'unread',
    type: item.type,
  };
}

export function useNotifications(limit = 20, enabled = true) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<NotificationListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !enabled) {
      setItems([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const page = await api.notifications.list({ page: 1, limit });
      setItems((page.notifications ?? []).map(toListItem));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated, limit]);

  const markRead = useCallback(async (notificationId: string) => {
    setItems((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, unread: false } : item))
    );
    try {
      await api.notifications.markRead(notificationId);
    } catch {
      // Keep optimistic UI; next refresh will resync.
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
    try {
      await api.notifications.markAllRead();
    } catch {
      // Keep optimistic UI; next refresh will resync.
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') void refresh();
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [enabled, isAuthenticated, refresh]);

  return { items, loading, error, refresh, markRead, markAllRead };
}
