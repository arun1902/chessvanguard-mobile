import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  FieldError,
  InfoBanner,
  OnboardingShell,
  PrimaryPillButton,
} from '@/components/onboarding/onboarding-shell';
import { useToast } from '@/components/ui/app-toast';
import { Brand } from '@/constants/brand';
import { getHomeHrefForRole, useAuth } from '@/features/auth/session';
import { api, ApiError } from '@/services/api';

const EMAIL_PURPOSE = 'email-verification-builtin';
const RESEND_SECONDS = 60;

export default function VerifyEmailScreen() {
  const { user, token, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [done, setDone] = useState(false);
  const sentOnce = useRef(false);

  const email = user?.email?.trim() || '';

  const goNext = useCallback(() => {
    router.replace('/verify-mobile');
  }, []);

  const sendCode = useCallback(async () => {
    if (!email) return;
    setSending(true);
    setError(null);
    setOtp('');
    try {
      await api.userVerification.send({
        type: 'EMAIL',
        target: email,
        purpose: EMAIL_PURPOSE,
      });
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send verification code.');
    } finally {
      setSending(false);
    }
  }, [email]);

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
    if (!email || sentOnce.current) return;
    sentOnce.current = true;
    void sendCode();
  }, [authLoading, email, sendCode, token, user]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((v) => (v <= 1 ? 0 : v - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const handleVerify = async () => {
    const code = otp.replace(/\D/g, '');
    if (code.length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      await api.userVerification.confirm({
        type: 'EMAIL',
        target: email,
        otp: code,
      });
      setDone(true);
      showSuccess('Email verified!');
      setTimeout(goNext, 900);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Invalid verification code.';
      setError(message);
      showError(message);
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  if (done) {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingShell
          title="Email Verified!"
          subtitle="Your email has been verified. Next, add your mobile number."
          loading
          loadingLabel="Continuing…"
        >
          {null}
        </OnboardingShell>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <OnboardingShell
        title="Verify Your Email"
        subtitle="Please verify your email address to continue"
        loading={sending && !error}
        loadingLabel="Sending verification code…">
        <View style={styles.emailCard}>
          <View style={styles.emailIcon}>
            <SymbolView
              name={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
              tintColor={Brand.subtitle}
              size={20}
            />
          </View>
          <View style={styles.emailCopy}>
            <Text style={styles.emailLabel}>Email to verify</Text>
            <Text style={styles.emailValue} numberOfLines={2}>
              {email || '—'}
            </Text>
          </View>
        </View>

        <InfoBanner>
          {"We've sent a 6-digit verification code to "}
          <Text style={styles.bold}>{email}</Text>
          {'. Please enter it below.'}
        </InfoBanner>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Verification Code</Text>
          <TextInput
            value={otp}
            onChangeText={(v) => {
              setOtp(v.replace(/\D/g, '').slice(0, 6));
              setError(null);
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="••••••"
            placeholderTextColor={Brand.muted}
            style={styles.otpInput}
            editable={!verifying}
            accessibilityLabel="Verification code"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
          />
        </View>

        <FieldError message={error} />

        <View style={styles.resendBlock}>
          <Text style={styles.resendHint}>{"Didn't receive the code?"}</Text>
          <Pressable
            onPress={() => void sendCode()}
            disabled={resendIn > 0 || sending || verifying}
            accessibilityRole="button"
            accessibilityState={{ disabled: resendIn > 0 }}>
            <Text style={[styles.resendLink, resendIn > 0 ? styles.resendMuted : null]}>
              {sending ? 'Sending…' : resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
            </Text>
          </Pressable>
        </View>

        <PrimaryPillButton
          label={verifying ? 'Verifying…' : 'Verify Email'}
          onPress={() => void handleVerify()}
          disabled={otp.length !== 6}
          busy={verifying}
        />
      </OnboardingShell>
    </>
  );
}

const styles = StyleSheet.create({
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.inputBackground,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    padding: 14,
  },
  emailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.border,
  },
  emailCopy: {
    flex: 1,
    gap: 2,
  },
  emailLabel: {
    color: Brand.subtitle,
    fontSize: 11,
    fontWeight: '600',
  },
  emailValue: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  bold: {
    fontWeight: '800',
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  otpInput: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 10,
    color: Brand.navy,
  },
  resendBlock: {
    alignItems: 'center',
    gap: 4,
  },
  resendHint: {
    color: Brand.subtitle,
    fontSize: 13,
  },
  resendLink: {
    color: Brand.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  resendMuted: {
    color: Brand.muted,
  },
});
