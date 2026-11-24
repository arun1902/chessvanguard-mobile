import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  timeAgo: string;
};

export function NotificationsList({ items }: { items: NotificationItem[] }) {
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
        <View
          key={item.id}
          style={[styles.item, index < items.length - 1 ? styles.itemBorder : null]}>
          <View style={styles.iconWrap}>
            <SymbolView
              name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
              size={18}
              tintColor="#0F766E"
            />
          </View>
          <View style={styles.copy}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemBody}>{item.body}</Text>
            <Text style={styles.itemTime}>{item.timeAgo}</Text>
          </View>
        </View>
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
  copy: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '800',
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
