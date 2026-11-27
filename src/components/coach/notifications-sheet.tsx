import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import { useNotifications } from '@/hooks/use-notifications';
import { useUnreadCount } from '@/hooks/use-unread-count';

type CoachNotificationsSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CoachNotificationsSheet({ visible, onClose }: CoachNotificationsSheetProps) {
  const { items, loading, error, refresh, markRead } = useNotifications(8, visible);
  const { refresh: refreshUnread } = useUnreadCount();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close notifications"
              hitSlop={8}>
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                size={16}
                tintColor={Brand.gold}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator color={Brand.gold} />
              </View>
            ) : null}

            {!loading && error ? (
              <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={() => void refresh()} accessibilityRole="button">
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : null}

            {!loading && !error && items.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No notifications yet.</Text>
              </View>
            ) : null}

            {!loading && !error
              ? items.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={async () => {
                      if (item.unread) {
                        await markRead(item.id);
                        await refreshUnread();
                      }
                    }}
                    style={[
                      styles.item,
                      item.unread ? styles.itemUnread : null,
                      index < items.length - 1 ? styles.itemBorder : null,
                    ]}>
                    <View style={[styles.iconWrap, item.unread ? styles.iconUnread : null]}>
                      <SymbolView
                        name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
                        size={18}
                        tintColor="#0F766E"
                      />
                    </View>
                    <View style={styles.copy}>
                      <View style={styles.titleRow}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {item.unread ? <View style={styles.dot} /> : null}
                      </View>
                      <Text style={styles.itemBody} numberOfLines={3}>
                        {item.body}
                      </Text>
                      <Text style={styles.itemTime}>{item.timeAgo}</Text>
                    </View>
                  </Pressable>
                ))
              : null}
          </ScrollView>

          <Pressable
            onPress={() => {
              onClose();
              router.push('/coach/notifications');
            }}
            style={styles.footer}
            accessibilityRole="button"
            accessibilityLabel="View all notifications">
            <Text style={styles.footerText}>View all notifications</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '82%',
    paddingBottom: 4,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: Brand.border,
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
  },
  title: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.inputBackground,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    minHeight: 120,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
  },
  itemUnread: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnread: {
    backgroundColor: '#A7F3D0',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.gold,
  },
  itemBody: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
  itemTime: {
    color: Brand.muted,
    fontSize: 12,
    marginTop: 2,
  },
  center: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
  },
  emptyText: {
    color: Brand.subtitle,
    fontSize: 14,
  },
  errorText: {
    color: Brand.error,
    fontSize: 13,
    textAlign: 'center',
  },
  retryText: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
    marginTop: 4,
  },
  footerText: {
    color: Brand.subtitle,
    fontSize: 14,
    fontWeight: '600',
  },
});
