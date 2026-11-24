import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import { DEMO_COACH_NOTIFICATIONS } from '@/constants/coach';

type CoachNotificationsSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CoachNotificationsSheet({ visible, onClose }: CoachNotificationsSheetProps) {
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
            {DEMO_COACH_NOTIFICATIONS.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.item,
                  index < DEMO_COACH_NOTIFICATIONS.length - 1 ? styles.itemBorder : null,
                ]}>
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
  },
  item: {
    flexDirection: 'row',
    gap: 12,
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
