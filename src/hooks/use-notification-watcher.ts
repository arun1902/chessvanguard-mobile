import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useToast } from '@/components/ui/app-toast';
import { useAuth } from '@/features/auth/session';
import { api, type AppNotification } from '@/services/api';

const BOOKING_TYPES = new Set([
  'demo_booking',
  'coach_demo_booked',
  'demo_booking_confirmed',
  'demo_rescheduled',
]);

/**
 * Polls coach notifications and toasts when a new student booking arrives
 * while the app is open.
 */
export function useNotificationWatcher(enabled = true, pollMs = 15_000) {
  const { isAuthenticated, user } = useAuth();
  const { showSuccess } = useToast();
  const seenIds = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    if (!enabled || !isAuthenticated || user?.role !== 'Coach') return;

    let active = true;

    const check = async () => {
      try {
        const page = await api.notifications.list({ page: 1, limit: 20 });
        if (!active) return;
        const items = page.notifications ?? [];

        if (!primed.current) {
          for (const item of items) seenIds.current.add(item.id);
          primed.current = true;
          return;
        }

        const fresh = items.filter((item) => !seenIds.current.has(item.id));
        for (const item of fresh) {
          seenIds.current.add(item.id);
          if (item.status === 'unread' && isBookingNotification(item)) {
            showSuccess(item.title || 'New demo booking received');
          }
        }
      } catch {
        // Ignore transient poll failures.
      }
    };

    void check();
    const timer = setInterval(() => {
      void check();
    }, pollMs);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') void check();
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      active = false;
      clearInterval(timer);
      sub.remove();
    };
  }, [enabled, isAuthenticated, pollMs, showSuccess, user?.role]);
}

function isBookingNotification(item: AppNotification) {
  if (BOOKING_TYPES.has(item.type)) return true;
  const haystack = `${item.title} ${item.body}`.toLowerCase();
  return haystack.includes('demo booked') || haystack.includes('booked a demo');
}
