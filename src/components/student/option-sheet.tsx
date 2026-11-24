import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';

type OptionSheetProps = {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export function OptionSheet({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  searchable = false,
  searchPlaceholder = 'Search…',
}: OptionSheetProps) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!searchable) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, query, searchable]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => setQuery('')}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {searchable ? (
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={Brand.muted}
              style={styles.search}
            />
          ) : null}
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {filtered.map((option) => {
              const active = option === selected;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                  style={[styles.option, active ? styles.optionActive : null]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}>
                  <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                    {option}
                  </Text>
                  {active ? (
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      size={16}
                      tintColor={Brand.gold}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onPress: () => void;
  accent?: boolean;
};

export function SelectField({ label, value, onPress, accent = false }: SelectFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={[styles.select, accent ? styles.selectAccent : null]}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}>
        <Text style={styles.selectText} numberOfLines={1}>
          {value}
        </Text>
        <SymbolView
          name={{ ios: 'chevron.up.chevron.down', android: 'unfold_more', web: 'unfold_more' }}
          size={14}
          tintColor={Brand.muted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  sheet: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: Brand.border,
    marginTop: 8,
  },
  title: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  search: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    color: Brand.navy,
    fontSize: 14,
  },
  list: {
    maxHeight: 320,
  },
  option: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionActive: {
    backgroundColor: '#FFF8E7',
  },
  optionText: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  optionTextActive: {
    fontWeight: '700',
  },
  field: {
    gap: 6,
  },
  label: {
    color: Brand.label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  select: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectAccent: {
    borderColor: Brand.gold,
    backgroundColor: Brand.white,
  },
  selectText: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
