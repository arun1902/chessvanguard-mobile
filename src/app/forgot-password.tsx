import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, LoginLayout } from '@/constants/brand';
import { ApiError } from '@/features/auth/types';
import { authApi } from '@/services/api/auth.api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const close = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  const validate = () => {
    const next = email.trim();
    if (!next) {
      setEmailError('Email is required.');
      return false;
    }
    if (!EMAIL_PATTERN.test(next)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unable to send reset link. Please try again.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Pressable style={styles.backdrop} onPress={close} accessibilityRole="button" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <View style={styles.card} accessibilityRole="summary">
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <View style={styles.keyBadge}>
                    <SymbolView
                      name={{ ios: 'key.fill', android: 'key', web: 'key' }}
                      size={18}
                      tintColor={Brand.gold}
                    />
                  </View>
                  <Text style={styles.title}>Forgot Password</Text>
                  <Pressable
                    onPress={close}
                    style={styles.closeButton}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Close">
                    <SymbolView
                      name={{ ios: 'xmark', android: 'close', web: 'close' }}
                      size={16}
                      tintColor={Brand.navySoft}
                    />
                  </Pressable>
                </View>
                <Text style={styles.description}>
                  Enter your email address and we&apos;ll send you a secure link to reset your
                  password.
                </Text>
              </View>

              <View style={styles.divider} />

              {sent ? (
                <View style={styles.successBlock}>
                  <View style={styles.successIcon}>
                    <SymbolView
                      name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                      size={28}
                      tintColor="#15803D"
                    />
                  </View>
                  <Text style={styles.successTitle}>Check your email</Text>
                  <Text style={styles.successBody}>
                    If an account exists for {email.trim()}, you&apos;ll receive a password reset
                    link shortly.
                  </Text>
                  <Pressable
                    onPress={close}
                    style={({ pressed }) => [
                      styles.backButton,
                      pressed ? styles.primaryButtonPressed : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Back to sign in">
                    <Text style={styles.backButtonText} numberOfLines={1}>
                      Back to Sign In
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Registered Email</Text>
                    <View style={[styles.inputShell, emailError ? styles.inputShellError : null]}>
                      <SymbolView
                        name={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
                        size={16}
                        tintColor={Brand.icon}
                        style={styles.leadingIcon}
                      />
                      <TextInput
                        value={email}
                        onChangeText={(value) => {
                          setEmail(value);
                          if (emailError) setEmailError(null);
                          if (formError) setFormError(null);
                        }}
                        placeholder="your@email.com"
                        placeholderTextColor={Brand.muted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        editable={!loading}
                        style={styles.input}
                        accessibilityLabel="Registered Email"
                        onSubmitEditing={() => {
                          void handleSubmit();
                        }}
                        returnKeyType="send"
                      />
                    </View>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                  </View>

                  {formError ? <Text style={styles.formError}>{formError}</Text> : null}

                  <Pressable
                    onPress={() => {
                      void handleSubmit();
                    }}
                    disabled={loading}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && !loading ? styles.primaryButtonPressed : null,
                      loading ? styles.primaryButtonDisabled : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Send Reset Link"
                    accessibilityState={{ disabled: loading, busy: loading }}>
                    {loading ? (
                      <ActivityIndicator color={Brand.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: LoginLayout.horizontalPadding,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: LoginLayout.maxCardWidth,
    alignSelf: 'center',
    backgroundColor: Brand.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Brand.border,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  keyBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: Brand.navy,
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.inputBackground,
  },
  description: {
    color: Brand.navySoft,
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Brand.border,
  },
  form: {
    padding: 18,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  inputShell: {
    minHeight: LoginLayout.inputHeight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.inputBorder,
    backgroundColor: Brand.white,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputShellError: {
    borderColor: Brand.error,
  },
  leadingIcon: {
    marginTop: 1,
  },
  input: {
    flex: 1,
    color: Brand.navy,
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  errorText: {
    color: Brand.error,
    fontSize: 12,
    fontWeight: '600',
  },
  formError: {
    color: Brand.error,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: LoginLayout.buttonHeight,
    borderRadius: 12,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '800',
    includeFontPadding: false,
    textAlign: 'center',
  },
  successBlock: {
    padding: 18,
    gap: 10,
    alignItems: 'stretch',
  },
  successIcon: {
    marginBottom: 2,
    alignSelf: 'center',
  },
  successTitle: {
    color: Brand.navy,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  successBody: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 6,
  },
  backButton: {
    minHeight: LoginLayout.buttonHeight,
    borderRadius: 12,
    backgroundColor: Brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    width: '100%',
  },
  backButtonText: {
    color: Brand.white,
    fontSize: 15,
    fontWeight: '800',
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});
