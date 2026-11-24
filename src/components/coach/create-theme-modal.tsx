import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';

type CreateThemeModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate?: (name: string, description: string) => void;
};

export function CreateThemeModal({ visible, onClose, onCreate }: CreateThemeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const canCreate = name.trim().length > 0;

  const reset = () => {
    setName('');
    setDescription('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Create Custom Theme</Text>
                <Text style={styles.subtitle}>Create a custom theme to organize puzzles.</Text>
              </View>
              <Pressable
                onPress={() => {
                  reset();
                  onClose();
                }}
                style={styles.close}
                accessibilityRole="button"
                accessibilityLabel="Close">
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  size={16}
                  tintColor={Brand.navy}
                />
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Endgame Basics"
                placeholderTextColor={Brand.muted}
                style={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
                placeholderTextColor={Brand.muted}
                multiline
                style={[styles.input, styles.textarea]}
              />
            </View>

            <View style={styles.footer}>
              <Pressable
                onPress={() => {
                  reset();
                  onClose();
                }}
                style={styles.cancel}
                accessibilityRole="button">
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <View style={styles.createWrap}>
                <PrimaryButton
                  label="Create Theme"
                  disabled={!canCreate}
                  onPress={() => {
                    onCreate?.(name.trim(), description.trim());
                    reset();
                    onClose();
                  }}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  safe: {
    maxHeight: '94%',
  },
  card: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: Brand.subtitle,
    fontSize: 13,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.inputBackground,
  },
  field: {
    gap: 6,
  },
  label: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    color: Brand.navy,
    fontSize: 14,
  },
  textarea: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  cancel: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Brand.gold,
    fontWeight: '700',
  },
  createWrap: {
    flex: 1,
  },
});
