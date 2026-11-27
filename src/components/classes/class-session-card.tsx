import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import type { ClassItem } from '@/services/api';
import { formatClassDate } from '@/utils/format';

type ClassSessionCardProps = {
  item: ClassItem;
  perspective: 'student' | 'coach';
  actionLabel?: string;
  onActionPress?: () => void;
  /** Extra actions rendered above the optional secondary action (e.g. Start Class). */
  footer?: ReactNode;
};

export function ClassSessionCard({
  item,
  perspective,
  actionLabel,
  onActionPress,
  footer,
}: ClassSessionCardProps) {
  const primaryName = perspective === 'coach' ? item.studentName : item.coachName;
  const secondaryLabel =
    perspective === 'coach' ? `Coach · ${item.coachName}` : `with ${item.coachName}`;

  return (
    <View style={styles.card}>
      <Text style={styles.date}>{formatClassDate(item.scheduledDate)}</Text>
      <Text style={styles.time}>{item.time}</Text>
      <View style={styles.tags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.type}</Text>
        </View>
        <View style={[styles.tag, styles.statusTag]}>
          <Text style={styles.tagText}>{item.studentFacingStatus || item.status}</Text>
        </View>
      </View>
      <Text style={styles.name}>{primaryName || '—'}</Text>
      <Text style={styles.secondary}>{secondaryLabel}</Text>
      {item.studentFacingMessage ? (
        <Text style={styles.message}>{item.studentFacingMessage}</Text>
      ) : null}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 16,
    gap: 6,
  },
  date: {
    color: Brand.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  time: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusTag: {
    backgroundColor: '#DBEAFE',
  },
  tagText: {
    color: Brand.navy,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  name: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  secondary: {
    color: Brand.subtitle,
    fontSize: 13,
  },
  message: {
    color: Brand.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  footer: {
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    marginTop: 8,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
  },
  actionText: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
});
