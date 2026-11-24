import { StyleSheet, Text } from 'react-native';

import { EmptyState, StudentCard, StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';

export default function HallOfFameScreen() {
  return (
    <StudentPage
      title="Hall of Fame"
      subtitle="View and download your verified certificates from past ChessVanguard tournaments.">
      <Text style={styles.heading}>Certificate Vault</Text>

      <StudentCard style={styles.vaultCard}>
        <Text style={styles.sectionTitle}>MY CERTIFICATES</Text>
        <EmptyState
          iconLabel="🏅"
          message="No certificates found for this account. Participate in an upcoming physical tournament to earn your first badge of honor!"
        />
      </StudentCard>
    </StudentPage>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: Brand.navy,
    fontSize: 24,
    fontWeight: '800',
  },
  vaultCard: {
    gap: 14,
  },
  sectionTitle: {
    color: Brand.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
});
