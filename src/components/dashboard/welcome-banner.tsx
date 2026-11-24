import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { DashboardColors } from '@/constants/dashboard';

type WelcomeBannerProps = {
  onStartLearning?: () => void;
};

export function WelcomeBanner({ onStartLearning }: WelcomeBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.copy}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>Let's get you started with your first chess lesson.</Text>
      </View>
      <Pressable
        onPress={onStartLearning}
        style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Start Learning">
        <Text style={styles.buttonText}>Start Learning</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: DashboardColors.welcomeBorder,
    backgroundColor: DashboardColors.welcomeBg,
    padding: 16,
    gap: 14,
  },
  copy: {
    gap: 4,
  },
  title: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    alignSelf: 'stretch',
    height: 44,
    borderRadius: 12,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
