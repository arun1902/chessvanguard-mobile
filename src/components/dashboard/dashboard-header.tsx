import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StudentNotificationsSheet } from '@/components/student/notifications-sheet';
import { StudentProfileMenu } from '@/components/student/profile-menu';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/features/auth/session';
import { useCvCoins } from '@/hooks/use-cv-coins';
import { useUnreadCount } from '@/hooks/use-unread-count';
import { initialsFromName } from '@/utils/format';

type DashboardHeaderProps = {
  onShopPress?: () => void;
};

export function DashboardHeader({ onShopPress }: DashboardHeaderProps) {
  const { user } = useAuth();
  const { coins } = useCvCoins();
  const { count: notificationCount } = useUnreadCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const displayName = user?.name?.trim() || 'Student';
  const initials = initialsFromName(displayName, 'S');

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.brand} numberOfLines={1}>
            ChessVanguard
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            Dashboard
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onShopPress}
            style={styles.coinsChip}
            accessibilityRole="button"
            accessibilityLabel={`${coins} coins`}>
            <SymbolView
              name={{ ios: 'circle.fill', android: 'monetization_on', web: 'monetization_on' }}
              size={12}
              tintColor={Brand.gold}
            />
            <Text style={styles.coinsText}>{coins}</Text>
          </Pressable>

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

          <Pressable
            onPress={() => setMenuOpen(true)}
            style={styles.avatar}
            accessibilityRole="button"
            accessibilityLabel={`Profile menu, ${displayName}`}
            hitSlop={8}>
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>
      </View>

      <StudentProfileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <StudentNotificationsSheet
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  brand: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  title: {
    color: Brand.navy,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  coinsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E7',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#FDE68A',
    minHeight: 36,
  },
  coinsText: {
    color: Brand.navy,
    fontSize: 12,
    fontWeight: '800',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
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
    backgroundColor: Brand.navySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
