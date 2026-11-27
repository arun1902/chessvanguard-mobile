import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/session';
import { api } from '@/services/api';

function readCoins(payload: Record<string, unknown>): number {
  const candidates = [payload.balance, payload.coins, payload.cvCoins, payload.total];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export function useCvCoins() {
  const { isAuthenticated, user } = useAuth();
  const [coins, setCoins] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'Student') {
      setCoins(0);
      return;
    }
    try {
      const result = await api.referrals.getMyCoins();
      setCoins(readCoins(result as Record<string, unknown>));
    } catch {
      // Keep last known value.
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { coins, refresh };
}
