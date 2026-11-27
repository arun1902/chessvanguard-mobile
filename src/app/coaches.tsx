import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ZohoCheckoutModal } from '@/components/payments/zoho-checkout-modal';
import { BookDemoModal } from '@/components/student/book-demo-modal';
import { OptionSheet, SelectField } from '@/components/student/option-sheet';
import { PrimaryButton, StudentCard, StudentPage } from '@/components/student/student-page';
import { useToast } from '@/components/ui/app-toast';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/features/auth/session';
import { api, ApiError, type AvailableCoach } from '@/services/api';
import {
  formatAmountForZoho,
  isZohoConfigured,
  type ZohoCheckoutOptions,
} from '@/utils/zoho-payments';

type PendingDemoPayment = {
  coachName: string;
  holdId: string;
  payments_session_id: string;
  amount: number;
  scheduledDate: string;
  time: string;
};

const EXPERIENCE_OPTIONS = [
  'Any Experience',
  '0-2 years',
  '3-6 years',
  '7+ years',
  'Not specified',
] as const;
const LANGUAGE_OPTIONS = ['Any Language', 'English', 'Hindi', 'Punjabi'] as const;

type SheetKey = 'coach' | 'experience' | 'language' | null;

function demoPriceLabel(coach: AvailableCoach) {
  const amount = coach.listingDemoPrice ?? coach.perDemoRate ?? 19;
  return `₹${amount} demo class`;
}

function matchesExperience(coach: AvailableCoach, filter: string) {
  if (filter === 'Any Experience') return true;
  const years = coach.experienceYears;
  if (years == null) return filter === 'Not specified';
  if (filter === '0-2 years') return years <= 2;
  if (filter === '3-6 years') return years >= 3 && years <= 6;
  if (filter === '7+ years') return years >= 7;
  return true;
}

function matchesLanguage(coach: AvailableCoach, filter: string) {
  if (filter === 'Any Language') return true;
  return (coach.languages || []).some((lang) => lang.toLowerCase() === filter.toLowerCase());
}

