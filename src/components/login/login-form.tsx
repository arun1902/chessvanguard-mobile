import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Brand, LoginLayout } from '@/constants/brand';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginFormValues = {
  email: string;
  password: string;
};

type LoginFormProps = {
  loading?: boolean;
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  onForgotPassword: () => void;
  onRegisterStudent: () => void;
  onJoinCoach: () => void;
};

export function LoginForm({
  loading = false,
  onSubmit,
  onForgotPassword,
  onRegisterStudent,
  onJoinCoach,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
      setFormError(message);
    }
  };

  return (
    <View style={styles.card}>
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
        <View style={styles.passwordHeader}>
          <Text style={styles.label}>Password</Text>
          <Pressable
            onPress={onForgotPassword}
            hitSlop={8}
            accessibilityRole="link"
            accessibilityLabel="Forgot password"
            disabled={loading}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </Pressable>
        </View>
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
            placeholder="Enter your password"
            placeholderTextColor={Brand.muted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            editable={!loading}
            style={styles.input}
            accessibilityLabel="Password"
            {...passwordInputExtras}
          />
          <Pressable
            onPress={() => setShowPassword((value) => !value)}
            hitSlop={10}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
            <SymbolView
              name={
                showPassword
                  ? { ios: 'eye.slash.fill', android: 'visibility_off', web: 'visibility_off' }
                  : { ios: 'eye.fill', android: 'visibility', web: 'visibility' }
              }
              size={18}
              tintColor={Brand.icon}
            />
          </Pressable>
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
        accessibilityLabel="Sign In"
        accessibilityState={{ disabled: loading, busy: loading }}>
        {loading ? (
          <ActivityIndicator color={Brand.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Sign In</Text>
        )}
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.secondaryActions}>
        <OutlineActionButton
          label="New Student? Register here"
          onPress={onRegisterStudent}
          disabled={loading}
        />
        <OutlineActionButton label="Join as Coach" onPress={onJoinCoach} disabled={loading} />
      </View>
    </View>
  );
}

type OutlineActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function OutlineActionButton({ label, onPress, disabled }: OutlineActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.outlineButton,
        pressed && !disabled ? styles.outlineButtonPressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <SymbolView
        name={{ ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }}
        size={16}
        tintColor={Brand.navySoft}
      />
      <Text style={styles.outlineButtonText}>{label}</Text>
    </Pressable>
  );
}

const passwordInputExtras: Partial<TextInputProps> = {
  // Avoid password managers injecting UI that shifts layout on Android emulators.
  importantForAutofill: 'yes',
};

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
  field: {
    gap: 6,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  label: {
    color: Brand.label,
    fontSize: 14,
    fontWeight: '600',
  },
  forgotLink: {
    color: Brand.gold,
    fontSize: 12,
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
  eyeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
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
    borderRadius: LoginLayout.pillRadius,
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
  secondaryActions: {
    gap: 10,
  },
  outlineButton: {
    minHeight: 44,
    borderRadius: LoginLayout.pillRadius,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  outlineButtonPressed: {
    backgroundColor: Brand.inputBackground,
  },
  outlineButtonText: {
    color: Brand.navySoft,
    fontSize: 14,
    fontWeight: '600',
  },
});
