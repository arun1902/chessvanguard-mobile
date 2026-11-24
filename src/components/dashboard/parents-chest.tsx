import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';

const GUIDELINES = [
  {
    title: 'Homework',
    body: 'Complete puzzles on Lichess/Chess.com 24h before your next session.',
  },
  {
    title: 'Cancellation',
    body: 'Tell your coach 12 hours before class so your credit stays safe!',
  },
  {
    title: 'Need Help?',
    body: 'Ask your parents to message our support team!',
  },
] as const;

export function ParentsChest() {
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [styles.trigger, pressed ? styles.triggerPressed : null]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="Parent's Chest">
        <View style={styles.triggerLeft}>
          <SymbolView
            name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
            size={16}
            tintColor={Brand.navySoft}
          />
          <Text style={styles.triggerText}>PARENT&apos;S CHEST</Text>
        </View>
        <SymbolView
          name={{
            ios: open ? 'chevron.up' : 'chevron.down',
            android: open ? 'expand_less' : 'expand_more',
            web: open ? 'expand_less' : 'expand_more',
          }}
          size={16}
          tintColor={Brand.navySoft}
        />
      </Pressable>

      {open ? (
        <View style={styles.content}>
          <Text style={styles.guidelinesTitle}>📋 Guidelines</Text>
          {GUIDELINES.map((item) => (
            <View key={item.title} style={styles.item}>
              <Text style={styles.itemText}>
                <Text style={styles.itemBold}>{item.title}: </Text>
                {item.body}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  trigger: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.card,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerPressed: {
    backgroundColor: Brand.inputBackground,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerText: {
    color: Brand.navy,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  content: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.card,
    padding: 14,
    gap: 10,
  },
  guidelinesTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  item: {
    borderRadius: 12,
    backgroundColor: '#F4F7F9',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  itemText: {
    color: Brand.label,
    fontSize: 13,
    lineHeight: 19,
  },
  itemBold: {
    fontWeight: '700',
    color: Brand.navy,
  },
});
