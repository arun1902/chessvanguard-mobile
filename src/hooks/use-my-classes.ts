import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/features/auth/session';
import { api, type ClassItem, type ClassStatus, type ListClassesQuery } from '@/services/api';
import { monthDateRange } from '@/utils/format';

export type ClassTab = 'Upcoming' | 'Past' | 'Cancelled';
export type ClassTypeFilter = 'All classes' | 'Demo classes' | 'Regular classes';
export type DateFilter = 'All time' | 'Current month' | 'Last month' | 'Custom range';

function tabForStatus(status: ClassStatus): ClassTab {
  if (status === 'upcoming') return 'Upcoming';
  if (status === 'cancelled' || status === 'not_conducted') return 'Cancelled';
  return 'Past';
}

function typeQuery(filter: ClassTypeFilter): ListClassesQuery['type'] | undefined {
  if (filter === 'Demo classes') return 'Demo';
  if (filter === 'Regular classes') return 'Regular';
  return undefined;
}

function dateQuery(filter: DateFilter): Pick<ListClassesQuery, 'dateFrom' | 'dateTo'> {
  if (filter === 'Current month') return monthDateRange('current');
  if (filter === 'Last month') return monthDateRange('last');
  return {};
}

export function useMyClasses(classType: ClassTypeFilter, dateRange: DateFilter) {
  const { isAuthenticated } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setClasses([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const query: ListClassesQuery = {
        type: typeQuery(classType),
        ...dateQuery(dateRange),
      };
      const result = await api.classes.list(query);
      setClasses(result.classes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [classType, dateRange, isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const buckets = useMemo(() => {
    const next: Record<ClassTab, ClassItem[]> = {
      Upcoming: [],
      Past: [],
      Cancelled: [],
    };
    for (const item of classes) {
      next[tabForStatus(item.status)].push(item);
    }
    return next;
  }, [classes]);

  const stats = useMemo(() => {
    const demo = classes.filter((item) => item.type === 'Demo').length;
    const regular = classes.filter((item) => item.type === 'Regular').length;
    const startedOnTime = classes.filter((item) => item.isStarted && !item.startedAt).length;
    const startedLate = classes.filter((item) => Boolean(item.isStarted && item.startedAt)).length;
    const neverStarted = classes.filter(
      (item) => item.status !== 'cancelled' && item.status !== 'not_conducted' && !item.isStarted
    ).length;
    const studentsJoined = classes.filter((item) => Boolean(item.studentJoinedAt)).length;

    return [
      { label: 'Total classes', value: String(classes.length) },
      { label: 'Demo', value: String(demo) },
      { label: 'Regular', value: String(regular) },
      { label: 'Started on time', value: String(startedOnTime) },
      { label: 'Started late', value: String(startedLate) },
      { label: 'Never started', value: String(neverStarted) },
      { label: 'Students joined', value: String(studentsJoined) },
    ];
  }, [classes]);

  return { classes, buckets, stats, loading, error, refresh };
}
