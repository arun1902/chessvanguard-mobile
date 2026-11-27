import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CoachCard, CoachPage, PrimaryButton } from '@/components/coach/coach-page';
import { OptionSheet } from '@/components/student/option-sheet';
import { useToast } from '@/components/ui/app-toast';
import { Brand } from '@/constants/brand';
import {
  COACH_DAYS,
  DEMO_COACH_USER,
  DEMO_TIME_OPTIONS,
} from '@/constants/coach';
import { useAuth } from '@/features/auth/session';
import { api, ApiError, type CoachTiming, type DayOfWeek, type TimingType } from '@/services/api';
import { initialsFromName } from '@/utils/format';
import { formatTime12h, parseTimeTo24h, sortTimeLabels12h } from '@/utils/time';

type PrefKey = 'email' | 'whatsapp' | 'inApp';
type EditSection = 'profile' | 'personal' | 'teaching' | 'credentials' | null;
type TeachingTab = 'regular' | 'demo';
type SlotMap = Record<string, string[]>;

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu'] as const;

function emptySlotMap(): SlotMap {
  return Object.fromEntries(COACH_DAYS.map((day) => [day, []])) as SlotMap;
}

function normalizeMobile(value: string) {
  return value.replace(/\D/g, '');
}

function isValidMobile(digits: string) {
  return /^\d{10,15}$/.test(digits);
}

function timingsToSlotMaps(timings: CoachTiming[]): { regular: SlotMap; demo: SlotMap } {
  const regular = emptySlotMap();
  const demo = emptySlotMap();
  for (const timing of timings) {
    const day = timing.day;
    const label = formatTime12h(timing.time);
    if (!day || !label) continue;
    const target = timing.type === 'Demo' ? demo : regular;
    if (!target[day]) target[day] = [];
    if (!target[day].includes(label)) target[day].push(label);
  }
  for (const day of COACH_DAYS) {
    regular[day] = sortTimeLabels12h(regular[day] ?? []);
    demo[day] = sortTimeLabels12h(demo[day] ?? []);
  }
  return { regular, demo };
}

function slotMapsToTimings(regular: SlotMap, demo: SlotMap): CoachTiming[] {
  const timings: CoachTiming[] = [];
  const pushSlots = (map: SlotMap, type: TimingType) => {
    for (const weekday of COACH_DAYS) {
      for (const label of sortTimeLabels12h(map[weekday] ?? [])) {
        const time24 = parseTimeTo24h(label);
        if (!time24) continue;
        timings.push({
          id: '',
          day: weekday as DayOfWeek,
          time: time24,
          type,
        });
      }
    }
  };
  pushSlots(regular, 'Regular');
  pushSlots(demo, 'Demo');
  return timings;
}

