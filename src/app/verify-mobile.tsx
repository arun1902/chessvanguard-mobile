import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  FieldError,
  OnboardingShell,
  PrimaryPillButton,
} from '@/components/onboarding/onboarding-shell';
import { useToast } from '@/components/ui/app-toast';
import { Brand } from '@/constants/brand';
import { getHomeHrefForRole, useAuth } from '@/features/auth/session';
import { api, ApiError } from '@/services/api';

const MOBILE_PURPOSE = 'mobile-verification-builtin';
const RESEND_SECONDS = 60;

type Step = 'phone' | 'otp' | 'done';

export default function VerifyMobileScreen() {
  const { user, token, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [bootLoading, setBootLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [lastSentTo, setLastSentTo] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finishToNext = useCallback(() => {
    router.replace(getHomeHrefForRole('Coach') || '/coach/dashboard');
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user) {
      router.replace('/');
      return;
    }
    if (user.role !== 'Coach') {
      const home = getHomeHrefForRole(user.role);
      router.replace(home || '/');
      return;
    }

    let active = true;
    (async () => {
      try {
        const context = await api.userVerification.getMobileContext();
        if (!active) return;
        const existing = String(
          (context as { mobileNumber?: string }).mobileNumber || '',
        ).replace(/\D/g, '');
        if (existing.length >= 10) {
          setPhone(existing.slice(-10));
        }
      } catch {
        // Prefill is optional.
      } finally {
        if (active) setBootLoading(false);
      }
    })();

    return () => {
      active = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [authLoading, token, user]);

  const startCooldown = () => {
    setResendIn(RESEND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendIn((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.userVerification.send({
        type: 'WHATSAPP',
        target: cleaned,
        purpose: MOBILE_PURPOSE,
      });
      setLastSentTo(cleaned);
      setStep('otp');
      setOtp('');
      startCooldown();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to send OTP.';
      setError(message);
      showError(message);
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    if (resendIn > 0 || busy) return;
    const cleaned = phone.replace(/\D/g, '');
    setBusy(true);
    setError(null);
    try {
      await api.userVerification.send({
        type: 'WHATSAPP',
        target: cleaned,
        purpose: MOBILE_PURPOSE,
      });
      startCooldown();
      showSuccess('OTP resent.');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Resend failed.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    const cleaned = phone.replace(/\D/g, '');
    const code = otp.replace(/\D/g, '');
    if (code.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.userVerification.confirm({
        type: 'WHATSAPP',
        target: cleaned,
        otp: code,
      });
      await api.userVerification.updateMobileContext({
        mobileNumber: cleaned,
      });
      setStep('done');
      showSuccess('Mobile number verified!');
      setTimeout(finishToNext, 1000);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Invalid code. Please try again.';
      setError(message);
      showError(message);
    } finally {
      setBusy(false);
    }
  };

  const waitForSameNumber =
    phone.replace(/\D/g, '').length === 10 &&
    phone.replace(/\D/g, '') === lastSentTo
      ? resendIn
      : 0;

  if (step === 'done') {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingShell
          variant="panel"
          title="Number Verified!"
          subtitle="Your mobile number has been verified successfully."
          loading
          loadingLabel="Opening your coach dashboard…"
        >
          {null}
        </OnboardingShell>
      </>
    );
  }

  if (step === 'otp') {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingShell
          variant="panel"
          title="Add Your Mobile Number"
          subtitle="Add your mobile number so we can reach you about classes, schedule changes, and emergencies.">
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <SymbolView
                name={{ ios: 'bubble.left.fill', android: 'chat', web: 'chat' }}
                tintColor={Brand.navy}
                size={16}
              />
              <Text style={styles.fieldLabel}>
                Enter OTP sent to <Text style={styles.bold}>{phone}</Text>
              </Text>
            </View>
            <TextInput
              value={otp}
              onChangeText={(v) => {
                setOtp(v.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="6-digit code"
              placeholderTextColor={Brand.muted}
              style={styles.otpInput}
              editable={!busy}
              accessibilityLabel="OTP code"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
            />
            <Text style={styles.helper}>Code expires in 10 minutes.</Text>
          </View>

          <FieldError message={error} />

          <View style={styles.otpActions}>
            <Pressable
              onPress={() => void verifyOtp()}
              disabled={busy || otp.length !== 6}
              style={({ pressed }) => [
                styles.verifyBtn,
                (busy || otp.length !== 6) && styles.btnDisabled,
                pressed && otp.length === 6 && !busy ? styles.btnPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Verify OTP">
              <Text style={styles.verifyBtnText}>{busy ? 'Verifying…' : 'Verify OTP'}</Text>
            </Pressable>

            <Pressable
              onPress={() => void resendOtp()}
              disabled={busy || resendIn > 0}
              style={({ pressed }) => [
                styles.resendBtn,
                (busy || resendIn > 0) && styles.resendBtnDisabled,
                pressed && resendIn === 0 && !busy ? styles.btnPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={resendIn > 0 ? `Resend in ${resendIn} seconds` : 'Resend OTP'}>
              <Text style={[styles.resendBtnText, resendIn > 0 ? styles.resendBtnTextMuted : null]}>
                {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              setStep('phone');
              setError(null);
              setOtp('');
            }}
            style={styles.changeNumberBtn}
            accessibilityRole="button"
            accessibilityLabel="Change number">
            <Text style={styles.changeNumber}>← Change number</Text>
          </Pressable>
        </OnboardingShell>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <OnboardingShell
        variant="panel"
        title="Add Your Mobile Number"
        subtitle="Add your mobile number so we can reach you about classes, schedule changes, and emergencies."
        loading={bootLoading}
        loadingLabel="Loading…">
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <SymbolView
              name={{ ios: 'phone.fill', android: 'call', web: 'call' }}
              tintColor={Brand.navy}
              size={16}
            />
            <Text style={styles.fieldLabel}>Mobile Number</Text>
          </View>
          <TextInput
            value={phone}
            onChangeText={(v) => {
              setPhone(v.replace(/\D/g, '').slice(0, 10));
              setError(null);
            }}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="Enter mobile number"
            placeholderTextColor={Brand.muted}
            style={styles.phoneInput}
            editable={!busy}
            accessibilityLabel="Mobile number"
          />
          <Text style={styles.helper}>Format: 10 digits (e.g., 9876543210)</Text>
        </View>

        <FieldError message={error} />

        <PrimaryPillButton
          label={
            busy
              ? 'Sending OTP…'
              : waitForSameNumber > 0
                ? `Send OTP in ${waitForSameNumber}s`
                : 'Send OTP'
          }
          onPress={() => void sendOtp()}
          disabled={phone.length !== 10 || waitForSameNumber > 0}
          busy={busy}
        />
      </OnboardingShell>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  phoneInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    paddingHorizontal: 14,
    fontSize: 17,
    fontWeight: '600',
    color: Brand.navy,
  },
  otpInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    paddingHorizontal: 14,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 6,
    color: Brand.navy,
  },
  helper: {
    color: Brand.subtitle,
    fontSize: 12,
  },
  bold: {
    fontWeight: '800',
    color: Brand.navy,
  },
  otpActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  verifyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  verifyBtnText: {
    color: Brand.white,
    fontSize: 15,
    fontWeight: '800',
  },
  resendBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  resendBtnDisabled: {
    borderColor: '#F6D98A',
  },
  resendBtnText: {
    color: Brand.gold,
    fontSize: 15,
    fontWeight: '800',
  },
  resendBtnTextMuted: {
    color: '#E8C56A',
  },
  btnDisabled: {
    opacity: 0.55,
  },
  btnPressed: {
    opacity: 0.88,
  },
  changeNumberBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  changeNumber: {
    color: Brand.subtitle,
    fontSize: 14,
    fontWeight: '600',
  },
});
