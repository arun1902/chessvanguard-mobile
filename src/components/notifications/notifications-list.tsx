import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import type { NotificationListItem } from '@/hooks/use-notifications';

type NotificationsListProps = {
  items: NotificationListItem[];
  onPressItem?: (item: NotificationListItem) => void;
};

export function NotificationsList({ items, onPressItem }: NotificationsListProps) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No notifications yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onPressItem?.(item)}
          style={[
            styles.item,
            item.unread ? styles.itemUnread : null,
            index < items.length - 1 ? styles.itemBorder : null,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: item.unread }}>
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
            <Text style={styles.itemBody}>{item.body}</Text>
            <Text style={styles.itemTime}>{item.timeAgo}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: Brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  itemUnread: {
    backgroundColor: '#FFFBEB',
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
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Brand.border,
    padding: 28,
    alignItems: 'center',
    backgroundColor: Brand.inputBackground,
  },
  emptyText: {
    color: Brand.subtitle,
    fontSize: 14,
  },
});