export default function CoachProfileScreen() {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [editSection, setEditSection] = useState<EditSection>(null);
  const [saving, setSaving] = useState(false);
  const [slotBusy, setSlotBusy] = useState(false);
  const [name, setName] = useState(user?.name?.trim() || '');
  const [specialization, setSpecialization] = useState('');
  const [mobile, setMobile] = useState('');
  const [savedMobile, setSavedMobile] = useState('');
  const [experience, setExperience] = useState('0');
  const [about, setAbout] = useState('');
  const [education, setEducation] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
  const [fideId, setFideId] = useState('');
  const [lichess, setLichess] = useState('');
  const [chessCom, setChessCom] = useState('');
  const [teachingTab, setTeachingTab] = useState<TeachingTab>('regular');
  const [day, setDay] = useState<string>(COACH_DAYS[0]);
  const [time, setTime] = useState<string>(DEMO_TIME_OPTIONS[0]);
  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [regularSlots, setRegularSlots] = useState<SlotMap>(emptySlotMap);
  const [demoSlots, setDemoSlots] = useState<SlotMap>(emptySlotMap);
  const [weeklyTimings, setWeeklyTimings] = useState<CoachTiming[]>([]);
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    email: true,
    whatsapp: true,
    inApp: true,
  });

  const avatarInitials = initialsFromName(name || user?.name || '', 'S');
  const email = user?.email?.trim() || '';

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    (async () => {
      try {
        const [profile, timingsResult] = await Promise.all([
          api.coaches.getDetails(user.id),
          api.coaches.getMyTimings().catch(() => ({ timings: [] as CoachTiming[] })),
        ]);
        if (!active) return;

        const nextName = String(profile.name || user.name || '').trim();
        const nextMobile = normalizeMobile(String(profile.mobileNumber || ''));
        setName(nextName);
        setSpecialization(String(profile.specialization || ''));
        setMobile(nextMobile);
        setSavedMobile(nextMobile);
        setExperience(String(profile.experienceYears ?? 0));
        setAbout(String(profile.bio || ''));
        setEducation(String(profile.education || ''));
        setLanguages(Array.isArray(profile.languages) ? profile.languages.map(String) : []);
        setFideId(String(profile.fideId || ''));
        setLichess(String(profile.lichessId || ''));
        setChessCom(String(profile.chessComId || ''));

        if (nextName && nextName !== user.name) {
          void updateUser({ name: nextName });
        }

        const timings =
          (timingsResult as { timings?: CoachTiming[] }).timings ??
          profile.weekly_timings ??
          [];
        setWeeklyTimings(timings);
        const maps = timingsToSlotMaps(timings);
        setRegularSlots(maps.regular);
        setDemoSlots(maps.demo);
      } catch {
        if (!active) return;
        // Fall back to auth name so avatar is still correct.
        if (user.name?.trim()) setName(user.name.trim());
      }
    })();
    return () => {
      active = false;
    };
  }, [updateUser, user?.id, user?.name]);

  const activeSlots = teachingTab === 'regular' ? regularSlots : demoSlots;
  const regularCount = useMemo(
    () => Object.values(regularSlots).reduce((sum, slots) => sum + slots.length, 0),
    [regularSlots]
  );
  const demoCount = useMemo(
    () => Object.values(demoSlots).reduce((sum, slots) => sum + slots.length, 0),
    [demoSlots]
  );

  const cancelEdit = () => {
    setMobile(savedMobile);
    setEditSection(null);
  };

  const assertUniqueMobile = async (digits: string) => {
    if (!digits || digits === savedMobile) return;
    try {
      const result = await api.coaches.list({ page: 1, limit: 200 });
      const coaches = Array.isArray((result as { data?: unknown[] }).data)
        ? ((result as { data: Record<string, unknown>[] }).data)
        : Array.isArray(result)
          ? (result as Record<string, unknown>[])
          : [];
      const taken = coaches.some((coach) => {
        const coachId = String(coach.id || coach.userId || '');
        const coachMobile = normalizeMobile(String(coach.mobileNumber || ''));
        if (!coachMobile || coachMobile !== digits) return false;
        return coachId !== user?.id;
      });
      if (taken) {
        throw new Error('This mobile number is already used by another coach.');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('already used')) throw err;
      // If list is restricted, continue and let the update API respond.
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    const nextName = name.trim();
    const nextMobile = normalizeMobile(mobile);
    if (!nextName) {
      Alert.alert('Name required', 'Please enter your coach name.');
      return;
    }
    if (nextMobile && !isValidMobile(nextMobile)) {
      Alert.alert('Invalid mobile number', 'Enter a valid mobile number with 10 to 15 digits.');
      return;
    }
    if (!email) {
      Alert.alert('Email missing', 'Your account email is required and cannot be changed.');
      return;
    }

    setSaving(true);
    try {
      await assertUniqueMobile(nextMobile);

      const timingsForUpdate =
        weeklyTimings.length > 0
          ? weeklyTimings.map(({ id, day: timingDay, time: timingTime, type, label }) => ({
              ...(id ? { id } : {}),
              day: timingDay,
              time: timingTime,
              type,
              ...(label ? { label } : {}),
            }))
          : slotMapsToTimings(regularSlots, demoSlots).map(({ day: timingDay, time: timingTime, type }) => ({
              day: timingDay,
              time: timingTime,
              type,
            }));

      // Bio endpoint cannot persist mobile — use full coach update.
      await api.coaches.update(user.id, {
        name: nextName,
        email,
        specialization: specialization.trim() || 'General Chess',
        mobileNumber: nextMobile || undefined,
        weekly_timings: timingsForUpdate,
        languages,
        bio: about.trim() || undefined,
        education: education.trim() || undefined,
        experienceYears: Number(experience) || 0,
      });

      await api.coaches.updateMyBio({
        name: nextName,
        specialization: specialization.trim() || undefined,
        bio: about.trim() || undefined,
        education: education.trim() || undefined,
        languages,
        experienceYears: Number(experience) || 0,
        fideId: fideId.trim() || undefined,
        lichessId: lichess.trim() || undefined,
        chessComId: chessCom.trim() || undefined,
      });

      setMobile(nextMobile);
      setSavedMobile(nextMobile);
      await updateUser({ name: nextName });
      setEditSection(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not update profile.';
      const lower = message.toLowerCase();
      if (lower.includes('email') && lower.includes('already')) {
        Alert.alert('Email already used', 'This email is already registered to another account.');
      } else if (lower.includes('mobile') && lower.includes('already')) {
        Alert.alert('Mobile already used', 'This mobile number is already registered to another account.');
      } else {
        Alert.alert('Update failed', message);
      }
    } finally {
      setSaving(false);
    }
  };

  const syncSlotMaps = (timings: CoachTiming[]) => {
    const maps = timingsToSlotMaps(timings);
    setRegularSlots(maps.regular);
    setDemoSlots(maps.demo);
  };

  const addSlot = async () => {
    if (slotBusy) return;
    const type: TimingType = teachingTab === 'regular' ? 'Regular' : 'Demo';
    const existing = (teachingTab === 'regular' ? regularSlots : demoSlots)[day] ?? [];
    if (existing.includes(time)) {
      Alert.alert('Already added', `${time} is already on ${day}.`);
      return;
    }
    const time24 = parseTimeTo24h(time);
    if (!time24) {
      Alert.alert('Invalid time', 'Please pick a valid slot time.');
      return;
    }

    setSlotBusy(true);
    try {
      const result = await api.coaches.addMyTiming({
        day: day as DayOfWeek,
        time: time24,
        type,
      });
      const timing = (result.timing || result) as CoachTiming;
      const next = [
        ...weeklyTimings,
        {
          id: String(timing.id || ''),
          day: (timing.day || day) as DayOfWeek,
          time: timing.time || time24,
          type: (timing.type || type) as TimingType,
          label: timing.label,
        },
      ];
      setWeeklyTimings(next);
      syncSlotMaps(next);
      showSuccess(`${time} saved on ${day}.`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save this slot.';
      showError(message);
      Alert.alert('Save failed', message);
    } finally {
      setSlotBusy(false);
    }
  };

  const removeSlot = async (weekday: string, slot: string) => {
    if (slotBusy) return;
    const type: TimingType = teachingTab === 'regular' ? 'Regular' : 'Demo';
    const time24 = parseTimeTo24h(slot);
    const match = weeklyTimings.find((timing) => {
      const sameDay = timing.day === weekday;
      const sameType = timing.type === type;
      const sameTime =
        timing.time === time24 || formatTime12h(timing.time) === slot || timing.label === slot;
      return sameDay && sameType && sameTime;
    });

    if (!match?.id) {
      Alert.alert(
        'Cannot delete',
        'This slot is not linked to a saved timing yet. Reload the profile and try again.'
      );
      return;
    }

    setSlotBusy(true);
    try {
      await api.coaches.deleteMyTiming(match.id);
      const next = weeklyTimings.filter((timing) => timing.id !== match.id);
      setWeeklyTimings(next);
      syncSlotMaps(next);
      showSuccess(`${slot} removed from ${weekday}.`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not delete this slot.';
      showError(message);
      Alert.alert('Delete failed', message);
    } finally {
      setSlotBusy(false);
    }
  };

  const finishTeachingEdit = () => {
    setEditSection(null);
    showSuccess('Teaching slots are saved.');
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
            <Field
              label="Mobile Number"
              value={mobile}
              onChangeText={(value) => setMobile(normalizeMobile(value).slice(0, 15))}
              keyboardType="phone-pad"
            />
            <Text style={styles.helperText}>Use a unique number (10–15 digits). Already-registered numbers are blocked.</Text>
            <Field
              label="Years of Experience"
              value={experience}
              onChangeText={setExperience}
              keyboardType="number-pad"
            />
            <PrimaryButton
              label={saving ? 'Updating…' : 'Update Coach'}
              onPress={() => void saveProfile()}
              disabled={saving}
            />
          </View>
        ) : (
          <View style={styles.profileView}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarInitials}</Text>
              </View>
              <View style={styles.cameraBadge}>
                <SymbolView
                  name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
                  size={12}
                  tintColor={Brand.gold}
                />
              </View>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.coachName}>{name || 'Coach'}</Text>
              <Text style={styles.spec}>{specialization || 'General Chess'}</Text>
              <Text style={styles.expPlain}>{experience || '0'}</Text>
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
            <Field
              label="Mobile Number"
              value={mobile}
              onChangeText={(value) => setMobile(normalizeMobile(value).slice(0, 15))}
              keyboardType="phone-pad"
            />
            <Text style={styles.helperText}>This number can only be used by one account.</Text>
            <View style={styles.readOnlyBlock}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.readOnlyValue}>{email || '—'}</Text>
              <Text style={styles.helperText}>Email is unique and cannot be changed here.</Text>
            </View>
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
            <PrimaryButton
              label={saving ? 'Updating…' : 'Update Coach'}
              onPress={() => void saveProfile()}
              disabled={saving}
            />
          </View>
        ) : (
          <View style={styles.infoList}>
            <View style={styles.infoGrid}>
              <View style={styles.infoGridItem}>
                <Info label="Mobile Number" value={savedMobile || 'Not set'} />
              </View>
              <View style={styles.infoGridItem}>
                <Info label="Email" value={email || DEMO_COACH_USER.email} />
              </View>
            </View>
            <View style={styles.meetBox}>
              <View style={styles.meetTitleRow}>
                <SymbolView
                  name={{ ios: 'video.fill', android: 'videocam', web: 'videocam' }}
                  size={16}
                  tintColor={Brand.navy}
                />
                <Text style={styles.meetTitle}>Google Meet</Text>
              </View>
              <Text style={styles.meetBody}>
                Unique Meet links are created automatically for each class.
              </Text>
              <Text style={styles.meetNote}>
                No fallback link configured — contact admin to set up your meeting link.
              </Text>
            </View>
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
            <Text style={styles.helperText}>
              Tap + Add to save the slot immediately. Trash deletes it from your account.
            </Text>
            <PrimaryButton
              label={slotBusy ? 'Saving…' : '+ Add'}
              onPress={() => void addSlot()}
              disabled={slotBusy}
            />
            {COACH_DAYS.map((weekday) => {
              const ordered = sortTimeLabels12h(activeSlots[weekday] ?? []);
              if (!ordered.length) return null;
              return (
                <View key={weekday} style={styles.dayBlock}>
                  <Text style={styles.dayLabel}>{weekday.toUpperCase()}</Text>
                  <View style={styles.slotWrap}>
                    {ordered.map((slot) => (
                      <View key={`${weekday}-${slot}`} style={styles.slotCell}>
                        <Pressable
                          onPress={() => void removeSlot(weekday, slot)}
                          disabled={slotBusy}
                          style={({ pressed }) => [
                            styles.slotChip,
                            pressed ? styles.slotChipPressed : null,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`Delete ${slot} on ${weekday}`}>
                          <Text style={styles.slotText} numberOfLines={1}>
                            {slot}
                          </Text>
                          <Text style={styles.slotDelete}>🗑</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
            <PrimaryButton
              label="Done"
              tone="navy"
              onPress={finishTeachingEdit}
              disabled={slotBusy}
            />
          </View>
        ) : (
          <View style={styles.teachingPreview}>
            <View style={styles.teachingTile}>
              <SymbolView
                name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }}
                size={18}
                tintColor={Brand.navy}
              />
              <View style={styles.teachingTileCopy}>
                <Text style={styles.previewTitle}>Regular Schedule</Text>
                <Text style={styles.previewBody}>
                  {regularCount > 0 ? `${regularCount} slots set` : 'No slots set'}
                </Text>
              </View>
            </View>
            <View style={styles.teachingTile}>
              <SymbolView
                name={{ ios: 'desktopcomputer', android: 'computer', web: 'computer' }}
                size={18}
                tintColor={Brand.navy}
              />
              <View style={styles.teachingTileCopy}>
                <Text style={styles.previewTitle}>Demo Slots</Text>
                <Text style={styles.previewBody}>
                  {demoCount > 0 ? `${demoCount} slots set` : 'No slots set'}
                </Text>
              </View>
            </View>
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
            <PrimaryButton
              label={saving ? 'Saving…' : 'Save Credentials'}
              onPress={() => void saveProfile()}
              disabled={saving}
            />
          </View>
        ) : (
          <View style={styles.credGrid}>
            <View style={styles.credTile}>
              <Info label="FIDE ID" value={fideId || 'Not set'} muted={!fideId} />
            </View>
            <View style={styles.credTile}>
              <Info label="LICHESS" value={lichess || 'Not set'} muted={!lichess} />
            </View>
            <View style={styles.credTile}>
              <Info label="CHESS.COM" value={chessCom || 'Not set'} muted={!chessCom} />
            </View>
            <View style={[styles.credTile, styles.credResume]}>
              <Info label="RESUME" value="Not uploaded" muted />
            </View>
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
        searchable
        searchPlaceholder="Search time (e.g. PM)"
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
        accessibilityRole="button"
        accessibilityLabel={editing ? 'Cancel' : `Edit ${title}`}>
        {!editing ? (
          <SymbolView
            name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
            size={13}
            tintColor={Brand.gold}
          />
        ) : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Brand.white,
  },
  editText: {
    color: Brand.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  profileView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Brand.white,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.gold,
    fontSize: 28,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
    gap: 2,
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
  expPlain: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoGridItem: {
    flexGrow: 1,
    flexBasis: '45%',
  },
  meetBox: {
    marginTop: 4,
    gap: 6,
    backgroundColor: Brand.inputBackground,
    borderRadius: 12,
    padding: 12,
  },
  meetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  meetBody: {
    color: Brand.subtitle,
    fontSize: 12,
    lineHeight: 17,
  },
  teachingPreview: {
    gap: 10,
  },
  teachingTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.inputBackground,
    borderRadius: 12,
    padding: 14,
  },
  teachingTileCopy: {
    flex: 1,
    gap: 2,
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
  helperText: {
    color: Brand.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: -4,
  },
  readOnlyBlock: {
    gap: 4,
  },
  readOnlyValue: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Brand.subtitle,
    fontSize: 14,
    fontWeight: '600',
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
    gap: 10,
    marginTop: 4,
  },
  dayLabel: {
    color: Brand.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  slotWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  slotCell: {
    width: '33.333%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  slotChip: {
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  slotChipPressed: {
    opacity: 0.75,
    backgroundColor: Brand.inputBackground,
  },
  slotText: {
    flex: 1,
    color: Brand.navy,
    fontSize: 11,
    fontWeight: '700',
  },
  slotDelete: {
    fontSize: 12,
    lineHeight: 14,
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
  credTile: {
    backgroundColor: Brand.inputBackground,
    borderRadius: 12,
    padding: 12,
  },
  credResume: {
    marginTop: 2,
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
