import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionSheet, SelectField } from '@/components/student/option-sheet';
import { EmptyState, StudentCard, StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';

const CLASS_TYPE_OPTIONS = ['All classes', 'Demo classes', 'Regular classes'] as const;
const DATE_OPTIONS = ['All time', 'Current month', 'Last month', 'Custom range'] as const;

const STATS = [
  { label: 'Total classes', value: '0' },
  { label: 'Demo', value: '0' },
  { label: 'Regular', value: '0' },
  { label: 'Started on time', value: '0' },
  { label: 'Started late', value: '0' },
  { label: 'Never started', value: '0' },
  { label: 'Students joined', value: '0' },
];

const TABS = ['Upcoming', 'Past', 'Cancelled'] as const;

type SheetKey = 'type' | 'date' | null;

export default function ClassesScreen() {
  const [classType, setClassType] = useState<string>(CLASS_TYPE_OPTIONS[0]);
  const [dateRange, setDateRange] = useState<string>(DATE_OPTIONS[0]);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Upcoming');
  const [openSheet, setOpenSheet] = useState<SheetKey>(null);

  const sheetConfig = useMemo(() => {
    if (openSheet === 'type') {
      return {
        title: 'Filter by Class Type',
        options: [...CLASS_TYPE_OPTIONS],
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
    <StudentPage
      title="Classes"
      subtitle="View upcoming, past, and cancelled classes with quick actions.">
      <View style={styles.filters}>
        <SelectField label="Filter by Class Type" value={classType} onPress={() => setOpenSheet('type')} />
        <SelectField label="Filter by Date" value={dateRange} onPress={() => setOpenSheet('date')} />
      </View>

      <StudentCard style={styles.statsCard}>
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
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
                {tab} (0)
              </Text>
            </Pressable>
          );
        })}
      </View>

      <EmptyState iconLabel="👥" message="No classes found for this section." />

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
});
