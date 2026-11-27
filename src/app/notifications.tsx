import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { NotificationsList } from '@/components/notifications/notifications-list';
import { StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';
import { useNotifications } from '@/hooks/use-notifications';
import { useUnreadCount } from '@/hooks/use-unread-count';

export default function StudentNotificationsScreen() {
  const { items, loading, error, refresh, markRead, markAllRead } = useNotifications(50);
  const { refresh: refreshUnread } = useUnreadCount();
  const hasUnread = items.some((item) => item.unread);

  return (
    <StudentPage
      title="Notifications"
      subtitle="All updates about demos, classes, and your ChessVanguard journey.">
      {hasUnread ? (
        <Pressable
          onPress={async () => {
            await markAllRead();
            await refreshUnread();
          }}
          style={styles.markAll}
          accessibilityRole="button">
          <Text style={styles.markAllText}>Mark all as read</Text>
        </Pressable>
      ) : null}

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

      {!loading && !error ? (
        <NotificationsList
          items={items}
          onPressItem={async (item) => {
            if (!item.unread) return;
            await markRead(item.id);
            await refreshUnread();
          }}
        />
      ) : null}
    </StudentPage>
  );
}

const styles = StyleSheet.create({
  markAll: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  markAllText: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  center: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
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
});
