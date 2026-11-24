import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, StudentCard, StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';
import { DEMO_STUDENT } from '@/constants/dashboard';

const DEMO_EMAIL = 'arunkumarvlogs2002@gmail.com';
const DEMO_WHATSAPP = '6283230651';
const OTP_RESEND_SECONDS = 60;

type PrefKey = 'email' | 'whatsapp' | 'inApp';
type AccountMode = 'view' | 'edit' | 'otp';

export default function ProfileScreen() {
  const [mode, setMode] = useState<AccountMode>('view');
  const [savedWhatsapp, setSavedWhatsapp] = useState(DEMO_WHATSAPP);
  const [whatsapp, setWhatsapp] = useState(DEMO_WHATSAPP);
  const [otp, setOtp] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    email: true,
    whatsapp: true,
    inApp: true,
  });

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const toggle = (key: PrefKey) => {
    setPrefs((current) => ({ ...current, [key]: !current[key] }));
  };

  const startEdit = () => {
    setWhatsapp(savedWhatsapp);
    setOtp('');
    setMode('edit');
  };

  const cancelEdit = () => {
    setWhatsapp(savedWhatsapp);
    setOtp('');
    setResendIn(0);
    setMode('view');
  };

  const sendOtp = () => {
    setOtp('');
    setResendIn(OTP_RESEND_SECONDS);
    setMode('otp');
  };

  const verifyAndSave = () => {
    if (otp.trim().length < 6) return;
    setSavedWhatsapp(whatsapp);
    setOtp('');
    setResendIn(0);
    setMode('view');
  };

  return (
    <StudentPage
      title="My Profile"
      subtitle="Manage your account and notification preferences.">
      <StudentCard style={styles.card}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <InfoRow label="NAME" value={DEMO_STUDENT.name} />
        <InfoRow label="EMAIL" value={DEMO_EMAIL} />

        {mode === 'view' ? (
          <>
            <InfoRow label="WHATSAPP NUMBER" value={savedWhatsapp} verified />
            <Pressable
              onPress={startEdit}
              style={styles.editButton}
              accessibilityRole="button"
              accessibilityLabel="Edit account info">
              <Text style={styles.editText}>Edit / Change</Text>
            </Pressable>
          </>
        ) : null}

        {mode === 'edit' ? (
          <View style={styles.editBlock}>
            <Text style={styles.fieldLabel}>WhatsApp Number</Text>
            <TextInput
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
              placeholder="10-digit mobile number"
              placeholderTextColor={Brand.muted}
              style={styles.input}
              accessibilityLabel="WhatsApp number"
            />
            <Text style={styles.helper}>Changing your number requires OTP verification.</Text>
            <View style={styles.editActions}>
              <View style={styles.actionGrow}>
                <PrimaryButton label="Send OTP" onPress={sendOtp} />
              </View>
              <Pressable
                onPress={cancelEdit}
                style={styles.cancelButton}
                accessibilityRole="button"
                accessibilityLabel="Cancel">
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {mode === 'otp' ? (
          <View style={styles.editBlock}>
            <Text style={styles.fieldLabel}>Enter OTP sent to {whatsapp}</Text>
            <TextInput
              value={otp}
              onChangeText={(value) => setOtp(value.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder="6-digit code"
              placeholderTextColor={Brand.muted}
              style={styles.input}
              maxLength={6}
              accessibilityLabel="OTP code"
            />
            <View style={styles.editActions}>
              <View style={styles.actionGrow}>
                <PrimaryButton
                  label="Verify & Save"
                  onPress={verifyAndSave}
                  disabled={otp.trim().length < 6}
                />
              </View>
              <Pressable
                onPress={sendOtp}
                disabled={resendIn > 0}
                style={[styles.cancelButton, resendIn > 0 ? styles.resendDisabled : null]}
                accessibilityRole="button"
                accessibilityState={{ disabled: resendIn > 0 }}
                accessibilityLabel={resendIn > 0 ? `Resend in ${resendIn} seconds` : 'Resend OTP'}>
                <Text style={[styles.cancelText, resendIn > 0 ? styles.resendDisabledText : null]}>
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                setOtp('');
                setMode('edit');
              }}
              accessibilityRole="button"
              accessibilityLabel="Change number">
              <Text style={styles.changeNumber}>← Change number</Text>
            </Pressable>
          </View>
        ) : null}
      </StudentCard>

      <StudentCard style={styles.card}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <PrefRow
          title="Email"
          description="Receive updates on your email address."
          enabled={prefs.email}
          onToggle={() => toggle('email')}
        />
        <PrefRow
          title="WhatsApp"
          description="Receive updates on your verified WhatsApp number."
          enabled={prefs.whatsapp}
          onToggle={() => toggle('whatsapp')}
        />
        <PrefRow
          title="In-app"
          description="Show updates in the notification bell."
          enabled={prefs.inApp}
          onToggle={() => toggle('inApp')}
        />
      </StudentCard>
    </StudentPage>
  );
}

function InfoRow({
  label,
  value,
  verified,
}: {
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Text style={styles.infoValue}>{value}</Text>
        {verified ? <Text style={styles.verified}>Verified</Text> : null}
      </View>
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
        <View style={[styles.knob, enabled ? styles.knobOn : styles.knobOff]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  sectionTitle: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    color: Brand.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  infoValue: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '600',
  },
  verified: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  editButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Brand.inputBackground,
  },
  editText: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  editBlock: {
    gap: 8,
  },
  fieldLabel: {
    color: Brand.navy,
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: '600',
  },
  helper: {
    color: Brand.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  actionGrow: {
    flex: 1,
  },
  cancelButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
  },
  cancelText: {
    color: Brand.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  resendDisabled: {
    opacity: 0.7,
  },
  resendDisabledText: {
    color: '#F59E0B',
  },
  changeNumber: {
    color: Brand.subtitle,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
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
    lineHeight: 17,
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
  knobOn: {},
  knobOff: {},
});
