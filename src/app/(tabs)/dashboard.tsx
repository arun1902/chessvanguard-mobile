import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { FindCoachSection } from '@/components/dashboard/find-coach-section';
import { ParentsChest } from '@/components/dashboard/parents-chest';
import { StreakSection } from '@/components/dashboard/streak-section';
import { TacticianHq } from '@/components/dashboard/tactician-hq';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { Brand } from '@/constants/brand';
import { STATION_ROUTES } from '@/constants/student-nav';
import { BottomTabInset } from '@/constants/theme';

function comingSoon(feature: string) {
  Alert.alert('Coming soon', `${feature} will connect to ChessVanguard next.`);
}

export default function StudentDashboardScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces>
          <DashboardHeader onShopPress={() => router.push('/refill')} />

          <WelcomeBanner onStartLearning={() => router.push('/coaches')} />

          <TacticianHq
            onStationPress={(id) => {
              const href = STATION_ROUTES[id];
              if (href) {
                router.push(href);
                return;
              }
              comingSoon(id);
            }}
          />

          <StreakSection onOpenPuzzles={() => router.push('/puzzles')} />

          <FindCoachSection onBookDemo={() => router.push('/coaches')} />

          <ParentsChest />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.page,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: (BottomTabInset ?? 0) + 28,
    gap: 18,
  },
});
