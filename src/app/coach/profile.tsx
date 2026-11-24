import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CoachCard, CoachPage, PrimaryButton } from '@/components/coach/coach-page';
import { OptionSheet } from '@/components/student/option-sheet';
import { Brand } from '@/constants/brand';
import {
  COACH_DAYS,
  DEMO_COACH_USER,
  DEMO_DEMO_SLOTS,
  DEMO_REGULAR_SLOTS,
  DEMO_TIME_OPTIONS,
} from '@/constants/coach';

type PrefKey = 'email' | 'whatsapp' | 'inApp';
type EditSection = 'profile' | 'personal' | 'teaching' | 'credentials' | null;
type TeachingTab = 'regular' | 'demo';

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu'] as const;

export default function CoachProfileScreen() {
  const [editSection, setEditSection] = useState<EditSection>(null);
  const [name, setName] = useState(DEMO_COACH_USER.name);
  const [specialization, setSpecialization] = useState(DEMO_COACH_USER.specialization);
  const [mobile, setMobile] = useState(DEMO_COACH_USER.mobile);
  const [experience, setExperience] = useState(String(DEMO_COACH_USER.experienceYears));
  const [about, setAbout] = useState(DEMO_COACH_USER.about);
  const [education, setEducation] = useState(DEMO_COACH_USER.education);
  const [languages, setLanguages] = useState<string[]>([...DEMO_COACH_USER.languages]);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
  const [fideId, setFideId] = useState('');
  const [lichess, setLichess] = useState('');
  const [chessCom, setChessCom] = useState('');
  const [teachingTab, setTeachingTab] = useState<TeachingTab>('regular');
  const [day, setDay] = useState<string>(COACH_DAYS[0]);
  const [time, setTime] = useState<string>(DEMO_TIME_OPTIONS[0]);
  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [regularSlots, setRegularSlots] = useState(DEMO_REGULAR_SLOTS);
  const [demoSlots, setDemoSlots] = useState(DEMO_DEMO_SLOTS);
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    email: true,
    whatsapp: true,
    inApp: true,
  });

  const activeSlots = teachingTab === 'regular' ? regularSlots : demoSlots;
  const regularCount = useMemo(
    () => Object.values(regularSlots).reduce((sum, slots) => sum + slots.length, 0),
    [regularSlots]
  );
  const demoCount = useMemo(
    () => Object.values(demoSlots).reduce((sum, slots) => sum + slots.length, 0),
    [demoSlots]
  );

  const cancelEdit = () => setEditSection(null);

  const addSlot = () => {
    const setter = teachingTab === 'regular' ? setRegularSlots : setDemoSlots;
    setter((current) => {
      const existing = current[day] ?? [];
      if (existing.includes(time)) return current;
      return { ...current, [day]: [...existing, time].sort() };
    });
  };

  const removeSlot = (weekday: string, slot: string) => {
    const setter = teachingTab === 'regular' ? setRegularSlots : setDemoSlots;
    setter((current) => ({
      ...current,
      [weekday]: (current[weekday] ?? []).filter((item) => item !== slot),
    }));
  };

  return (
    <CoachPage title="My Profile" subtitle="Manage your profile and teaching settings.">
      {/* Profile */}
      <CoachCard style={styles.card}>
        <SectionHeader
          title="Profile"
          editing={editSection === 'profile'}
          onEdit={() => setEditSection('profile')}
          onCancel={cancelEdit}
        />
        {editSection === 'profile' ? (
          <View style={styles.form}>
            <Field label="Coach Name" value={name} onChangeText={setName} />
            <Field label="Specialization" value={specialization} onChangeText={setSpecialization} />
            <Field label="Mobile Number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
            <Field
              label="Years of Experience"
              value={experience}
              onChangeText={setExperience}
              keyboardType="number-pad"
            />
            <PrimaryButton label="Update Coach" onPress={cancelEdit} />
          </View>
        ) : (
          <View style={styles.profileView}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>C</Text>
            </View>
            <Text style={styles.coachName}>{name}</Text>
            <Text style={styles.spec}>{specialization}</Text>
            <View style={styles.expBadge}>
              <Text style={styles.expText}>{experience} years experience</Text>
            </View>
          </View>
        )}
      </CoachCard>

      {/* Personal Info */}
      <CoachCard style={styles.card}>
        <SectionHeader
          title="Personal Info"
          editing={editSection === 'personal'}
          onEdit={() => setEditSection('personal')}
          onCancel={cancelEdit}
        />
        {editSection === 'personal' ? (
          <View style={styles.form}>
            <Field label="Mobile Number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
            <Field label="Bio / About Me" value={about} onChangeText={setAbout} multiline />
            <Field label="Education / Certifications" value={education} onChangeText={setEducation} />
            <Text style={styles.fieldLabel}>Languages</Text>
            <Pressable
              onPress={() => setLanguageSheetOpen(true)}
              style={styles.languageBox}
              accessibilityRole="button">
              <View style={styles.langTags}>
                {languages.map((lang) => (
                  <Pressable
                    key={lang}
                    onPress={() => setLanguages((current) => current.filter((item) => item !== lang))}
                    style={styles.langTag}>
                    <Text style={styles.langTagText}>{lang} ×</Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
            <PrimaryButton label="Update Coach" onPress={cancelEdit} />
          </View>
        ) : (
          <View style={styles.infoList}>
            <Info label="Mobile Number" value={mobile} />
            <Info label="Email" value={DEMO_COACH_USER.email} />
            <Info label="About Me" value={about} />
            <Info label="Education & Certifications" value={education} />
            <View style={styles.langTags}>
              {languages.map((lang) => (
                <View key={lang} style={styles.langChip}>
                  <Text style={styles.langChipText}>{lang}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.meetNote}>
              No fallback Google Meet link configured – contact admin to set up your meeting link.
            </Text>
          </View>
        )}
      </CoachCard>

      {/* Teaching */}
      <CoachCard style={styles.card}>
        <SectionHeader
          title="Teaching"
          editing={editSection === 'teaching'}
          onEdit={() => setEditSection('teaching')}
          onCancel={cancelEdit}
        />
        {editSection === 'teaching' ? (
          <View style={styles.form}>
            <View style={styles.slotCounts}>
              <Text style={styles.slotCount}>✓ Regular: {regularCount} slots</Text>
              <Text style={styles.slotCount}>✓ Demo: {demoCount} slots</Text>
            </View>
            <View style={styles.tabs}>
              <Pressable
                onPress={() => setTeachingTab('regular')}
                style={[styles.tab, teachingTab === 'regular' ? styles.tabActive : null]}>
                <Text style={[styles.tabText, teachingTab === 'regular' ? styles.tabTextActive : null]}>
                  Regular ({regularCount})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTeachingTab('demo')}
                style={[styles.tab, teachingTab === 'demo' ? styles.tabActive : null]}>
                <Text style={[styles.tabText, teachingTab === 'demo' ? styles.tabTextActive : null]}>
                  Demo ({demoCount})
                </Text>
              </Pressable>
            </View>
            <Text style={styles.helper}>
              {teachingTab === 'regular'
                ? 'Recurring weekly slots for enrolled students. Slots must be ≥10 minutes apart on the same day.'
                : 'Trial session slots that prospective students can book. Slots must be ≥10 minutes apart on the same day.'}
            </Text>
            <Pressable style={styles.select} onPress={() => setDaySheetOpen(true)}>
              <Text style={styles.selectLabel}>DAY</Text>
              <Text style={styles.selectValue}>{day}</Text>
            </Pressable>
            <Pressable style={styles.select} onPress={() => setTimeSheetOpen(true)}>
              <Text style={styles.selectLabel}>TIME</Text>
              <Text style={styles.selectValue}>{time}</Text>
            </Pressable>
            <PrimaryButton label="+ Add" onPress={addSlot} />
            {Object.entries(activeSlots).map(([weekday, slots]) =>
              slots.length ? (
                <View key={weekday} style={styles.dayBlock}>
                  <Text style={styles.dayLabel}>{weekday.toUpperCase()}</Text>
                  <View style={styles.slotWrap}>
                    {slots.map((slot) => (
                      <Pressable
                        key={`${weekday}-${slot}`}
                        onPress={() => removeSlot(weekday, slot)}
                        style={styles.slotChip}>
                        <Text style={styles.slotText}>{slot} 🗑</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null
            )}
          </View>
        ) : (
          <View style={styles.infoList}>
            <Text style={styles.previewTitle}>Regular Schedule</Text>
            <Text style={styles.previewBody}>
              {Object.entries(regularSlots)
                .filter(([, slots]) => slots.length)
                .map(([weekday, slots]) => `${weekday}: ${slots.slice(0, 4).join(', ')}${slots.length > 4 ? '…' : ''}`)
                .join('\n') || 'No regular slots'}
            </Text>
            <Text style={styles.previewTitle}>Demo Slots</Text>
            <Text style={styles.previewBody}>
              {Object.entries(demoSlots)
                .filter(([, slots]) => slots.length)
                .map(([weekday, slots]) => `${weekday}: ${slots.slice(0, 4).join(', ')}${slots.length > 4 ? '…' : ''}`)
                .join('\n') || 'No demo slots'}
            </Text>
          </View>
        )}
      </CoachCard>

      {/* Credentials */}
      <CoachCard style={styles.card}>
        <SectionHeader
          title="Credentials"
          subtitle="Chess platform IDs and resume"
          editing={editSection === 'credentials'}
          onEdit={() => setEditSection('credentials')}
          onCancel={cancelEdit}
        />
        {editSection === 'credentials' ? (
          <View style={styles.form}>
            <Text style={styles.previewTitle}>Chess Platforms</Text>
            <Field label="FIDE ID" value={fideId} onChangeText={setFideId} placeholder="Enter FIDE ID (min 5 chars)" />
            <Field label="Lichess Username" value={lichess} onChangeText={setLichess} placeholder="Enter Lichess username" />
            <Field
              label="Chess.com Username"
              value={chessCom}
              onChangeText={setChessCom}
              placeholder="Enter Chess.com username"
            />
            <Text style={styles.previewTitle}>Resume / CV</Text>
            <View style={styles.uploadBox}>
              <Text style={styles.uploadText}>Upload PDF, DOC, or DOCX (max 5 MB)</Text>
            </View>
            <PrimaryButton label="Save Credentials" onPress={cancelEdit} />
          </View>
        ) : (
          <View style={styles.credGrid}>
            <Info label="FIDE ID" value={fideId || 'Not set'} muted={!fideId} />
            <Info label="LICHESS" value={lichess || 'Not set'} muted={!lichess} />
            <Info label="CHESS.COM" value={chessCom || 'Not set'} muted={!chessCom} />
            <Info label="RESUME" value="Not uploaded" muted />
          </View>
        )}
      </CoachCard>

      {/* Notifications */}
      <CoachCard style={styles.card}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <PrefRow
          title="Email"
          description="Receive updates on your email address."
          enabled={prefs.email}
          onToggle={() => setPrefs((c) => ({ ...c, email: !c.email }))}
        />
        <PrefRow
          title="WhatsApp"
          description="Receive updates on your verified WhatsApp number."
          enabled={prefs.whatsapp}
          onToggle={() => setPrefs((c) => ({ ...c, whatsapp: !c.whatsapp }))}
        />
        <PrefRow
          title="In-app"
          description="Show updates in the notification bell."
          enabled={prefs.inApp}
          onToggle={() => setPrefs((c) => ({ ...c, inApp: !c.inApp }))}
        />
      </CoachCard>

      <OptionSheet
        visible={languageSheetOpen}
        title="Languages"
        options={[...LANGUAGE_OPTIONS]}
        selected=""
        onSelect={(value) => {
          setLanguages((current) => (current.includes(value) ? current : [...current, value]));
        }}
        onClose={() => setLanguageSheetOpen(false)}
      />
      <OptionSheet
        visible={daySheetOpen}
        title="Day"
        options={[...COACH_DAYS]}
        selected={day}
        onSelect={setDay}
        onClose={() => setDaySheetOpen(false)}
      />
      <OptionSheet
        visible={timeSheetOpen}
        title="Time"
        options={[...DEMO_TIME_OPTIONS]}
        selected={time}
        onSelect={setTime}
        onClose={() => setTimeSheetOpen(false)}
      />
    </CoachPage>
  );
}

function SectionHeader({
  title,
  subtitle,
  editing,
  onEdit,
  onCancel,
}: {
  title: string;
  subtitle?: string;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable
        onPress={editing ? onCancel : onEdit}
        style={styles.editButton}
        accessibilityRole="button">
        <Text style={styles.editText}>{editing ? 'Cancel' : 'Edit'}</Text>
      </Pressable>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Brand.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline ? styles.textarea : null]}
      />
    </View>
  );
}

function Info({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, muted ? styles.infoMuted : null]}>{value}</Text>
    </View>
  );
}

function PrefRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.prefRow}>
      <View style={styles.prefCopy}>
        <Text style={styles.prefTitle}>{title}</Text>
        <Text style={styles.prefDescription}>{description}</Text>
      </View>
      <Pressable
        onPress={onToggle}
        style={[styles.toggle, enabled ? styles.toggleOn : styles.toggleOff]}
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled }}>
        <View style={styles.knob} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionCopy: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: Brand.subtitle,
    fontSize: 12,
  },
  editButton: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    color: Brand.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  profileView: {
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.gold,
    fontSize: 28,
    fontWeight: '800',
  },
  coachName: {
    color: Brand.navy,
    fontSize: 20,
    fontWeight: '800',
  },
  spec: {
    color: Brand.subtitle,
    fontSize: 14,
  },
  expBadge: {
    marginTop: 4,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  expText: {
    color: Brand.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  form: {
    gap: 10,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
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
    minHeight: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  infoList: {
    gap: 10,
  },
  info: {
    gap: 2,
  },
  infoLabel: {
    color: Brand.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '600',
  },
  infoMuted: {
    color: Brand.subtitle,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  langTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  langTag: {
    borderRadius: 999,
    backgroundColor: Brand.navy,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  langTagText: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: '700',
  },
  langChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  langChipText: {
    color: Brand.navy,
    fontSize: 12,
    fontWeight: '600',
  },
  languageBox: {
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  meetNote: {
    color: Brand.subtitle,
    fontSize: 12,
    lineHeight: 17,
  },
  slotCounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotCount: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderColor: Brand.gold,
    backgroundColor: '#FFF8E7',
  },
  tabText: {
    color: Brand.subtitle,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Brand.navy,
    fontWeight: '800',
  },
  helper: {
    color: Brand.subtitle,
    fontSize: 12,
    lineHeight: 17,
  },
  select: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  selectLabel: {
    color: Brand.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  selectValue: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '600',
  },
  dayBlock: {
    gap: 8,
  },
  dayLabel: {
    color: Brand.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  slotWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    borderRadius: 10,
    backgroundColor: Brand.inputBackground,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  slotText: {
    color: Brand.navy,
    fontSize: 12,
    fontWeight: '600',
  },
  previewTitle: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  previewBody: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 19,
  },
  credGrid: {
    gap: 10,
  },
  uploadBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Brand.border,
    padding: 20,
    alignItems: 'center',
  },
  uploadText: {
    color: Brand.subtitle,
    fontSize: 13,
    textAlign: 'center',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prefCopy: {
    flex: 1,
    gap: 2,
  },
  prefTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  prefDescription: {
    color: Brand.subtitle,
    fontSize: 12,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: Brand.gold,
    alignItems: 'flex-end',
  },
  toggleOff: {
    backgroundColor: Brand.border,
    alignItems: 'flex-start',
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Brand.white,
  },
});
