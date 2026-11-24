import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CoachRegisterForm,
  type CoachRegisterFormValues,
} from '@/components/register/coach-register-form';
import { Brand, LoginLayout } from '@/constants/brand';
import { registerCoachRequest } from '@/services/auth';

const TERMS_URL = 'https://chessvanguard.com/terms-conditions/';
const PRIVACY_URL = 'https://chessvanguard.com/privacy-policy/';

export default function JoinCoachScreen() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CoachRegisterFormValues) => {
    setLoading(true);
    try {
      await registerCoachRequest(values);
      // Successful registration will continue into the app once the API is connected.
      router.replace('/coach/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const goToSignIn = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <View style={styles.content}>
              <View style={styles.header} accessibilityRole="header">
                <Image
                  source={require('@/assets/images/chessvanguard.png')}
                  style={styles.logo}
                  contentFit="contain"
                  accessibilityLabel="ChessVanguard"
                />
                <Text style={styles.subtitle}>
                  Apply to teach — it only takes a minute to get started
                </Text>
              </View>

              <CoachRegisterForm
                loading={loading}
                onSubmit={handleSubmit}
                onSignInPress={goToSignIn}
              />

              <Text style={styles.legal}>
                By creating an account, you agree to our{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() => Linking.openURL(TERMS_URL)}
                  accessibilityRole="link">
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.legalLink}
                  onPress={() => Linking.openURL(PRIVACY_URL)}
                  accessibilityRole="link">
                  Privacy Policy
                </Text>
              </Text>
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
    backgroundColor: Brand.page,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: LoginLayout.horizontalPadding,
    paddingVertical: 24,
  },
  content: {
    width: '100%',
    maxWidth: LoginLayout.maxCardWidth,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 16,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 224,
    height: LoginLayout.logoHeight,
  },
  subtitle: {
    color: Brand.subtitle,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  legal: {
    color: Brand.subtitle,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  legalLink: {
    textDecorationLine: 'underline',
    color: Brand.label,
    fontWeight: '500',
  },
});
