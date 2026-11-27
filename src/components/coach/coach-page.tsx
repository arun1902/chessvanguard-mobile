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

import { CoachNotificationsSheet } from '@/components/coach/notifications-sheet';
import { CoachProfileMenu } from '@/components/coach/profile-menu';
import { Brand } from '@/constants/brand';
import { BottomTabInset } from '@/constants/theme';
import { useAuth } from '@/features/auth/session';
import { useUnreadCount } from '@/hooks/use-unread-count';
import { initialsFromName } from '@/utils/format';

type CoachPageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  showBack?: boolean;
  /** When true, leave room for the coach NativeTabs bar. */
  tabBar?: boolean;
};

export function CoachPage({
  title,
  subtitle,
  children,
  contentStyle,
  showBack = true,
  tabBar = false,
}: CoachPageProps) {
  const { user } = useAuth();
  const { count: notificationCount } = useUnreadCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const displayName = user?.name?.trim() || '';
  const emailLocal = user?.email?.trim().split('@')[0] || '';
  const initials = initialsFromName(displayName || emailLocal, 'C');

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView
        style={styles.safeArea}
        edges={tabBar ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.titleBlock}>
            {showBack ? (
              <Pressable
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace('/coach/dashboard')
                }
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
              <Text style={styles.brand} numberOfLines={1}>
                ChessVanguard
              </Text>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => setNotificationsOpen(true)}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              hitSlop={8}>
              <SymbolView
                name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
                size={17}
                tintColor={Brand.navySoft}
              />
              {notificationCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>

            {showBack ? (
              <Pressable
                onPress={() => router.replace('/coach/dashboard')}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Home"
                hitSlop={8}>
                <SymbolView
                  name={{ ios: 'house.fill', android: 'home', web: 'home' }}
                  size={17}
                  tintColor={Brand.navySoft}
                />
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => setMenuOpen(true)}
              style={styles.avatar}
              accessibilityRole="button"
              accessibilityLabel="Profile menu"
              hitSlop={8}>
              <Text style={styles.avatarText}>{initials}</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            tabBar ? { paddingBottom: BottomTabInset + 28 } : null,
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
      </SafeAreaView>

      <CoachProfileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <CoachNotificationsSheet
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </View>
  );
}

export { EmptyState, PrimaryButton, StudentCard as CoachCard } from '@/components/student/student-page';

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
    minWidth: 0,
  },
  backButton: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 0,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.gold,
    fontSize: 14,
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
});
