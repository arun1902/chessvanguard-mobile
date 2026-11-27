import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import { api, ApiError, type CoachTimingSlot } from '@/services/api';

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
  coachId: string;
  coachName: string;
  priceLabel: string;
  studentId: string;
  onClose: () => void;
  onBooked: (result: {
    requiresPayment: boolean;
    amount?: number;
    holdId?: string;
    payments_session_id?: string;
    holdExpiresAt?: string;
    scheduledDate: string;
    time: string;
  }) => void;
};

export function BookDemoModal({
  visible,
  coachId,
  coachName,
  priceLabel,
  studentId,
  onClose,
  onBooked,
}: BookDemoModalProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [slots, setSlots] = useState<CoachTimingSlot[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => buildCalendarDays(cursor), [cursor]);
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? null;
  const canBook = Boolean(selected && selectedSlotId && !submitting);

  useEffect(() => {
    if (!visible || !coachId) return;

    let cancelled = false;
    (async () => {
      setLoadingDays(true);
      setError(null);
      try {
        const response = await api.coaches.getTimings(coachId, { date: formatDate(today), type: 'Demo' });
        if (!cancelled) setAvailableDays((response.availableDays || []).map((d) => d.toLowerCase()));
      } catch (err) {
        if (!cancelled) {
          setAvailableDays([]);
          setError(err instanceof ApiError ? err.message : 'Failed to load available days.');
        }
      } finally {
        if (!cancelled) setLoadingDays(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, coachId, today]);

  useEffect(() => {
    if (!visible || !coachId || !selected) return;

    const dayName = WEEKDAY_NAMES[selected.getDay()];
    if (availableDays.length > 0 && !availableDays.includes(dayName)) {
      setSlots([]);
      setSelectedSlotId(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      setError(null);
      setSelectedSlotId(null);
      try {
        const response = await api.coaches.getTimings(coachId, { date: formatDate(selected), type: 'Demo' });
        if (!cancelled) setSlots(response.slots || []);
      } catch (err) {
        if (!cancelled) {
          setSlots([]);
          setError(err instanceof ApiError ? err.message : 'Failed to load time slots.');
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, coachId, selected, availableDays]);

  const handleBook = async () => {
    if (!selected || !selectedSlotId || !selectedSlot || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const scheduledDate = formatDate(selected);
      const result = await api.students.bookClass(studentId, {
        coachId,
        timingId: selectedSlotId,
        scheduledDate,
        classType: 'Demo',
      });

      const requiresPayment = Boolean(
        result && typeof result === 'object' && 'requiresPayment' in result && result.requiresPayment,
      );

      if (requiresPayment) {
        const paid = result as Extract<typeof result, { requiresPayment: true }>;
        if (!paid.payments_session_id || !paid.holdId) {
          setError('Payment session is unavailable. Please try again.');
          return;
        }
        const amount = Number(paid.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          setError('Payment amount is unavailable. Please try again.');
          return;
        }
        onBooked({
          requiresPayment: true,
          amount,
          holdId: paid.holdId,
          payments_session_id: paid.payments_session_id,
          holdExpiresAt: paid.holdExpiresAt,
          scheduledDate,
          time: formatDisplayTime(selectedSlot.time),
        });
        onClose();
        return;
      }

      onBooked({
        requiresPayment: false,
        scheduledDate,
        time: formatDisplayTime(selectedSlot.time),
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to book demo. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.handle} />
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
              accessibilityLabel="Close"
              hitSlop={8}>
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                size={16}
                tintColor={Brand.navy}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled">
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

                {loadingDays ? (
                  <ActivityIndicator color={Brand.gold} style={styles.loader} />
                ) : (
                  <View style={styles.grid}>
                    {chunkWeeks(days).map((week, weekIndex) => (
                      <View key={`week-${weekIndex}`} style={styles.weekGridRow}>
                        {week.map((day, dayIndex) => {
                          if (!day) {
                            return (
                              <View
                                key={`empty-${weekIndex}-${dayIndex}`}
                                style={styles.dayCellEmpty}
                              />
                            );
                          }
                          const isSelected = sameDay(day, selected);
                          const isToday = sameDay(day, today);
                          const enabled =
                            availableDays.length === 0
                              ? day >= today
                              : availableDays.includes(WEEKDAY_NAMES[day.getDay()]) &&
                                day >= today;
                          return (
                            <Pressable
                              key={formatDate(day)}
                              disabled={!enabled}
                              onPress={() => {
                                setSelected(day);
                                setSelectedSlotId(null);
                              }}
                              style={styles.dayCell}
                              accessibilityRole="button"
                              accessibilityState={{ selected: isSelected, disabled: !enabled }}>
                              <View
                                style={[
                                  styles.dayInner,
                                  isSelected ? styles.daySelected : null,
                                  isToday && !isSelected ? styles.dayToday : null,
                                  !enabled ? styles.dayDisabled : null,
                                ]}>
                                <Text
                                  style={[
                                    styles.dayText,
                                    isSelected ? styles.dayTextSelected : null,
                                    isToday && !isSelected ? styles.dayTextToday : null,
                                    !enabled ? styles.dayTextDisabled : null,
                                  ]}>
                                  {day.getDate()}
                                </Text>
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                )}

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
              {loadingSlots ? (
                <ActivityIndicator color={Brand.gold} />
              ) : slots.length === 0 ? (
                <View style={styles.noSlots}>
                  <Text style={styles.noSlotsText}>No slots for this date</Text>
                </View>
              ) : (
                <View style={styles.slots}>
                  {slots.map((slot) => {
                    const active = slot.id === selectedSlotId;
                    return (
                      <Pressable
                        key={slot.id}
                        onPress={() => setSelectedSlotId(slot.id)}
                        style={[styles.slot, active ? styles.slotActive : null]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}>
                        <Text style={[styles.slotText, active ? styles.slotTextActive : null]}>
                          {formatDisplayTime(slot.time)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
                void handleBook();
              }}
              disabled={!canBook}
              style={[styles.bookButton, !canBook ? styles.bookDisabled : null]}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canBook }}
              accessibilityLabel="Book Demo">
              {submitting ? (
                <ActivityIndicator color={Brand.white} />
              ) : (
                <Text style={styles.bookText}>Book Demo</Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const WEEKDAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

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

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayTime(time: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return time;
  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}

function buildCalendarDays(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function chunkWeeks(cells: (Date | null)[]) {
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: Brand.border,
    marginTop: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  bodyScroll: {
    flexGrow: 0,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 14,
  },
  section: {
    gap: 8,
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
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 6,
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
    marginBottom: 2,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: Brand.muted,
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: 2,
  },
  grid: {
    gap: 2,
  },
  weekGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayCell: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellEmpty: {
    flex: 1,
    height: 36,
  },
  dayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: Brand.gold,
  },
  dayToday: {
    backgroundColor: '#FFF3C4',
  },
  dayDisabled: {
    opacity: 0.35,
  },
  dayText: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: Brand.white,
    fontWeight: '800',
  },
  dayTextToday: {
    color: Brand.navy,
  },
  dayTextDisabled: {
    color: Brand.muted,
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendToday: {
    backgroundColor: '#FFF3C4',
  },
  legendSelected: {
    backgroundColor: Brand.gold,
  },
  legendText: {
    color: Brand.subtitle,
    fontSize: 11,
  },
  noSlots: {
    borderRadius: 999,
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 10,
    paddingHorizontal: 14,
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
    paddingVertical: 9,
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
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
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
    minHeight: 44,
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