export default function CoachesScreen() {
  const { token, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [coachFilter, setCoachFilter] = useState<string>('All coaches');
  const [experience, setExperience] = useState<string>(EXPERIENCE_OPTIONS[0]);
  const [language, setLanguage] = useState<string>(LANGUAGE_OPTIONS[0]);
  const [search, setSearch] = useState('');
  const [demoDate, setDemoDate] = useState('');
  const [openSheet, setOpenSheet] = useState<SheetKey>(null);
  const [bookCoach, setBookCoach] = useState<AvailableCoach | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PendingDemoPayment | null>(null);
  const [checkoutOptions, setCheckoutOptions] = useState<ZohoCheckoutOptions | null>(null);
  const [confirming, setConfirming] = useState(false);

  const [coaches, setCoaches] = useState<AvailableCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCoaches = useCallback(async () => {
    if (!token) {
      setLoadError('Sign in required to browse coaches.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const dateParam = normalizeDateInput(demoDate);
      const result = await api.students.listAvailableCoaches({
        page: 1,
        limit: 50,
        ...(dateParam ? { date: dateParam } : {}),
      });
      setCoaches(result.data || []);
    } catch (error) {
      setCoaches([]);
      setLoadError(
        error instanceof ApiError ? error.message : 'Unable to load coaches. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [token, demoDate]);

  useEffect(() => {
    void loadCoaches();
  }, [loadCoaches]);

  const coachNames = useMemo(
    () => ['All coaches', ...coaches.map((coach) => coach.name)],
    [coaches],
  );

  const filteredCoaches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return coaches.filter((coach) => {
      if (coachFilter !== 'All coaches' && coach.name !== coachFilter) return false;
      if (!matchesExperience(coach, experience)) return false;
      if (!matchesLanguage(coach, language)) return false;
      if (!query) return true;
      const haystack = `${coach.name} ${coach.specialization || ''} ${coach.bio || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [coachFilter, coaches, experience, language, search]);

  const sheetConfig = useMemo(() => {
    if (openSheet === 'coach') {
      return {
        title: 'Select coach',
        options: coachNames,
        selected: coachFilter,
        searchable: true,
        searchPlaceholder: 'Search select a coach...',
        onSelect: setCoachFilter,
      };
    }
    if (openSheet === 'experience') {
      return {
        title: 'Experience',
        options: [...EXPERIENCE_OPTIONS],
        selected: experience,
        searchable: false,
        onSelect: setExperience,
      };
    }
    if (openSheet === 'language') {
      return {
        title: 'Language',
        options: [...LANGUAGE_OPTIONS],
        selected: language,
        searchable: false,
        onSelect: setLanguage,
      };
    }
    return null;
  }, [coachFilter, coachNames, experience, language, openSheet]);

  const openBookDemo = useCallback(
    (coach: AvailableCoach) => {
      if (!token) {
        Alert.alert('Sign in required', 'Please sign in again to book a demo.');
        return;
      }
      if (!user?.id) {
        Alert.alert(
          'Account incomplete',
          'Your student account is missing an id. Please sign out and sign in again.',
        );
        return;
      }
      if (user.role !== 'Student') {
        Alert.alert('Not available', 'Only student accounts can book demo sessions.');
        return;
      }
      setBookCoach(coach);
    },
    [token, user],
  );

  const confirmDemoBooking = useCallback(
    async (holdId: string, scheduledDate: string, time: string) => {
      if (!user?.id) return;
      setConfirming(true);
      try {
        await api.students.verifyAndConfirmBooking(user.id, holdId);
        setPendingPayment(null);
        setCheckoutOptions(null);
        showSuccess(`Demo booked for ${scheduledDate} at ${time}.`);
      } catch (error) {
        showError(
          error instanceof ApiError
            ? error.message
            : 'Payment received but confirmation failed. Retry from Classes or contact support.',
        );
      } finally {
        setConfirming(false);
      }
    },
    [showError, showSuccess, user?.id],
  );

  const startDemoCheckout = useCallback(
    (pending: PendingDemoPayment) => {
      if (!isZohoConfigured()) {
        showError('Zoho Payments is not configured. Set EXPO_PUBLIC_ZOHO_ACCOUNT_ID in .env.');
        return;
      }
      setPendingPayment(pending);
      setCheckoutOptions({
        payments_session_id: pending.payments_session_id,
        amount: formatAmountForZoho(pending.amount),
        currency_code: 'INR',
        currency_symbol: '₹',
        description: `Demo Booking with ${pending.coachName}`,
        business: 'ChessVanguard',
        invoice_number: `DEMO${Date.now()}`.slice(0, 50),
        address: {
          name: user?.name || 'Student',
          email: user?.email || undefined,
        },
      });
    },
    [showError, user?.email, user?.name],
  );

  const bookDemoOverlay =
    bookCoach && token && user?.id ? (
      <BookDemoModal
        visible
        coachId={bookCoach.id}
        coachName={bookCoach.name || 'Coach'}
        priceLabel={demoPriceLabel(bookCoach)}
        studentId={user.id}
        onClose={() => setBookCoach(null)}
        onBooked={({
          requiresPayment,
          amount,
          holdId,
          payments_session_id,
          scheduledDate,
          time,
        }) => {
          const coachName = bookCoach.name || 'Coach';
          setBookCoach(null);
          if (requiresPayment) {
            if (!holdId || !payments_session_id || amount == null) {
              showError('Payment session is unavailable. Please try again.');
              return;
            }
            startDemoCheckout({
              coachName,
              holdId,
              payments_session_id,
              amount,
              scheduledDate,
              time,
            });
            return;
          }
          showSuccess(`Demo booked for ${scheduledDate} at ${time}.`);
        }}
      />
    ) : null;

  const paymentOverlay = (
    <>
      <ZohoCheckoutModal
        visible={Boolean(checkoutOptions)}
        title="Pay for demo"
        options={checkoutOptions}
        onSuccess={() => {
          const pending = pendingPayment;
          setCheckoutOptions(null);
          if (!pending) return;
          void confirmDemoBooking(pending.holdId, pending.scheduledDate, pending.time);
        }}
        onCancel={() => {
          setCheckoutOptions(null);
          showError('Payment cancelled. Your slot hold may still be active briefly.');
        }}
        onError={(message) => {
          setCheckoutOptions(null);
          showError(message);
        }}
      />
      {confirming ? (
        <View style={styles.confirmingOverlay} pointerEvents="auto">
          <ActivityIndicator color={Brand.gold} size="large" />
          <Text style={styles.confirmingText}>Confirming your booking…</Text>
        </View>
      ) : null}
    </>
  );

  return (
    <StudentPage
      title="Coaches"
      subtitle="Browse coaches, compare fit, and book a demo in one place."
      overlay={
        <>
          {bookDemoOverlay}
          {paymentOverlay}
        </>
      }>
      <Text style={styles.heading}>Find Your Coach</Text>

      <StudentCard style={styles.filtersCard}>
        <Text style={styles.sectionTitle}>Smart Filters for Parents</Text>
        <View style={styles.filterGrid}>
          <SelectField
            label="Coach"
            value={coachFilter}
            accent
            onPress={() => setOpenSheet('coach')}
          />
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Search</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Name or specialization"
              placeholderTextColor={Brand.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Demo Date</Text>
            <TextInput
              value={demoDate}
              onChangeText={setDemoDate}
              placeholder="yyyy-mm-dd"
              placeholderTextColor={Brand.muted}
              style={styles.input}
              keyboardType="numbers-and-punctuation"
              onEndEditing={() => void loadCoaches()}
            />
          </View>
          <SelectField
            label="Experience"
            value={experience}
            onPress={() => setOpenSheet('experience')}
          />
          <SelectField
            label="Language"
            value={language}
            onPress={() => setOpenSheet('language')}
          />
        </View>
      </StudentCard>

      {loading ? (
        <StudentCard>
          <ActivityIndicator color={Brand.gold} />
        </StudentCard>
      ) : null}

      {loadError ? (
        <StudentCard>
          <Text style={styles.errorText}>{loadError}</Text>
          <PrimaryButton label="Retry" tone="navy" onPress={() => void loadCoaches()} />
        </StudentCard>
      ) : null}

      {!loading && !loadError && filteredCoaches.length === 0 ? (
        <StudentCard>
          <Text style={styles.emptyText}>No coaches match your filters right now.</Text>
        </StudentCard>
      ) : null}

      {filteredCoaches.map((coach) => {
        const initial = (coach.name?.trim()?.[0] || 'C').toUpperCase();
        return (
          <StudentCard key={coach.id} style={styles.coachCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.coachName}>{coach.name || 'Coach'}</Text>
            <View style={styles.tags}>
              {(coach.languages || []).slice(0, 3).map((item) => (
                <View key={item} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
              {typeof coach.experienceYears === 'number' ? (
                <View style={[styles.tag, styles.expTag]}>
                  <Text style={styles.tagText}>{coach.experienceYears}+ yrs exp.</Text>
                </View>
              ) : null}
            </View>
            {coach.bio ? <Text style={styles.bio}>{coach.bio}</Text> : null}
            <View style={styles.ctaRow}>
              <View>
                <Text style={styles.priceAmount}>
                  ₹{coach.listingDemoPrice ?? coach.perDemoRate ?? 19}
                </Text>
                <Text style={styles.priceHint}>demo class</Text>
              </View>
              <View style={styles.bookWrap}>
                <PrimaryButton
                  label="Book Demo"
                  tone="navy"
                  onPress={() => openBookDemo(coach)}
                />
              </View>
            </View>
          </StudentCard>
        );
      })}

      {sheetConfig ? (
        <OptionSheet
          visible
          title={sheetConfig.title}
          options={sheetConfig.options}
          selected={sheetConfig.selected}
          searchable={sheetConfig.searchable}
          searchPlaceholder={sheetConfig.searchPlaceholder}
          onSelect={sheetConfig.onSelect}
          onClose={() => setOpenSheet(null)}
        />
      ) : null}
    </StudentPage>
  );
}

function normalizeDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (us) {
    const month = us[1].padStart(2, '0');
    const day = us[2].padStart(2, '0');
    return `${us[3]}-${month}-${day}`;
  }
  return undefined;
}

const styles = StyleSheet.create({
  heading: {
    color: Brand.navy,
    fontSize: 24,
    fontWeight: '800',
  },
  filtersCard: {
    gap: 12,
  },
  sectionTitle: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '700',
  },
  filterGrid: {
    gap: 10,
  },
  filterField: {
    gap: 6,
  },
  filterLabel: {
    color: Brand.label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    color: Brand.navy,
    fontSize: 14,
  },
  coachCard: {
    gap: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.gold,
    fontSize: 24,
    fontWeight: '800',
  },
  coachName: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  expTag: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  tagText: {
    color: Brand.label,
    fontSize: 11,
    fontWeight: '600',
  },
  bio: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
    marginTop: 4,
  },
  priceAmount: {
    color: Brand.navy,
    fontSize: 22,
    fontWeight: '800',
  },
  priceHint: {
    color: Brand.subtitle,
    fontSize: 12,
  },
  bookWrap: {
    flex: 1,
    maxWidth: 180,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptyText: {
    color: Brand.subtitle,
    fontSize: 14,
  },
  confirmingOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: 'rgba(11, 31, 58, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  confirmingText: {
    color: Brand.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
