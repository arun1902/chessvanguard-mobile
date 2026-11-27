import * as DocumentPicker from 'expo-document-picker';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  FieldError,
  OnboardingShell,
} from '@/components/onboarding/onboarding-shell';
import { useToast } from '@/components/ui/app-toast';
import { Brand, LoginLayout } from '@/constants/brand';
import { getHomeHrefForRole, useAuth } from '@/features/auth/session';
import { api, ApiError } from '@/services/api';

type CheckStatus = 'idle' | 'checking' | 'ok' | 'error';
type ResumeStatus = 'idle' | 'uploading' | 'ok' | 'error';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function RequiredMark() {
  return <Text style={styles.required}> *</Text>;
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'checking') return <ActivityIndicator size="small" color={Brand.muted} />;
  if (status === 'ok') {
    return (
      <SymbolView
        name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
        size={18}
        tintColor="#16A34A"
      />
    );
  }
  if (status === 'error') {
    return (
      <SymbolView
        name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
        size={18}
        tintColor={Brand.error}
      />
    );
  }
  return null;
}

export default function SetupCoachProfileScreen() {
  const { user, token, isLoading: authLoading, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(user?.name?.trim() || '');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [fideId, setFideId] = useState('');
  const [lichessId, setLichessId] = useState('');
  const [chessComId, setChessComId] = useState('');
  const [fideStatus, setFideStatus] = useState<CheckStatus>('idle');
  const [lichessStatus, setLichessStatus] = useState<CheckStatus>('idle');
  const [chessComStatus, setChessComStatus] = useState<CheckStatus>('idle');
  const [resumeKey, setResumeKey] = useState<string | undefined>();
  const [resumeName, setResumeName] = useState<string | undefined>();
  const [resumeStatus, setResumeStatus] = useState<ResumeStatus>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const fideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lichessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user) {
      router.replace('/');
      return;
    }
    if (user.role !== 'Coach') {
      router.replace(getHomeHrefForRole(user.role) || '/');
    }
  }, [authLoading, token, user]);

  useEffect(() => {
    if (user?.name?.trim() && !name) setName(user.name.trim());
  }, [user?.name, name]);

  useEffect(() => {
    if (fideTimer.current) clearTimeout(fideTimer.current);
    setFideStatus('idle');
    const value = fideId.trim();
    if (value.length < 5) return;
    setFideStatus('checking');
    fideTimer.current = setTimeout(async () => {
      try {
        await api.platform.verifyFide(value);
        setFideStatus('ok');
      } catch {
        setFideStatus('error');
      }
    }, 700);
    return () => {
      if (fideTimer.current) clearTimeout(fideTimer.current);
    };
  }, [fideId]);

  useEffect(() => {
    if (lichessTimer.current) clearTimeout(lichessTimer.current);
    setLichessStatus('idle');
    const value = lichessId.trim();
    if (value.length < 3) return;
    setLichessStatus('checking');
    lichessTimer.current = setTimeout(async () => {
      try {
        await api.platform.verifyLichess(value);
        setLichessStatus('ok');
      } catch {
        setLichessStatus('error');
      }
    }, 700);
    return () => {
      if (lichessTimer.current) clearTimeout(lichessTimer.current);
    };
  }, [lichessId]);

  useEffect(() => {
    if (chessTimer.current) clearTimeout(chessTimer.current);
    setChessComStatus('idle');
    const value = chessComId.trim();
    if (value.length < 3) return;
    setChessComStatus('checking');
    chessTimer.current = setTimeout(async () => {
      try {
        await api.platform.verifyChessCom(value);
        setChessComStatus('ok');
      } catch {
        setChessComStatus('error');
      }
    }, 700);
    return () => {
      if (chessTimer.current) clearTimeout(chessTimer.current);
    };
  }, [chessComId]);

  const isAnyChecking =
    fideStatus === 'checking' || lichessStatus === 'checking' || chessComStatus === 'checking';
  const isAnyVerified =
    fideStatus === 'ok' || lichessStatus === 'ok' || chessComStatus === 'ok';

  const pickResume = useCallback(async () => {
    if (saving || resumeStatus === 'uploading') return;
    setFormError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const mime = asset.mimeType || 'application/pdf';
      if (!ALLOWED_MIME.has(mime) && !/\.(pdf|doc|docx)$/i.test(asset.name)) {
        setResumeStatus('error');
        setFormError('Only PDF, DOC, or DOCX files are allowed.');
        return;
      }
      if ((asset.size ?? 0) > 5 * 1024 * 1024) {
        setResumeStatus('error');
        setFormError('File must be under 5 MB.');
        return;
      }

      setResumeStatus('uploading');
      setResumeName(asset.name);
      setResumeKey(undefined);

      const uploadInfo = await api.coaches.getMyResumeUploadUrl({
        fileName: asset.name,
        contentType: mime,
      });
      const uploadUrl = String(uploadInfo.uploadUrl || uploadInfo.url || '');
      const key = String(uploadInfo.fileName || uploadInfo.key || '');
      const isMock = Boolean(uploadInfo.isMock);

      if (!isMock) {
        if (!uploadUrl || !key) throw new Error('Upload URL unavailable.');
        const fileResponse = await fetch(asset.uri);
        const blob = await fileResponse.blob();
        const put = await fetch(uploadUrl, {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': mime },
        });
        if (!put.ok) throw new Error('Failed to upload resume.');
      }

      setResumeKey(key || asset.name);
      setResumeStatus('ok');
    } catch (err) {
      setResumeStatus('error');
      setResumeKey(undefined);
      setResumeName(undefined);
      setFormError(err instanceof Error ? err.message : 'Resume upload failed.');
    }
  }, [resumeStatus, saving]);

  const finishHome = useCallback(() => {
    router.replace(getHomeHrefForRole('Coach') || '/coach/dashboard');
  }, []);

  const handleSave = async () => {
    setFormError(null);
    if (!name.trim() || name.trim().length < 2) {
      setFormError('Please enter your full name (min 2 characters).');
      return;
    }
    if (!specialization.trim()) {
      setFormError('Please enter your specialization.');
      return;
    }
    if (!bio.trim() || bio.trim().length < 10) {
      setFormError('Bio must be at least 10 characters.');
      return;
    }
    if (!isAnyVerified) {
      setFormError('At least one platform ID (FIDE, Lichess, or Chess.com) must be verified.');
      return;
    }
    if (resumeStatus !== 'ok' || !resumeKey) {
      setFormError('Please upload your resume before saving.');
      return;
    }

    setSaving(true);
    try {
      await api.coaches.updateMyBio({
        name: name.trim(),
        bio: bio.trim(),
        specialization: specialization.trim(),
        experienceYears: experienceYears ? Number.parseInt(experienceYears, 10) : undefined,
        fideId: fideStatus === 'ok' ? fideId.trim() : undefined,
        lichessId: lichessStatus === 'ok' ? lichessId.trim() : undefined,
        chessComId: chessComStatus === 'ok' ? chessComId.trim() : undefined,
        resumeKey,
      });
      await updateUser({ name: name.trim() });
      setDone(true);
      showSuccess('Profile saved!');
      setTimeout(finishHome, 900);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save profile.';
      setFormError(message);
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingShell
          variant="panel"
          title="Profile Saved!"
          subtitle="Your coach profile has been updated."
          loading
          loadingLabel="Opening your coach dashboard…">
          {null}
        </OnboardingShell>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <OnboardingShell
        variant="panel"
        title="Set Up Your Coach Profile"
        subtitle="Add your bio, specialization, and platform IDs so students can find you.">
        <View style={styles.field}>
          <Text style={styles.label}>
            Full Name
            <RequiredMark />
          </Text>
          <TextInput
            value={name}
            onChangeText={(v) => {
              setName(v);
              setFormError(null);
            }}
            placeholder="e.g., John Doe"
            placeholderTextColor={Brand.muted}
            style={styles.input}
            editable={!saving}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Specialization
            <RequiredMark />
          </Text>
          <TextInput
            value={specialization}
            onChangeText={(v) => {
              setSpecialization(v);
              setFormError(null);
            }}
            placeholder="e.g., Opening Theory, Endgame Strategy, Tactics"
            placeholderTextColor={Brand.muted}
            style={styles.input}
            editable={!saving}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Professional Bio
            <RequiredMark />
          </Text>
          <TextInput
            value={bio}
            onChangeText={(v) => {
              setBio(v);
              setFormError(null);
            }}
            placeholder="Describe your chess background, teaching style, and achievements. (min 10 characters)"
            placeholderTextColor={Brand.muted}
            style={[styles.input, styles.textarea]}
            editable={!saving}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.counter}>{bio.length} characters</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Years of Experience</Text>
          <TextInput
            value={experienceYears}
            onChangeText={(v) => setExperienceYears(v.replace(/\D/g, '').slice(0, 2))}
            placeholder="e.g., 5"
            placeholderTextColor={Brand.muted}
            style={styles.input}
            keyboardType="number-pad"
            editable={!saving}
          />
        </View>

        <Text style={styles.sectionTitle}>Chess Platforms</Text>

        <View style={styles.field}>
          <Text style={styles.label}>FIDE ID</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={fideId}
              onChangeText={setFideId}
              placeholder="Enter FIDE ID (min 5 chars)"
              placeholderTextColor={Brand.muted}
              style={[styles.input, styles.inputFlex]}
              editable={!saving}
              autoCapitalize="none"
            />
            <StatusIcon status={fideStatus} />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Lichess Username</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={lichessId}
              onChangeText={setLichessId}
              placeholder="Enter Lichess username"
              placeholderTextColor={Brand.muted}
              style={[styles.input, styles.inputFlex]}
              editable={!saving}
              autoCapitalize="none"
            />
            <StatusIcon status={lichessStatus} />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Chess.com Username</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={chessComId}
              onChangeText={setChessComId}
              placeholder="Enter Chess.com username"
              placeholderTextColor={Brand.muted}
              style={[styles.input, styles.inputFlex]}
              editable={!saving}
              autoCapitalize="none"
            />
            <StatusIcon status={chessComStatus} />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Resume / CV
            <RequiredMark />
          </Text>
          <Pressable
            onPress={() => void pickResume()}
            disabled={saving || resumeStatus === 'uploading'}
            style={[
              styles.uploadBox,
              resumeStatus === 'ok' ? styles.uploadOk : null,
              resumeStatus === 'error' ? styles.uploadError : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Upload resume">
            {resumeStatus === 'uploading' ? (
              <>
                <ActivityIndicator color={Brand.navy} />
                <Text style={styles.uploadText}>Uploading…</Text>
              </>
            ) : resumeStatus === 'ok' ? (
              <>
                <SymbolView
                  name={{ ios: 'doc.fill', android: 'description', web: 'description' }}
                  size={20}
                  tintColor="#15803D"
                />
                <Text style={[styles.uploadText, styles.uploadOkText]} numberOfLines={1}>
                  {resumeName || 'Resume uploaded'}
                </Text>
              </>
            ) : (
              <>
                <SymbolView
                  name={{ ios: 'arrow.up.doc', android: 'upload_file', web: 'upload_file' }}
                  size={22}
                  tintColor={Brand.subtitle}
                />
                <Text style={styles.uploadText}>Upload PDF, DOC, or DOCX (max 5 MB)</Text>
              </>
            )}
          </Pressable>
        </View>

        <FieldError message={formError} />

        <Pressable
          onPress={() => void handleSave()}
          disabled={saving || isAnyChecking}
          style={({ pressed }) => [
            styles.saveBtn,
            (saving || isAnyChecking) && styles.saveDisabled,
            pressed && !saving ? styles.savePressed : null,
          ]}
          accessibilityRole="button">
          {saving || isAnyChecking ? (
            <ActivityIndicator color={Brand.white} />
          ) : (
            <Text style={styles.saveText}>Save Profile</Text>
          )}
        </Pressable>

        <Pressable
          onPress={finishHome}
          disabled={saving}
          style={styles.skipBtn}
          accessibilityRole="button"
          accessibilityLabel="Skip for now">
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </OnboardingShell>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  required: {
    color: Brand.error,
    fontWeight: '800',
  },
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Brand.navy,
  },
  textarea: {
    minHeight: 120,
    paddingTop: 12,
  },
  counter: {
    color: Brand.subtitle,
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  sectionTitle: {
    color: Brand.navy,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputFlex: {
    flex: 1,
  },
  uploadBox: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  uploadOk: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  uploadError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  uploadText: {
    color: Brand.subtitle,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  uploadOkText: {
    color: '#15803D',
  },
  saveBtn: {
    height: LoginLayout.buttonHeight + 4,
    borderRadius: 12,
    backgroundColor: Brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  savePressed: {
    opacity: 0.9,
  },
  saveDisabled: {
    opacity: 0.55,
  },
  saveText: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '800',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  skipText: {
    color: Brand.subtitle,
    fontSize: 14,
    fontWeight: '600',
  },
});
