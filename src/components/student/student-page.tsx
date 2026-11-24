import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StudentNotificationsSheet } from '@/components/student/notifications-sheet';
import { Brand } from '@/constants/brand';
import { DEMO_STUDENT } from '@/constants/dashboard';

type StudentPageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  showBack?: boolean;
};

export function StudentPage({
  title,
  subtitle,
  children,
  contentStyle,
  showBack = true,
}: StudentPageProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.titleBlock}>
            {showBack ? (
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard'))}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={8}>
                <SymbolView
                  name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                  size={18}
                  tintColor={Brand.navy}
                />
              </Pressable>
            ) : null}
            <View style={styles.titleCopy}>
              <Text style={styles.brand}>ChessVanguard</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <View style={styles.coinsChip}>
              <Text style={styles.coinsText}>{DEMO_STUDENT.coins} Coins</Text>
            </View>
            <Pressable
              onPress={() => setNotificationsOpen(true)}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              hitSlop={8}>
              <SymbolView
                name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
                size={16}
                tintColor={Brand.navySoft}
              />
              {DEMO_STUDENT.notificationCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{DEMO_STUDENT.notificationCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
      </SafeAreaView>

      <StudentNotificationsSheet
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </View>
  );
}

export function StudentCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  tone = 'gold',
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  tone?: 'gold' | 'navy';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        tone === 'navy' ? styles.primaryNavy : null,
        disabled ? styles.primaryDisabled : null,
        pressed && !disabled ? styles.primaryPressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ iconLabel, message }: { iconLabel: string; message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{iconLabel}</Text>
      <Text style={styles.emptyText}>{message}</Text>
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
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
    backgroundColor: Brand.white,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.inputBackground,
  },
  titleCopy: {
    flex: 1,
  },
  brand: {
    color: Brand.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: Brand.navy,
    fontSize: 20,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsChip: {
    backgroundColor: '#FFF8E7',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  coinsText: {
    color: Brand.navy,
    fontSize: 11,
    fontWeight: '700',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: Brand.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Brand.white,
    fontSize: 9,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  subtitle: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
  },
  card: {
    backgroundColor: Brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 16,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryNavy: {
    backgroundColor: Brand.navy,
  },
  primaryPressed: {
    opacity: 0.9,
  },
  primaryDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: '700',
  },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Brand.border,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
    backgroundColor: Brand.inputBackground,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyText: {
    color: Brand.subtitle,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
