import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CoachCard, CoachPage } from '@/components/coach/coach-page';
import { OptionSheet, SelectField } from '@/components/student/option-sheet';
import { Brand } from '@/constants/brand';
import { DEMO_COACH_CLASS } from '@/constants/coach';

const CLASS_TYPES = ['All classes', 'Demo classes', 'Regular classes'] as const;
const DATE_OPTIONS = ['All time', 'Current month', 'Last month', 'Custom range'] as const;
const TABS = ['Upcoming', 'Past', 'Cancelled'] as const;

const STATS = [
  { label: 'Total classes', value: '1' },
  { label: 'Demo', value: '1' },
  { label: 'Regular', value: '0' },
  { label: 'Started on time', value: '0' },
  { label: 'Started late', value: '0' },
  { label: 'Never started', value: '1' },
  { label: 'Students joined', value: '0' },
];

type SheetKey = 'type' | 'date' | null;

export default function CoachClassesScreen() {
  const [classType, setClassType] = useState<string>(CLASS_TYPES[0]);
  const [dateRange, setDateRange] = useState<string>(DATE_OPTIONS[0]);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Upcoming');
  const [openSheet, setOpenSheet] = useState<SheetKey>(null);

  const counts = { Upcoming: 1, Past: 0, Cancelled: 0 } as const;

  const sheet = useMemo(() => {
    if (openSheet === 'type') {
      return {
        title: 'Filter by Class Type',
        options: [...CLASS_TYPES],
        selected: classType,
        onSelect: setClassType,
      };
    }
    if (openSheet === 'date') {
      return {
        title: 'Filter by Date',
        options: [...DATE_OPTIONS],
        selected: dateRange,
        onSelect: setDateRange,
      };
    }
    return null;
  }, [classType, dateRange, openSheet]);

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
          {STATS.map((stat) => (
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
                {item} ({counts[item]})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'Upcoming' ? (
        <CoachCard style={styles.classCard}>
          <Text style={styles.date}>{DEMO_COACH_CLASS.dateLabel}</Text>
          <Text style={styles.time}>{DEMO_COACH_CLASS.timeLabel}</Text>
          <View style={styles.batchRow}>
            <Text style={styles.batch}>{DEMO_COACH_CLASS.batchLabel}</Text>
            <View style={styles.demoTag}>
              <Text style={styles.demoText}>Demo</Text>
            </View>
          </View>
          <Text style={styles.student}>{DEMO_COACH_CLASS.studentName}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{DEMO_COACH_CLASS.status}</Text>
          </View>
          <Pressable style={styles.actionButton} accessibilityRole="button">
            <Text style={styles.actionText}>Mark as Not Conducted</Text>
          </Pressable>
        </CoachCard>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No classes found for this section.</Text>
        </View>
      )}

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
    paddingVertical: 8,
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
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
  },
  tabActive: {
    borderColor: Brand.gold,
    backgroundColor: '#FFF8E7',
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
  classCard: {
    gap: 8,
  },
  date: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  time: {
    color: Brand.subtitle,
    fontSize: 14,
  },
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batch: {
    color: Brand.navy,
    fontWeight: '600',
  },
  demoTag: {
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  demoText: {
    color: Brand.navy,
    fontSize: 11,
    fontWeight: '700',
  },
  student: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '700',
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: Brand.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  actionButton: {
    marginTop: 4,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: Brand.navy,
    fontWeight: '700',
  },
  empty: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Brand.border,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: Brand.subtitle,
  },
});
