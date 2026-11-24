import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RateSessionModal } from '@/components/coach/rate-session-modal';
import { CoachCard, CoachPage } from '@/components/coach/coach-page';
import { Brand } from '@/constants/brand';
import { DEMO_COACH_CLASS, DEMO_COACH_USER } from '@/constants/coach';

const STATS = [
  { label: 'MY STUDENTS', value: '0', hint: 'Students currently in your batches' },
  { label: 'UPCOMING DEMOS', value: '0', hint: 'Assigned to you' },
  { label: 'OVERDUE SESSIONS', value: '0', hint: 'In negative balance' },
];

export default function CoachDashboardScreen() {
  const [rateOpen, setRateOpen] = useState(false);

  return (
    <CoachPage
      title="Dashboard"
      subtitle={`Welcome, ${DEMO_COACH_USER.username}. Overview of your assigned students and upcoming sessions.`}
      showBack={false}>
      <View style={styles.stats}>
        {STATS.map((stat) => (
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

        <View style={styles.classCard}>
          <Text style={styles.studentName}>{DEMO_COACH_CLASS.studentName}</Text>
          <Text style={styles.coachLabel}>{DEMO_COACH_CLASS.coachLabel}</Text>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Demo Session</Text>
            </View>
            <View style={[styles.tag, styles.tagWarn]}>
              <Text style={styles.tagText}>{DEMO_COACH_CLASS.status}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.meta}>
              <Text style={styles.metaLabel}>DATE</Text>
              <Text style={styles.metaValue}>{DEMO_COACH_CLASS.dateLabel}</Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.metaLabel}>TIME</Text>
              <Text style={styles.metaValue}>{DEMO_COACH_CLASS.timeLabel}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setRateOpen(true)}
            style={styles.rateButton}
            accessibilityRole="button">
            <Text style={styles.rateText}>Rate Session</Text>
          </Pressable>
        </View>
      </CoachCard>

      <CoachCard style={styles.section}>
        <Text style={styles.sectionTitle}>Training Batches</Text>
        <Text style={styles.placeholder}>
          Full batch scheduling and calendar synchronization for regular classes is currently under
          development.
        </Text>
      </CoachCard>

      <CoachCard style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Log</Text>
        <Text style={styles.placeholder}>
          A unified feed of interaction remarks and system alerts will be integrated here in the next
          version.
        </Text>
      </CoachCard>

      <Pressable onPress={() => router.push('/coach/classes')} accessibilityRole="button">
        <Text style={styles.link}>View all classes →</Text>
      </Pressable>

      <RateSessionModal visible={rateOpen} onClose={() => setRateOpen(false)} />
    </CoachPage>
  );
}

const styles = StyleSheet.create({
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
  classCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    padding: 14,
    gap: 8,
  },
  studentName: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  coachLabel: {
    color: Brand.subtitle,
    fontSize: 13,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagWarn: {
    backgroundColor: '#DBEAFE',
  },
  tagText: {
    color: Brand.navy,
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    color: Brand.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  metaValue: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  rateButton: {
    marginTop: 4,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
  },
  rateText: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
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
});
