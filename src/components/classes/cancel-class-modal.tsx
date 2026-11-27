import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { OptionSheet } from '@/components/student/option-sheet';
import { Brand } from '@/constants/brand';
import {
  INTERNAL_CANCEL_REASON_CODES,
  INTERNAL_CANCEL_REASON_LABELS,
  internalCancelCodeFromLabel,
  labelForInternalCancelCode,
} from '@/constants/coach-cancellation';
import type { InternalCancelCode } from '@/services/api/types/coaches';

type CancelClassModalProps = {
  visible: boolean;
  title: string;
  message: string;
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (reasonCode: InternalCancelCode) => void;
};

export function CancelClassModal({
  visible,
  title,
  message,
  submitting = false,
  error = null,
  onClose,
  onConfirm,
}: CancelClassModalProps) {
  const [reasonCode, setReasonCode] = useState<InternalCancelCode | ''>('');
  const [reasonSheetOpen, setReasonSheetOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const resetForm = () => {
    setReasonCode('');
    setLocalError(null);
    setReasonSheetOpen(false);
  };

  const handleConfirm = () => {
    if (!reasonCode) {
      setLocalError('Select an internal reason to continue.');
      return;
    }
    setLocalError(null);
    onConfirm(reasonCode);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        onShow={resetForm}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{message}</Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Close">
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  size={18}
                  tintColor={Brand.muted}
                />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.body}>
              <Text style={styles.label}>Internal reason</Text>
              <Pressable
                onPress={() => setReasonSheetOpen(true)}
                disabled={submitting}
                style={styles.select}
                accessibilityRole="button"
                accessibilityLabel="Internal reason">
                <Text style={[styles.selectText, !reasonCode ? styles.selectPlaceholder : null]}>
                  {labelForInternalCancelCode(reasonCode)}
                </Text>
                <SymbolView
                  name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
                  size={16}
                  tintColor={Brand.muted}
                />
              </Pressable>
              <Text style={styles.helper}>
                This reason is internal only and is never shown to the student or parent.
              </Text>
              {localError || error ? (
                <Text style={styles.errorText}>{localError || error}</Text>
              ) : null}
            </View>

            <View style={styles.divider} />

            <View style={styles.footer}>
              <Pressable
                onPress={onClose}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.keepBtn,
                  pressed ? styles.pressed : null,
                  submitting ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Keep class">
                <Text style={styles.keepText}>Keep class</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed ? styles.pressed : null,
                  submitting ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Yes, Cancel">
                {submitting ? (
                  <ActivityIndicator color={Brand.white} />
                ) : (
                  <Text style={styles.cancelText}>Yes, Cancel</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <OptionSheet
        visible={reasonSheetOpen}
        title="Internal reason"
        options={INTERNAL_CANCEL_REASON_CODES.map((code) => INTERNAL_CANCEL_REASON_LABELS[code])}
        selected={labelForInternalCancelCode(reasonCode)}
        onSelect={(label) => {
          const value = internalCancelCodeFromLabel(label);
          if (value) setReasonCode(value);
        }}
        onClose={() => setReasonSheetOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  card: {
    backgroundColor: Brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Brand.border,
  },
  body: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  label: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  select: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.inputBorder,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectText: {
    flex: 1,
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '600',
  },
  selectPlaceholder: {
    color: Brand.muted,
    fontWeight: '500',
  },
  helper: {
    color: Brand.subtitle,
    fontSize: 12,
    lineHeight: 16,
  },
  errorText: {
    color: Brand.error,
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  keepBtn: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
  },
  keepText: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    minHeight: 42,
    minWidth: 118,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#F87171',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
});
