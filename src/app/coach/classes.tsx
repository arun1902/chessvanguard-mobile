import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ClassSessionCard } from '@/components/classes/class-session-card';
import { CoachUpcomingActions } from '@/components/classes/coach-upcoming-actions';
import { CompleteClassModal } from '@/components/classes/complete-class-modal';
import { MarkNotConductedModal } from '@/components/classes/mark-not-conducted-modal';
import { CoachCard, CoachPage } from '@/components/coach/coach-page';
import { OptionSheet, SelectField } from '@/components/student/option-sheet';
import { useToast } from '@/components/ui/app-toast';
import { Brand } from '@/constants/brand';
import type { StudentFacingStatus } from '@/constants/coach-cancellation';
import { useAuth } from '@/features/auth/session';
import {
  useMyClasses,
  type ClassTab,
  type ClassTypeFilter,
  type DateFilter,
} from '@/hooks/use-my-classes';
import { api, ApiError, type ClassItem } from '@/services/api';

const CLASS_TYPES: ClassTypeFilter[] = ['All classes', 'Demo classes', 'Regular classes'];
const DATE_OPTIONS: DateFilter[] = ['All time', 'Current month', 'Last month'];
const TABS: ClassTab[] = ['Upcoming', 'Past', 'Cancelled'];

type SheetKey = 'type' | 'date' | null;

function canCompleteClass(item: ClassItem): boolean {
  return item.status === 'unresolved' && (item.finalStatus === 'InProgress' || Boolean(item.isStarted));
}

function isCompleteTooEarly(item: ClassItem): boolean {
  if (!item.completionAllowedAt) return false;
  const allowedAt = new Date(item.completionAllowedAt).getTime();
  return Number.isFinite(allowedAt) && Date.now() < allowedAt;
}

