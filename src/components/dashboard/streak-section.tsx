import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { DEMO_STUDENT, DashboardColors } from '@/constants/dashboard';

type StreakSectionProps = {
  onOpenPuzzles?: () => void;
};

function formatDays(n: number) {
  return `${n} day${n === 1 ? '' : 's'}`;
}

export function StreakSection({ onOpenPuzzles }: StreakSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={[styles.iconCircle, styles.orangeCircle]}>
          <SymbolView
            name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }}
            size={18}
            tintColor={DashboardColors.streakOrange}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>Current Streak</Text>
          <Text style={styles.value}>
            {formatDays(DEMO_STUDENT.currentStreak)}{' '}
            <Text style={styles.accent}>— Solve today to start!</Text>
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconCircle, styles.yellowCircle]}>
          <SymbolView
            name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
            size={18}
            tintColor={DashboardColors.streakYellow}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>Longest Streak</Text>
          <Text style={styles.value}>{formatDays(DEMO_STUDENT.longestStreak)}</Text>
          <Text style={styles.meta}>Personal best</Text>
        </View>
      </View>

      <View style={[styles.card, styles.ctaCard]}>
        <Text style={styles.label}>Keep going</Text>
        <Text style={styles.ctaTitle}>Solve a puzzle to continue</Text>
        <Pressable
          onPress={onOpenPuzzles}
          style={({ pressed }) => [styles.ctaButton, pressed ? styles.ctaPressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Open Puzzle Dashboard">
          <Text style={styles.ctaButtonText}>Open Puzzle Dashboard</Text>
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
            size={14}
            tintColor={Brand.white}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  card: {
    backgroundColor: Brand.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaCard: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderColor: '#FDE68A',
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orangeCircle: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  yellowCircle: {
    backgroundColor: '#FEFCE8',
    borderColor: '#FDE68A',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: Brand.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  accent: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '600',
  },
  meta: {
    color: Brand.subtitle,
    fontSize: 11,
  },
  ctaTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  ctaButton: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaButtonText: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
