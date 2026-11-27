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

import { RegisterForm, type RegisterFormValues } from '@/components/register/register-form';
import { useToast } from '@/components/ui/app-toast';
import { Brand, LoginLayout } from '@/constants/brand';
import { ApiError } from '@/features/auth/types';
import { getHomeHrefForRole, useAuth } from '@/features/auth/session';
import { alreadyRegisteredMessage, studentAccountCreatedMessage } from '@/utils/auth-messages';

const TERMS_URL = 'https://chessvanguard.com/terms-conditions/';
const PRIVACY_URL = 'https://chessvanguard.com/privacy-policy/';

export default function RegisterStudentScreen() {
  const { registerStudent, logout } = useAuth();
  const { showSuccess } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const session = await registerStudent(values);
      const home = getHomeHrefForRole(session.user.role);
      if (!home) {
        await logout();
        throw new Error(
          'This account role is not supported in the mobile app. Please use the web portal.',
        );
      }
      showSuccess(studentAccountCreatedMessage(session.user));
      router.replace(home);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(alreadyRegisteredMessage(error.message, 'student'));
      }
      throw error;
    } finally {
      setLoading(false);
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
                <Text style={styles.subtitle}>Create an account to get started</Text>
              </View>

              <RegisterForm
                loading={loading}
                onSubmit={handleSubmit}
                onLoginPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/');
                  }
                }}
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