export default function CoachClassesScreen() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [classType, setClassType] = useState<ClassTypeFilter>(CLASS_TYPES[0]);
  const [dateRange, setDateRange] = useState<DateFilter>(DATE_OPTIONS[0]);
  const [tab, setTab] = useState<ClassTab>('Upcoming');
  const [openSheet, setOpenSheet] = useState<SheetKey>(null);

  const [notConductedItem, setNotConductedItem] = useState<ClassItem | null>(null);
  const [notConductedSubmitting, setNotConductedSubmitting] = useState(false);
  const [notConductedError, setNotConductedError] = useState<string | null>(null);

  const [completeItem, setCompleteItem] = useState<ClassItem | null>(null);
  const [completeSubmitting, setCompleteSubmitting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [puzzleErrors, setPuzzleErrors] = useState<
    { studentName: string; unsolvedCount: number }[]
  >([]);

  const { buckets, stats, loading, error, refresh } = useMyClasses(classType, dateRange);
  const visible = buckets[tab];

  const sheet = useMemo(() => {
    if (openSheet === 'type') {
      return {
        title: 'Filter by Class Type',
        options: [...CLASS_TYPES],
        selected: classType,
        onSelect: (value: string) => setClassType(value as ClassTypeFilter),
      };
    }
    if (openSheet === 'date') {
      return {
        title: 'Filter by Date',
        options: [...DATE_OPTIONS],
        selected: dateRange,
        onSelect: (value: string) => setDateRange(value as DateFilter),
      };
    }
    return null;
  }, [classType, dateRange, openSheet]);

  const submitNotConducted = async (payload: {
    internalReason: string;
    studentFacingStatus: StudentFacingStatus;
  }) => {
    if (!user?.id || !notConductedItem || notConductedSubmitting) return;
    setNotConductedSubmitting(true);
    setNotConductedError(null);
    try {
      await api.coaches.markNotConducted(user.id, {
        ...(notConductedItem.classSessionId
          ? { classSessionId: notConductedItem.classSessionId }
          : {}),
        timingId: notConductedItem.timingId,
        scheduledDate: notConductedItem.scheduledDate,
        internalReason: payload.internalReason,
        studentFacingStatus: payload.studentFacingStatus,
      });
      showSuccess('Class marked as not conducted.');
      setNotConductedItem(null);
      await refresh();
    } catch (err) {
      setNotConductedError(
        err instanceof ApiError ? err.message : 'Failed to mark class as not conducted.',
      );
    } finally {
      setNotConductedSubmitting(false);
    }
  };

  const submitComplete = async (payload: { topic: string; notes: string }) => {
    if (!user?.id || !completeItem || completeSubmitting) return;
    setCompleteSubmitting(true);
    setCompleteError(null);
    setPuzzleErrors([]);
    try {
      await api.coaches.completeClass(user.id, {
        ...(completeItem.classSessionId ? { classSessionId: completeItem.classSessionId } : {}),
        timingId: completeItem.timingId,
        scheduledDate: completeItem.scheduledDate,
        topic: payload.topic,
        notes: payload.notes,
      });
      showSuccess('Class completed.');
      setCompleteItem(null);
      await refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.details as
          | { code?: string; message?: string; students?: { studentName: string; unsolvedCount: number }[] }
          | null
          | undefined;
        if (details?.code === 'insufficient_unsolved_puzzles') {
          setCompleteError(details.message || err.message);
          setPuzzleErrors(details.students || []);
        } else {
          setCompleteError(err.message);
        }
      } else {
        setCompleteError('Failed to complete class.');
      }
    } finally {
      setCompleteSubmitting(false);
    }
  };

  const openComplete = (item: ClassItem) => {
    if (isCompleteTooEarly(item) && item.completionAllowedAt) {
      const when = new Date(item.completionAllowedAt).toLocaleString();
      showError(`Complete Class is available after ${when}`);
      return;
    }
    setCompleteError(null);
    setPuzzleErrors([]);
    setCompleteItem(item);
  };

  const renderFooter = (item: ClassItem) => {
    if (tab === 'Upcoming') {
      return <CoachUpcomingActions item={item} onChanged={refresh} />;
    }

    if (tab === 'Past' && item.status === 'unresolved') {
      const showComplete = canCompleteClass(item);
      return (
        <View style={styles.closeoutActions}>
          {showComplete ? (
            <Pressable
              onPress={() => openComplete(item)}
              style={({ pressed }) => [
                styles.completeAction,
                pressed ? styles.pressed : null,
                isCompleteTooEarly(item) ? styles.disabled : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Complete Class">
              <Text style={styles.completeActionText}>Complete Class</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => {
              setNotConductedError(null);
              setNotConductedItem(item);
            }}
            style={({ pressed }) => [styles.notConductedAction, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Mark as Not Conducted">
            <Text style={styles.notConductedActionText}>Mark as Not Conducted</Text>
          </Pressable>
        </View>
      );
    }

    return undefined;
  };

  return (
    <CoachPage
      title="Classes"
      subtitle="View upcoming, past, and cancelled classes with quick actions.">
      <View style={styles.filters}>
        <SelectField
          label="Filter by Class Type"
          value={classType}
          onPress={() => setOpenSheet('type')}
        />
        <SelectField
          label="Filter by Date"
          value={dateRange}
          onPress={() => setOpenSheet('date')}
        />
      </View>

      <CoachCard>
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </CoachCard>

      <View style={styles.tabs}>
        {TABS.map((item) => {
          const active = item === tab;
          return (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              style={[styles.tab, active ? styles.tabActive : null]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}>
              <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>
                {item} ({buckets[item].length})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Brand.gold} />
          <Text style={styles.centerText}>Loading classes…</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => void refresh()} style={styles.retry} accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error && visible.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No classes found for this section.</Text>
        </View>
      ) : null}

      {!loading && !error
        ? visible.map((item) => (
            <ClassSessionCard
              key={`${item.id}-${item.scheduledDate}`}
              item={item}
              perspective="coach"
              footer={renderFooter(item)}
            />
          ))
        : null}

      {sheet ? (
        <OptionSheet
          visible
          title={sheet.title}
          options={sheet.options}
          selected={sheet.selected}
          onSelect={sheet.onSelect}
          onClose={() => setOpenSheet(null)}
        />
      ) : null}

      <MarkNotConductedModal
        visible={Boolean(notConductedItem)}
        item={notConductedItem}
        submitting={notConductedSubmitting}
        error={notConductedError}
        onClose={() => {
          if (notConductedSubmitting) return;
          setNotConductedItem(null);
          setNotConductedError(null);
        }}
        onSubmit={(payload) => void submitNotConducted(payload)}
      />

      <CompleteClassModal
        visible={Boolean(completeItem)}
        item={completeItem}
        submitting={completeSubmitting}
        error={completeError}
        puzzleErrors={puzzleErrors}
        onClose={() => {
          if (completeSubmitting) return;
          setCompleteItem(null);
          setCompleteError(null);
          setPuzzleErrors([]);
        }}
        onSubmit={(payload) => void submitComplete(payload)}
      />
    </CoachPage>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 2,
  },
  statValue: {
    color: Brand.navy,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: Brand.subtitle,
    fontSize: 12,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  tabActive: {
    backgroundColor: '#FFF8E7',
    borderColor: Brand.gold,
  },
  tabText: {
    color: Brand.subtitle,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Brand.navy,
    fontWeight: '800',
  },
  center: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  centerText: {
    color: Brand.subtitle,
    fontSize: 13,
  },
  errorText: {
    color: Brand.error,
    fontSize: 13,
    textAlign: 'center',
  },
  retry: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Brand.border,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: Brand.inputBackground,
  },
  emptyText: {
    color: Brand.subtitle,
    fontSize: 14,
    textAlign: 'center',
  },
  closeoutActions: {
    gap: 8,
  },
  completeAction: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  completeActionText: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: '800',
  },
  notConductedAction: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
    paddingHorizontal: 12,
  },
  notConductedActionText: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
