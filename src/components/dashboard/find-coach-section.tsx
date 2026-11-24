import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { DEMO_COACH } from '@/constants/dashboard';

type FindCoachSectionProps = {
  onBookDemo?: () => void;
};

export function FindCoachSection({ onBookDemo }: FindCoachSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Coach</Text>
        <Text style={styles.subtitle}>Browse coaches, compare fit, and book a demo in one place.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{DEMO_COACH.initial}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.tags}>
            {DEMO_COACH.languages.map((language) => (
              <View key={language} style={styles.tag}>
                <Text style={styles.tagText}>{language}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.bio} numberOfLines={2}>
            {DEMO_COACH.bio}
          </Text>
          <Text style={styles.price}>{DEMO_COACH.priceLabel}</Text>
        </View>

        <Pressable
          onPress={onBookDemo}
          style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Book Demo">
          <Text style={styles.buttonText}>Book Demo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  header: {
    gap: 4,
  },
  title: {
    color: Brand.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Brand.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    gap: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Brand.inputBackground,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: Brand.label,
    fontSize: 11,
    fontWeight: '600',
  },
  bio: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
  price: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  button: {
    height: 42,
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
