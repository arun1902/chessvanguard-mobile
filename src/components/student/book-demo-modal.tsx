import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Su'] as const;
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

type BookDemoModalProps = {
  visible: boolean;
  coachName: string;
  priceLabel: string;
  onClose: () => void;
  onBook?: (date: Date, time?: string) => void;
};

export function BookDemoModal({
  visible,
  coachName,
  priceLabel,
  onClose,
  onBook,
}: BookDemoModalProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const days = useMemo(() => buildCalendarDays(cursor), [cursor]);
  const slots = useMemo(() => getSlotsForDate(selected), [selected]);
  const canBook = Boolean(selected && selectedTime);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Book Demo Session</Text>
                <Text style={styles.subtitle}>
                  Schedule a demo session with {coachName} • {priceLabel.replace(' demo class', '')}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close">
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  size={16}
                  tintColor={Brand.navy}
                />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Date</Text>
                <View style={styles.calendar}>
                  <View style={styles.monthRow}>
                    <Text style={styles.monthLabel}>
                      {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
                    </Text>
                    <View style={styles.monthNav}>
                      <Pressable
                        onPress={() => setCursor(addMonths(cursor, -1))}
                        style={styles.navButton}
                        accessibilityRole="button"
                        accessibilityLabel="Previous month">
                        <SymbolView
                          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                          size={16}
                          tintColor={Brand.navy}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => setCursor(addMonths(cursor, 1))}
                        style={styles.navButton}
                        accessibilityRole="button"
                        accessibilityLabel="Next month">
                        <SymbolView
                          name={{
                            ios: 'chevron.right',
                            android: 'chevron_right',
                            web: 'chevron_right',
                          }}
                          size={16}
                          tintColor={Brand.navy}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.weekRow}>
                    {WEEKDAYS.map((day) => (
                      <Text key={day} style={styles.weekday}>
                        {day}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.grid}>
                    {days.map((day, index) => {
                      if (!day) {
                        return <View key={`empty-${index}`} style={styles.dayCell} />;
                      }
                      const isSelected = sameDay(day, selected);
                      const isToday = sameDay(day, today);
                      return (
                        <Pressable
                          key={day.toISOString()}
                          onPress={() => {
                            setSelected(day);
                            setSelectedTime(null);
                          }}
                          style={[
                            styles.dayCell,
                            isSelected ? styles.daySelected : null,
                            isToday && !isSelected ? styles.dayToday : null,
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}>
                          <Text
                            style={[
                              styles.dayText,
                              isSelected ? styles.dayTextSelected : null,
                              isToday && !isSelected ? styles.dayTextToday : null,
                            ]}>
                            {day.getDate()}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.legend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendSwatch, styles.legendToday]} />
                      <Text style={styles.legendText}>Today</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendSwatch, styles.legendSelected]} />
                      <Text style={styles.legendText}>Selected</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Time</Text>
                {slots.length === 0 ? (
                  <View style={styles.noSlots}>
                    <Text style={styles.noSlotsText}>No slots for this date</Text>
                  </View>
                ) : (
                  <View style={styles.slots}>
                    {slots.map((slot) => {
                      const active = slot === selectedTime;
                      return (
                        <Pressable
                          key={slot}
                          onPress={() => setSelectedTime(slot)}
                          style={[styles.slot, active ? styles.slotActive : null]}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}>
                          <Text style={[styles.slotText, active ? styles.slotTextActive : null]}>
                            {slot}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                onPress={onClose}
                style={styles.cancelButton}
                accessibilityRole="button"
                accessibilityLabel="Cancel">
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!canBook || !selectedTime) return;
                  onBook?.(selected, selectedTime);
                  onClose();
                }}
                disabled={!canBook}
                style={[styles.bookButton, !canBook ? styles.bookDisabled : null]}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canBook }}
                accessibilityLabel="Book Demo">
                <Text style={styles.bookText}>Book Demo</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildCalendarDays(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset
  const startOffset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Demo stub: weekdays have sample slots; weekends none. */
function getSlotsForDate(date: Date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return [] as string[];
  return ['4:00 PM', '5:00 PM', '6:30 PM'];
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  safe: {
    maxHeight: '94%',
  },
  card: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
    flexDirection: 'row',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.inputBackground,
  },
  body: {
    padding: 16,
    gap: 18,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  calendar: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 12,
    gap: 10,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    gap: 4,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: Brand.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  daySelected: {
    backgroundColor: Brand.gold,
  },
  dayToday: {
    backgroundColor: '#FFF3C4',
  },
  dayText: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: Brand.white,
    fontWeight: '800',
  },
  dayTextToday: {
    color: Brand.navy,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendToday: {
    backgroundColor: '#FFF3C4',
  },
  legendSelected: {
    backgroundColor: Brand.gold,
  },
  legendText: {
    color: Brand.subtitle,
    fontSize: 12,
  },
  noSlots: {
    borderRadius: 999,
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  noSlotsText: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '600',
  },
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slot: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  slotActive: {
    borderColor: Brand.gold,
    backgroundColor: '#FFF8E7',
  },
  slotText: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '600',
  },
  slotTextActive: {
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
  },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Brand.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  bookButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: Brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookDisabled: {
    backgroundColor: '#94A3B8',
  },
  bookText: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
