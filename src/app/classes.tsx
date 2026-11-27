import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ClassSessionCard } from '@/components/classes/class-session-card';
import { JoinClassButton } from '@/components/classes/join-class-button';
import { OptionSheet, SelectField } from '@/components/student/option-sheet';
import { EmptyState, StudentCard, StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';
import {
  useMyClasses,
  type ClassTab,
  type ClassTypeFilter,
  type DateFilter,
} from '@/hooks/use-my-classes';

const CLASS_TYPE_OPTIONS: ClassTypeFilter[] = ['All classes', 'Demo classes', 'Regular classes'];
const DATE_OPTIONS: DateFilter[] = ['All time', 'Current month', 'Last month'];
const TABS: ClassTab[] = ['Upcoming', 'Past', 'Cancelled'];

type SheetKey = 'type' | 'date' | null;

export default function ClassesScreen() {
  const [classType, setClassType] = useState<ClassTypeFilter>(CLASS_TYPE_OPTIONS[0]);
  const [dateRange, setDateRange] = useState<DateFilter>(DATE_OPTIONS[0]);
  const [activeTab, setActiveTab] = useState<ClassTab>('Upcoming');
  const [openSheet, setOpenSheet] = useState<SheetKey>(null);

  const { buckets, stats, loading, error, refresh } = useMyClasses(classType, dateRange);
  const visible = buckets[activeTab];

  const sheetConfig = useMemo(() => {
    if (openSheet === 'type') {
      return {
        title: 'Filter by Class Type',
        options: [...CLASS_TYPE_OPTIONS],
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

  return (
    <StudentPage
      title="Classes"
      subtitle="View upcoming, past, and cancelled classes with quick actions.">
      <View style={styles.filters}>
        <SelectField label="Filter by Class Type" value={classType} onPress={() => setOpenSheet('type')} />
        <SelectField label="Filter by Date" value={dateRange} onPress={() => setOpenSheet('date')} />
      </View>

      <StudentCard style={styles.statsCard}>
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </StudentCard>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, active ? styles.tabActive : null]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}>
              <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>
                {tab} ({buckets[tab].length})
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
        <EmptyState iconLabel="📅" message="No classes found for this section." />
      ) : null}

      {!loading && !error
        ? visible.map((item) => (
            <ClassSessionCard
              key={`${item.id}-${item.scheduledDate}`}
              item={item}
              perspective="student"
              footer={activeTab === 'Upcoming' ? <JoinClassButton item={item} /> : undefined}
            />
          ))
        : null}

      {sheetConfig ? (
        <OptionSheet
          visible
          title={sheetConfig.title}
          options={sheetConfig.options}
          selected={sheetConfig.selected}
          onSelect={sheetConfig.onSelect}
          onClose={() => setOpenSheet(null)}
        />
      ) : null}
    </StudentPage>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: 10,
  },
  statsCard: {
    paddingVertical: 12,
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
});
