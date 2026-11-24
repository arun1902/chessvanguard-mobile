import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { CoachCard, CoachPage, PrimaryButton } from '@/components/coach/coach-page';
import { Brand } from '@/constants/brand';

export default function CoachTournamentScreen() {
  return (
    <CoachPage
      title="Tournament"
      subtitle="Tournament publishing is enabled only for the configured tournament coach.">
      <CoachCard style={styles.card}>
        <Text style={styles.message}>
          This account is not assigned as the active tournament manager.
        </Text>
        <PrimaryButton
          label="Back to Profile"
          tone="navy"
          onPress={() => router.push('/coach/profile')}
        />
      </CoachCard>
    </CoachPage>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    alignItems: 'stretch',
  },
  message: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
