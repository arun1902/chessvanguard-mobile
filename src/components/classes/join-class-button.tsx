import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { JoinClassModal } from '@/components/classes/join-class-modal';
import { Brand } from '@/constants/brand';
import type { ClassItem } from '@/services/api';

type JoinClassButtonProps = {
  item: ClassItem;
  label?: string;
};

export function JoinClassButton({ item, label = 'Join Now' }: JoinClassButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel={label}>
        <Text style={styles.label}>{label}</Text>
      </Pressable>

      <JoinClassModal visible={open} item={item} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
