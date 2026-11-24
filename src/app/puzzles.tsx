import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionSheet, SelectField } from '@/components/student/option-sheet';
import { PrimaryButton, StudentCard, StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';
import { DEMO_STUDENT } from '@/constants/dashboard';

const TABS = ['My Quests', 'Practice Grounds'] as const;
const VIEW_OPTIONS = ['Student', 'Parent'] as const;
const SKILL_OPTIONS = [
  'All skills',
  'Tactics',
  'Endgame',
  'Opening',
  'Calculation',
] as const;
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export default function PuzzlesScreen() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('My Quests');
  const [viewAs, setViewAs] = useState<(typeof VIEW_OPTIONS)[number]>('Parent');
  const [skill, setSkill] = useState<string>(SKILL_OPTIONS[0]);
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number] | null>(null);
  const [skillSheetOpen, setSkillSheetOpen] = useState(false);

  const isPractice = activeTab === 'Practice Grounds';
  const isParentView = viewAs === 'Parent';

  const parentStats = useMemo(
    () => [
      { label: 'Assigned', value: '0' },
      { label: 'Completed', value: '0', hint: '0% Success' },
      { label: 'Completion', value: '0%' },
      { label: 'Days Practiced', value: '0' },
    ],
    []
  );

  return (
    <StudentPage title="Puzzle Quests" subtitle="Conquer your quests and level up your tactics!">
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, active ? styles.tabActive : null]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}>
              <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>

      {!isPractice ? (
        <View style={styles.viewAsRow}>
          <Text style={styles.viewAsLabel}>View as</Text>
          <View style={styles.viewAsToggle}>
            {VIEW_OPTIONS.map((option) => {
              const active = option === viewAs;
              return (
                <Pressable
                  key={option}
                  onPress={() => setViewAs(option)}
                  style={[styles.viewAsChip, active ? styles.viewAsChipActive : null]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`View as ${option}`}>
                  <Text style={[styles.viewAsChipText, active ? styles.viewAsChipTextActive : null]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {isPractice ? (
        <>
          <StudentCard style={styles.practiceHeader}>
            <Text style={styles.practiceTitle}>
              Practice Grounds – Sharpen your skills, solve any puzzle, anytime!
            </Text>
            <View style={styles.solvedChip}>
              <Text style={styles.solvedText}>Training Puzzles Solved: 0</Text>
            </View>
          </StudentCard>

          <StudentCard style={styles.filterCard}>
            <SelectField label="Skill" value={skill} onPress={() => setSkillSheetOpen(true)} />
            <View style={styles.difficultyRow}>
              {DIFFICULTIES.map((level) => {
                const active = difficulty === level;
                return (
                  <Pressable
                    key={level}
                    onPress={() => setDifficulty(active ? null : level)}
                    style={[styles.diffChip, active ? styles.diffChipActive : null]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}>
                    <Text style={[styles.diffText, active ? styles.diffTextActive : null]}>
                      {level}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <PrimaryButton label="Search" onPress={() => undefined} />
          </StudentCard>

          <Text style={styles.emptyPractice}>
            No puzzles match those filters – try another skill or difficulty!
          </Text>
        </>
      ) : isParentView ? (
        <>
          <StudentCard style={styles.reportCard}>
            <Text style={styles.reportTitle}>🔥 THIS WEEK&apos;S BATTLE REPORT</Text>
            <View style={styles.statsGrid}>
              {parentStats.map((stat) => (
                <View key={stat.label} style={styles.stat}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  {stat.hint ? <Text style={styles.statHint}>{stat.hint}</Text> : null}
                </View>
              ))}
            </View>

            <View style={styles.streakRow}>
              <View style={styles.streakCard}>
                <Text style={styles.statLabel}>7-Day Streak</Text>
                <Text style={styles.statValue}>0 of 7 days</Text>
              </View>
              <View style={styles.streakCard}>
                <Text style={styles.statLabel}>Current Streak</Text>
                <Text style={styles.statValue}>{DEMO_STUDENT.currentStreak} days</Text>
                <Text style={styles.streakHint}>Solve today to start streak!</Text>
              </View>
              <View style={styles.streakCard}>
                <Text style={styles.statLabel}>Longest Streak</Text>
                <Text style={styles.statValue}>{DEMO_STUDENT.longestStreak} days</Text>
                <Text style={styles.statHint}>Personal best</Text>
              </View>
            </View>

            <View style={styles.focusBanner}>
              <Text style={styles.focusLabel}>COACH FOCUS AREA</Text>
              <Text style={styles.focusText}>
                Not enough data (need 3+ puzzles in a theme this week).
              </Text>
            </View>
          </StudentCard>

          <StudentCard style={styles.questCard}>
            <Text style={styles.pawn}>♟</Text>
            <Text style={styles.pawnName}>Pawn Pete</Text>
            <Text style={styles.questBubble}>
              No active quests right now — check back after your next class!
            </Text>
            <PrimaryButton label="Back to Dashboard" onPress={() => router.replace('/dashboard')} />
          </StudentCard>
        </>
      ) : (
        <>
          <StudentCard style={styles.reportCard}>
            <Text style={styles.reportTitle}>🔥 THIS WEEK&apos;S BATTLE REPORT</Text>
            <View style={styles.statsGrid}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Puzzles Conquered</Text>
                <Text style={styles.statValue}>0</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Battle Days</Text>
                <Text style={styles.statValue}>0 of 7 days</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Active Days</Text>
                <Text style={styles.statValue}>0</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Current Streak</Text>
                <Text style={styles.statValue}>{DEMO_STUDENT.currentStreak} days</Text>
                <Text style={styles.streakHint}>Solve today to start streak!</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Longest Streak</Text>
                <Text style={styles.statValue}>{DEMO_STUDENT.longestStreak} days</Text>
                <Text style={styles.statHint}>Personal best</Text>
              </View>
            </View>

            <View style={styles.focusBox}>
              <Text style={styles.focusLabel}>STRONGEST POWER</Text>
              <Text style={styles.focusText}>
                Not enough data (need 3+ puzzles in a theme this week).
              </Text>
            </View>
            <View style={styles.focusBox}>
              <Text style={styles.focusLabel}>TRAINING FOCUS</Text>
              <Text style={styles.focusText}>
                Not enough data (need 3+ puzzles in a theme this week).
              </Text>
            </View>
          </StudentCard>

          <StudentCard style={styles.questCard}>
            <Text style={styles.pawn}>♟</Text>
            <Text style={styles.pawnName}>Pawn Pete</Text>
            <Text style={styles.questBubble}>
              No active quests right now — check back after your next class!
            </Text>
            <PrimaryButton label="Back to Dashboard" onPress={() => router.replace('/dashboard')} />
          </StudentCard>
        </>
      )}

      <OptionSheet
        visible={skillSheetOpen}
        title="All skills"
        options={[...SKILL_OPTIONS]}
        selected={skill}
        onSelect={setSkill}
        onClose={() => setSkillSheetOpen(false)}
      />
    </StudentPage>
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
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Brand.navy,
    fontWeight: '800',
  },
  viewAsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  viewAsLabel: {
    color: Brand.label,
    fontSize: 13,
    fontWeight: '700',
  },
  viewAsToggle: {
    flexDirection: 'row',
    backgroundColor: Brand.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 3,
    gap: 2,
  },
  viewAsChip: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAsChipActive: {
    backgroundColor: Brand.gold,
  },
  viewAsChipText: {
    color: Brand.subtitle,
    fontSize: 13,
    fontWeight: '600',
  },
  viewAsChipTextActive: {
    color: Brand.white,
    fontWeight: '800',
  },
  practiceHeader: {
    gap: 12,
  },
  practiceTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  solvedChip: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  solvedText: {
    color: Brand.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  filterCard: {
    gap: 12,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  diffChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
  },
  diffChipActive: {
    backgroundColor: '#FFF8E7',
  },
  diffText: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '600',
  },
  diffTextActive: {
    fontWeight: '800',
  },
  emptyPractice: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: 12,
  },
  reportCard: {
    gap: 12,
    borderColor: '#FDE68A',
  },
  reportTitle: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stat: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    padding: 12,
    gap: 4,
  },
  streakRow: {
    gap: 8,
  },
  streakCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    padding: 12,
    gap: 4,
  },
  statLabel: {
    color: Brand.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  statHint: {
    color: Brand.subtitle,
    fontSize: 11,
  },
  streakHint: {
    color: '#EA580C',
    fontSize: 11,
    fontWeight: '600',
  },
  focusBanner: {
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    gap: 4,
  },
  focusBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 12,
    gap: 4,
  },
  focusLabel: {
    color: Brand.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  focusText: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
  questCard: {
    alignItems: 'center',
    gap: 12,
  },
  pawn: {
    fontSize: 42,
  },
  pawnName: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  questBubble: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
