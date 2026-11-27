import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Brand } from '@/constants/brand';
import type { ClassItem } from '@/services/api';

type CompleteClassModalProps = {
  visible: boolean;
  item: ClassItem | null;
  submitting?: boolean;
  error?: string | null;
  puzzleErrors?: { studentName: string; unsolvedCount: number }[];
  onClose: () => void;
  onSubmit: (payload: { topic: string; notes: string }) => void;
};

export function CompleteClassModal({
  visible,
  item: _item,
  submitting = false,
  error = null,
  puzzleErrors = [],
  onClose,
  onSubmit,
}: CompleteClassModalProps) {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const resetForm = () => {
    setTopic('');
    setNotes('');
    setLocalError(null);
  };

  const handleSubmit = () => {
    if (!topic.trim() || !notes.trim()) {
      setLocalError('Topic and notes are required.');
      return;
    }
    setLocalError(null);
    onSubmit({ topic: topic.trim(), notes: notes.trim() });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={resetForm}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Complete Class</Text>
                <Text style={styles.description}>
                  Add the class topic and a short summary for students.
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

            <ScrollView
              style={styles.bodyScroll}
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Topic</Text>
              <TextInput
                value={topic}
                onChangeText={setTopic}
                maxLength={200}
                editable={!submitting}
                style={styles.input}
                placeholder="e.g. Opening principles"
                placeholderTextColor={Brand.muted}
              />

              <Text style={styles.label}>Notes / Summary</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                editable={!submitting}
                style={styles.textarea}
                placeholder="Short summary for the student"
                placeholderTextColor={Brand.muted}
              />

              {localError || error ? (
                <Text style={styles.errorText}>{localError || error}</Text>
              ) : null}

              {puzzleErrors.length > 0 ? (
                <View style={styles.puzzleList}>
                  {puzzleErrors.map((student) => (
                    <Text key={student.studentName} style={styles.puzzleItem}>
                      • {student.studentName}: {student.unsolvedCount} unsolved
                    </Text>
                  ))}
                </View>
              ) : null}
            </ScrollView>

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
        </KeyboardAvoidingView>
      </View>
    </Modal>
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
  keyboard: {
    width: '100%',
  },
  card: {
    backgroundColor: Brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    overflow: 'hidden',
    maxHeight: '88%',
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
  bodyScroll: {
    flexGrow: 0,
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
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.inputBorder,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Brand.navy,
    fontSize: 14,
  },
  textarea: {
    minHeight: 120,
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
  errorText: {
    color: Brand.error,
    fontSize: 13,
    marginTop: 4,
  },
  puzzleList: {
    gap: 4,
    marginTop: 2,
  },
  puzzleItem: {
    color: Brand.error,
    fontSize: 13,
    lineHeight: 18,
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
