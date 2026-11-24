import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CreateThemeModal } from '@/components/coach/create-theme-modal';
import { CoachCard, CoachPage, EmptyState, PrimaryButton } from '@/components/coach/coach-page';
import { OptionSheet, SelectField } from '@/components/student/option-sheet';
import { Brand } from '@/constants/brand';

const TABS = ['Puzzles', 'Themes'] as const;
const THEME_OPTIONS = ['All Themes', 'Tactics', 'Endgame', 'Opening'] as const;

export default function CoachPuzzlesScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Puzzles');
  const [theme, setTheme] = useState<string>(THEME_OPTIONS[0]);
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [puzzleId, setPuzzleId] = useState('');
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <CoachPage
      title="Puzzles"
      subtitle="Browse puzzles, manage themes, and assign them to your students.">
      <View style={styles.tabs}>
        {TABS.map((item) => {
          const active = item === tab;
          return (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              style={[styles.tab, active ? styles.tabActive : null]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}>
              <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'Puzzles' ? (
        <>
          <CoachCard style={styles.filters}>
            <SelectField label="Theme" value={theme} onPress={() => setThemeSheetOpen(true)} />
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Min Rating</Text>
                <TextInput
                  value={minRating}
                  onChangeText={setMinRating}
                  placeholder="Min"
                  placeholderTextColor={Brand.muted}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Max Rating</Text>
                <TextInput
                  value={maxRating}
                  onChangeText={setMaxRating}
                  placeholder="Max"
                  placeholderTextColor={Brand.muted}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>
            <View>
              <Text style={styles.label}>Puzzle ID</Text>
              <TextInput
                value={puzzleId}
                onChangeText={setPuzzleId}
                placeholder="Puzzle ID"
                placeholderTextColor={Brand.muted}
                style={styles.input}
              />
            </View>
            <PrimaryButton label="Search" onPress={() => undefined} />
            <Pressable
              onPress={() => setCreateOpen(true)}
              style={styles.outlineButton}
              accessibilityRole="button">
              <Text style={styles.outlineText}>+ Create Custom Theme</Text>
            </Pressable>
          </CoachCard>

          <EmptyState iconLabel="🧩" message="No puzzles found matching your criteria." />
        </>
      ) : (
        <>
          <CoachCard style={styles.themeSection}>
            <Text style={styles.sectionTitle}>System Themes</Text>
            <Text style={styles.sectionBody}>
              Built-in Lichess themes. Use these when browsing or assigning puzzles.
            </Text>
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No system themes found.</Text>
            </View>
          </CoachCard>

          <CoachCard style={styles.themeSection}>
            <View style={styles.customHeader}>
              <View style={styles.customCopy}>
                <Text style={styles.sectionTitle}>Custom Themes</Text>
                <Text style={styles.sectionBody}>Create your own themes and add puzzles to them.</Text>
              </View>
            </View>
            <View style={styles.dashedBox}>
              <Text style={styles.emptyIcon}>🧩</Text>
              <Text style={styles.emptyText}>No custom themes yet</Text>
              <PrimaryButton label="+ Create Theme" onPress={() => setCreateOpen(true)} />
            </View>
          </CoachCard>
        </>
      )}

      <OptionSheet
        visible={themeSheetOpen}
        title="All Themes"
        options={[...THEME_OPTIONS]}
        selected={theme}
        onSelect={setTheme}
        onClose={() => setThemeSheetOpen(false)}
      />
      <CreateThemeModal visible={createOpen} onClose={() => setCreateOpen(false)} />
    </CoachPage>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  tabActive: {
    backgroundColor: '#FFF8E7',
    borderColor: Brand.gold,
  },
  tabText: {
    color: Brand.subtitle,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Brand.navy,
    fontWeight: '800',
  },
  filters: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
    gap: 6,
  },
  label: {
    color: Brand.label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
  outlineButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: Brand.navy,
    fontWeight: '700',
  },
  themeSection: {
    gap: 10,
  },
  sectionTitle: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionBody: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 20,
    alignItems: 'center',
  },
  dashedBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Brand.border,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyText: {
    color: Brand.subtitle,
    fontSize: 14,
  },
  customHeader: {
    gap: 4,
  },
  customCopy: {
    gap: 4,
  },
});
