import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Brand, LoginLayout } from '@/constants/brand';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export type RegisterFormValues = {
  email: string;
  password: string;
};

type RegisterFormProps = {
  loading?: boolean;
  onSubmit: (values: RegisterFormValues) => void | Promise<void>;
  onLoginPress: () => void;
};

export function RegisterForm({ loading = false, onSubmit, onLoginPress }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const validate = () => {
    const nextEmail = email.trim();
    let valid = true;

    if (!nextEmail) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!EMAIL_PATTERN.test(nextEmail)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      valid = false;
    } else {
      setPasswordError(null);
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    if (!validate()) return;

    try {
      await onSubmit({ email: email.trim(), password });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create account. Please try again.';
      setFormError(message);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.intro}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.description}>
          Register with your email and password to get started.
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
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
            }}
            placeholder="you@example.com"
            placeholderTextColor={Brand.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            editable={!loading}
            style={styles.input}
            accessibilityLabel="Email"
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <View style={[styles.inputShell, passwordError ? styles.inputShellError : null]}>
          <SymbolView
            name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
            size={16}
            tintColor={Brand.icon}
            style={styles.leadingIcon}
          />
          <TextInput
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (passwordError) setPasswordError(null);
            }}
            placeholder="At least 8 characters"
            placeholderTextColor={Brand.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!loading}
            style={styles.input}
            accessibilityLabel="Password"
          />
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && !loading ? styles.primaryButtonPressed : null,
          loading ? styles.primaryButtonDisabled : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Create Account"
        accessibilityState={{ disabled: loading, busy: loading }}>
        {loading ? (
          <ActivityIndicator color={Brand.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Create Account</Text>
        )}
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.loginPrompt}>
        Already have an account?{' '}
        <Text
          onPress={loading ? undefined : onLoginPress}
          style={styles.loginLink}
          accessibilityRole="link"
          accessibilityLabel="Login here">
          Login here
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: LoginLayout.maxCardWidth,
    backgroundColor: Brand.card,
    borderRadius: LoginLayout.cardRadius,
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  intro: {
    gap: 4,
  },
  title: {
    color: Brand.navy,
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    color: Brand.subtitle,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    color: Brand.label,
    fontSize: 14,
    fontWeight: '600',
  },
  inputShell: {
    minHeight: LoginLayout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.inputBackground,
    borderWidth: 1,
    borderColor: Brand.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputShellError: {
    borderColor: Brand.error,
  },
  leadingIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: LoginLayout.inputHeight,
    color: Brand.navy,
    fontSize: 15,
    paddingVertical: 10,
  },
  errorText: {
    color: Brand.error,
    fontSize: 12,
    fontWeight: '500',
  },
  formError: {
    color: Brand.error,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 4,
    height: LoginLayout.buttonHeight,
    borderRadius: 12,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: Brand.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Brand.border,
  },
  dividerText: {
    color: Brand.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  loginPrompt: {
    color: Brand.label,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  loginLink: {
    color: Brand.gold,
    fontWeight: '700',
  },
});
