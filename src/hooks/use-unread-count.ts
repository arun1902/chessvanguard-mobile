import { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/features/auth/session';
import { api } from '@/services/api';

/** Polls unread notification count for the signed-in user. */
export function useUnreadCount(pollMs = 15_000) {
  const { isAuthenticated, user } = useAuth();
  const [count, setCount] = useState(0);
  const interval = user?.role === 'Coach' ? Math.min(pollMs, 15_000) : pollMs;

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    try {
      const result = await api.notifications.getUnreadCount();
      setCount(Number(result.count) || 0);
    } catch {
      // Keep last known count on transient failures.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!active) return;
      await refresh();
    })();

    if (!isAuthenticated || interval <= 0) {
      return () => {
        active = false;
      };
    }

    const timer = setInterval(() => {
      void refresh();
    }, interval);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') void refresh();
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      active = false;
      clearInterval(timer);
      sub.remove();
    };
  }, [interval, isAuthenticated, refresh]);

  return { count, refresh };
}
