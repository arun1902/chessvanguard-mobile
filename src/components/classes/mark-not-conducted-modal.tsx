import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { OptionSheet } from '@/components/student/option-sheet';
import { Brand } from '@/constants/brand';
import {
  STUDENT_FACING_STATUS_OPTIONS,
  labelForStudentFacingStatus,
  studentFacingStatusFromLabel,
  type StudentFacingStatus,
} from '@/constants/coach-cancellation';
import type { ClassItem } from '@/services/api';

type MarkNotConductedModalProps = {
  visible: boolean;
  item: ClassItem | null;
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    internalReason: string;
    studentFacingStatus: StudentFacingStatus;
  }) => void;
};

export function MarkNotConductedModal({
  visible,
  item: _item,
  submitting = false,
  error = null,
  onClose,
  onSubmit,
}: MarkNotConductedModalProps) {
  const [internalReason, setInternalReason] = useState('');
  const [studentFacingStatus, setStudentFacingStatus] = useState<StudentFacingStatus | ''>('');
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const resetForm = () => {
    setInternalReason('');
    setStudentFacingStatus('');
    setLocalError(null);
    setStatusSheetOpen(false);
  };

  const handleSubmit = () => {
    if (!internalReason.trim() || !studentFacingStatus) {
      setLocalError('Internal reason and student-facing status are required.');
      return;
    }
    setLocalError(null);
    onSubmit({
      internalReason: internalReason.trim(),
      studentFacingStatus,
    });
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
                <Text style={styles.title}>Mark as Not Conducted</Text>
                <Text style={styles.description}>
                  The internal reason stays hidden from students. They will only see the student-facing
                  status.
                </Text>
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
              <Text style={styles.label}>Internal Reason</Text>
              <TextInput
                value={internalReason}
                onChangeText={setInternalReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!submitting}
                style={styles.textarea}
                placeholderTextColor={Brand.muted}
              />

              <Text style={styles.label}>Student-Facing Status</Text>
              <Pressable
                onPress={() => setStatusSheetOpen(true)}
                disabled={submitting}
                style={styles.select}
                accessibilityRole="button"
                accessibilityLabel="Student-facing status">
                <Text
                  style={[
                    styles.selectText,
                    !studentFacingStatus ? styles.selectPlaceholder : null,
                  ]}>
                  {labelForStudentFacingStatus(studentFacingStatus)}
                </Text>
                <SymbolView
                  name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
                  size={16}
                  tintColor={Brand.muted}
                />
              </Pressable>

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
                  styles.cancelBtn,
                  pressed ? styles.pressed : null,
                  submitting ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel">
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.submitBtn,
                  pressed ? styles.pressed : null,
                  submitting ? styles.disabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Submit">
                {submitting ? (
                  <ActivityIndicator color={Brand.white} />
                ) : (
                  <Text style={styles.submitText}>Submit</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <OptionSheet
        visible={statusSheetOpen}
        title="Student-Facing Status"
        options={STUDENT_FACING_STATUS_OPTIONS.map((option) => option.label)}
        selected={labelForStudentFacingStatus(studentFacingStatus)}
        onSelect={(label) => {
          const value = studentFacingStatusFromLabel(label);
          if (value) setStudentFacingStatus(value);
        }}
        onClose={() => setStatusSheetOpen(false)}
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
    marginTop: 4,
  },
  textarea: {
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.inputBorder,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Brand.navy,
    fontSize: 14,
    lineHeight: 20,
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
  errorText: {
    color: Brand.error,
    fontSize: 13,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  cancelBtn: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
  },
  cancelText: {
    color: Brand.gold,
    fontSize: 14,
    fontWeight: '800',
  },
  submitBtn: {
    minHeight: 42,
    minWidth: 96,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
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
