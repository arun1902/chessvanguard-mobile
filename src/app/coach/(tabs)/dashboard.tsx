import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ClassSessionCard } from '@/components/classes/class-session-card';
import { CoachUpcomingActions } from '@/components/classes/coach-upcoming-actions';
import { CoachCard, CoachPage } from '@/components/coach/coach-page';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/features/auth/session';
import { useMyClasses } from '@/hooks/use-my-classes';
import { useNotifications } from '@/hooks/use-notifications';

export default function CoachDashboardScreen() {
  const { user } = useAuth();
  const displayName = user?.name?.trim() || 'Coach';
  const { buckets, loading, error, refresh } = useMyClasses('All classes', 'All time');
  const { items: notifications } = useNotifications(10);
  const upcoming = buckets.Upcoming.slice(0, 3);
  const demoUpcoming = buckets.Upcoming.filter((item) => item.type === 'Demo').length;
  const bookingAlerts = notifications
    .filter((item) => {
      const text = `${item.title} ${item.body}`.toLowerCase();
      return (
        item.unread &&
        (item.type === 'demo_booking' ||
          item.type === 'coach_demo_booked' ||
          text.includes('demo booked') ||
          text.includes('booked a demo'))
      );
    })
    .slice(0, 3);

  const stats = [
    {
      label: 'MY STUDENTS',
      value: '—',
      hint: 'Open Students to manage your roster',
    },
    {
      label: 'UPCOMING DEMOS',
      value: String(demoUpcoming),
      hint: 'Assigned to you',
    },
    {
      label: 'UPCOMING CLASSES',
      value: String(buckets.Upcoming.length),
      hint: 'Live and scheduled sessions',
    },
  ];

  return (
    <CoachPage
      title="Dashboard"
      subtitle={`Welcome, ${displayName}. Overview of your assigned students and upcoming sessions.`}
      showBack={false}
      tabBar>
      {bookingAlerts.length > 0 ? (
        <CoachCard style={styles.alertCard}>
          <Text style={styles.sectionTitle}>New bookings</Text>
          <Text style={styles.sectionHint}>Students just booked sessions with you.</Text>
          {bookingAlerts.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push('/coach/notifications')}
              style={styles.alertRow}
              accessibilityRole="button">
              <Text style={styles.alertTitle}>{item.title}</Text>
              <Text style={styles.alertBody} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={styles.alertTime}>{item.timeAgo}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => router.push('/coach/notifications')} accessibilityRole="button">
            <Text style={styles.link}>Open notifications →</Text>
          </Pressable>
        </CoachCard>
      ) : null}

      <View style={styles.stats}>
        {stats.map((stat) => (
          <CoachCard key={stat.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statHint}>{stat.hint}</Text>
          </CoachCard>
        ))}
      </View>

      <CoachCard style={styles.section}>
        <Text style={styles.sectionTitle}>My Classes</Text>
        <Text style={styles.sectionHint}>Your live and upcoming coaching sessions.</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Brand.gold} />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void refresh()} accessibilityRole="button">
              <Text style={styles.link}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && upcoming.length === 0 ? (
          <Text style={styles.placeholder}>No upcoming classes right now.</Text>
        ) : null}

        {!loading && !error
          ? upcoming.map((item) => (
              <ClassSessionCard
                key={`${item.id}-${item.scheduledDate}`}
                item={item}
                perspective="coach"
                footer={<CoachUpcomingActions item={item} onChanged={refresh} />}
              />
            ))
          : null}
      </CoachCard>

      <CoachCard style={styles.section}>
        <Text style={styles.sectionTitle}>Training Batches</Text>
        <Text style={styles.placeholder}>
          Full batch scheduling and calendar synchronization for regular classes is currently under
          development.
        </Text>
      </CoachCard>

      <Pressable onPress={() => router.push('/coach/classes')} accessibilityRole="button">
        <Text style={styles.link}>View all classes →</Text>
      </Pressable>
    </CoachPage>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    gap: 10,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  alertRow: {
    gap: 4,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#FDE68A',
  },
  alertTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  alertBody: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
  alertTime: {
    color: Brand.muted,
    fontSize: 12,
  },
  stats: {
    gap: 10,
  },
  statCard: {
    gap: 4,
  },
  statLabel: {
    color: Brand.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statValue: {
    color: Brand.navy,
    fontSize: 28,
    fontWeight: '800',
  },
  statHint: {
    color: Brand.subtitle,
    fontSize: 12,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionHint: {
    color: Brand.subtitle,
    fontSize: 13,
    marginBottom: 4,
  },
  placeholder: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 19,
  },
  link: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  errorText: {
    color: Brand.error,
    fontSize: 13,
    textAlign: 'center',
  },
});
