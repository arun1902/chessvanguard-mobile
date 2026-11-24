import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, StudentCard, StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';

const TABS = ['Online Tournaments', 'Offline Tournaments'] as const;

export default function TournamentsScreen() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Online Tournaments');
  const isOnline = activeTab === 'Online Tournaments';

  return (
    <StudentPage
      title="Tournament"
      subtitle="Join weekly online battles or register for offline championships.">
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Tournament Hub</Text>
        <Pressable style={styles.historyButton} accessibilityRole="button">
          <Text style={styles.historyText}>My History</Text>
        </Pressable>
      </View>

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
              <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>

      <StudentCard style={[styles.hubCard, !isOnline ? styles.offlineCard : null]}>
        {isOnline ? (
          <>
            <Text style={styles.helpText}>
              Play our weekly Saturday online battles. Connect Lichess once to join.
            </Text>

            <View style={styles.lichessBox}>
              <Text style={styles.lichessTitle}>
                Connect your Lichess account to join online tournaments.
              </Text>
              <Text style={styles.lichessBody}>
                Don&apos;t have a Lichess account? Click the button below — you can create one for free
                directly on the Lichess page.
              </Text>
              <PrimaryButton label="Connect Lichess Account" onPress={() => undefined} />
            </View>

            <View style={styles.statusBox}>
              <Text style={styles.statusText}>
                No upcoming Saturday tournament available right now. Please check again shortly.
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.helpText}>
              Browse and register for upcoming physical championships and age-group events.
            </Text>
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>
                No open championships right now. Check back soon for upcoming events.
              </Text>
            </View>
          </>
        )}
      </StudentCard>
    </StudentPage>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  heading: {
    color: Brand.navy,
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
  },
  historyButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.gold,
    backgroundColor: Brand.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  historyText: {
    color: Brand.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: 8,
  },
  tabActive: {
    borderColor: Brand.gold,
    backgroundColor: '#FFF8E7',
  },
  tabText: {
    color: Brand.subtitle,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: Brand.navy,
    fontWeight: '800',
  },
  hubCard: {
    gap: 14,
  },
  offlineCard: {
    borderColor: Brand.gold,
  },
  helpText: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
  },
  lichessBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    padding: 14,
    gap: 10,
  },
  lichessTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  lichessBody: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 19,
  },
  statusBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
    backgroundColor: Brand.white,
  },
  statusText: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 19,
  },
});
