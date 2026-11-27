import { Image } from 'expo-image';
import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, LoginLayout } from '@/constants/brand';

type OnboardingShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  /** `card` = centered branding + card. `panel` = left-aligned flat form (web action style). */
  variant?: 'card' | 'panel';
};

export function OnboardingShell({
  title,
  subtitle,
  children,
  footer,
  loading = false,
  loadingLabel = 'Please wait…',
  variant = 'card',
}: OnboardingShellProps) {
  const isPanel = variant === 'panel';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            contentContainerStyle={[styles.scroll, isPanel ? styles.scrollPanel : null]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <View style={[styles.inner, isPanel ? styles.innerPanel : null]}>
              {!isPanel ? (
                <Image
                  source={require('@/assets/images/chessvanguard.png')}
                  style={styles.logo}
                  contentFit="contain"
                  accessibilityLabel="ChessVanguard"
                />
              ) : null}
              <Text style={[styles.title, isPanel ? styles.titlePanel : null]}>{title}</Text>
              <Text style={[styles.subtitle, isPanel ? styles.subtitlePanel : null]}>{subtitle}</Text>

              {loading ? (
                <View style={[styles.loadingBox, isPanel ? styles.loadingPanel : null]}>
                  <ActivityIndicator color={Brand.gold} size="large" />
                  <Text style={styles.loadingText}>{loadingLabel}</Text>
                </View>
              ) : (
                <View style={isPanel ? styles.panelBody : styles.card}>{children}</View>
              )}

              {footer}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type PrimaryPillButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
};

export function PrimaryPillButton({ label, onPress, disabled, busy }: PrimaryPillButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.pill,
        (disabled || busy) && styles.pillDisabled,
        pressed && !disabled && !busy ? styles.pillPressed : null,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || busy) }}>
      {busy ? <ActivityIndicator color={Brand.white} /> : <Text style={styles.pillText}>{label}</Text>}
    </Pressable>
  );
}

export function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <View style={styles.infoBanner}>
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Text style={styles.errorText}>{message}</Text>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.page,
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
    paddingVertical: 28,
  },
  scrollPanel: {
    justifyContent: 'flex-start',
    paddingTop: 36,
  },
  inner: {
    width: '100%',
    maxWidth: LoginLayout.maxCardWidth,
    alignSelf: 'center',
    gap: 14,
  },
  innerPanel: {
    maxWidth: 520,
    gap: 18,
  },
  logo: {
    height: 48,
    width: 180,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    color: Brand.navy,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  titlePanel: {
    textAlign: 'left',
    fontSize: 28,
  },
  subtitle: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitlePanel: {
    textAlign: 'left',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Brand.card,
    borderRadius: 18,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    shadowColor: Brand.navy,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  panelBody: {
    gap: 18,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
    backgroundColor: Brand.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  loadingPanel: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  loadingText: {
    color: Brand.subtitle,
    fontSize: 14,
  },
  pill: {
    height: LoginLayout.buttonHeight + 2,
    borderRadius: LoginLayout.pillRadius,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  pillPressed: {
    opacity: 0.9,
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillText: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '800',
  },
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    color: '#1E3A8A',
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    color: Brand.error,
    fontSize: 13,
    fontWeight: '600',
  },
});
