import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BookDemoModal } from '@/components/student/book-demo-modal';
import { OptionSheet, SelectField } from '@/components/student/option-sheet';
import { PrimaryButton, StudentCard, StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';
import { DEMO_COACH } from '@/constants/dashboard';

const COACH_OPTIONS = ['All coaches', 'Coach'] as const;
const EXPERIENCE_OPTIONS = [
  'Any Experience',
  '0-2 years',
  '3-6 years',
  '7+ years',
  'Not specified',
] as const;
const LANGUAGE_OPTIONS = ['Any Language', 'English', 'Hindi', 'Punjabi'] as const;

type SheetKey = 'coach' | 'experience' | 'language' | null;

export default function CoachesScreen() {
  const [coach, setCoach] = useState<string>(COACH_OPTIONS[0]);
  const [experience, setExperience] = useState<string>(EXPERIENCE_OPTIONS[0]);
  const [language, setLanguage] = useState<string>(LANGUAGE_OPTIONS[0]);
  const [search, setSearch] = useState('');
  const [demoDate, setDemoDate] = useState('');
  const [openSheet, setOpenSheet] = useState<SheetKey>(null);
  const [bookOpen, setBookOpen] = useState(false);

  const sheetConfig = useMemo(() => {
    if (openSheet === 'coach') {
      return {
        title: 'Select coach',
        options: [...COACH_OPTIONS],
        selected: coach,
        searchable: true,
        searchPlaceholder: 'Search select a coach...',
        onSelect: setCoach,
      };
    }
    if (openSheet === 'experience') {
      return {
        title: 'Experience',
        options: [...EXPERIENCE_OPTIONS],
        selected: experience,
        searchable: false,
        onSelect: setExperience,
      };
    }
    if (openSheet === 'language') {
      return {
        title: 'Language',
        options: [...LANGUAGE_OPTIONS],
        selected: language,
        searchable: false,
        onSelect: setLanguage,
      };
    }
    return null;
  }, [coach, experience, language, openSheet]);

  return (
    <StudentPage
      title="Coaches"
      subtitle="Browse coaches, compare fit, and book a demo in one place.">
      <Text style={styles.heading}>Find Your Coach</Text>

      <StudentCard style={styles.filtersCard}>
        <Text style={styles.sectionTitle}>Smart Filters for Parents</Text>
        <View style={styles.filterGrid}>
          <SelectField
            label="Coach"
            value={coach}
            accent
            onPress={() => setOpenSheet('coach')}
          />
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Search</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Name or specialization"
              placeholderTextColor={Brand.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Demo Date</Text>
            <TextInput
              value={demoDate}
              onChangeText={setDemoDate}
              placeholder="mm/dd/yyyy"
              placeholderTextColor={Brand.muted}
              style={styles.input}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <SelectField
            label="Experience"
            value={experience}
            onPress={() => setOpenSheet('experience')}
          />
          <SelectField
            label="Language"
            value={language}
            onPress={() => setOpenSheet('language')}
          />
        </View>
      </StudentCard>

      <StudentCard style={styles.coachCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{DEMO_COACH.initial}</Text>
        </View>
        <Text style={styles.coachName}>Coach</Text>
        <View style={styles.tags}>
          {DEMO_COACH.languages.map((item) => (
            <View key={item} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          ))}
          <View style={[styles.tag, styles.expTag]}>
            <Text style={styles.tagText}>6+ yrs exp.</Text>
          </View>
        </View>
        <Text style={styles.bio}>{DEMO_COACH.bio}</Text>
        <View style={styles.ctaRow}>
          <View>
            <Text style={styles.priceAmount}>₹19</Text>
            <Text style={styles.priceHint}>demo class</Text>
          </View>
          <View style={styles.bookWrap}>
            <PrimaryButton label="Book Demo" tone="navy" onPress={() => setBookOpen(true)} />
          </View>
        </View>
      </StudentCard>

      {sheetConfig ? (
        <OptionSheet
          visible
          title={sheetConfig.title}
          options={sheetConfig.options}
          selected={sheetConfig.selected}
          searchable={sheetConfig.searchable}
          searchPlaceholder={sheetConfig.searchPlaceholder}
          onSelect={sheetConfig.onSelect}
          onClose={() => setOpenSheet(null)}
        />
      ) : null}

      <BookDemoModal
        visible={bookOpen}
        coachName="Coach"
        priceLabel={DEMO_COACH.priceLabel}
        onClose={() => setBookOpen(false)}
      />
    </StudentPage>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: Brand.navy,
    fontSize: 24,
    fontWeight: '800',
  },
  filtersCard: {
    gap: 12,
  },
  sectionTitle: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '700',
  },
  filterGrid: {
    gap: 10,
  },
  filterField: {
    gap: 6,
  },
  filterLabel: {
    color: Brand.label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  coachCard: {
    gap: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.gold,
    fontSize: 24,
    fontWeight: '800',
  },
  coachName: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  expTag: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  tagText: {
    color: Brand.label,
    fontSize: 11,
    fontWeight: '600',
  },
  bio: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
    marginTop: 4,
  },
  priceAmount: {
    color: Brand.navy,
    fontSize: 22,
    fontWeight: '800',
  },
  priceHint: {
    color: Brand.subtitle,
    fontSize: 12,
  },
  bookWrap: {
    flex: 1,
    maxWidth: 180,
  },
});
