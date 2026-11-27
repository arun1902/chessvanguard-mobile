import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginForm, type LoginFormValues } from '@/components/login/login-form';
import { useToast } from '@/components/ui/app-toast';
import { Brand, LoginLayout } from '@/constants/brand';
import { ApiError } from '@/features/auth/types';
import { getHomeHrefForRole, useAuth } from '@/features/auth/session';
import { welcomeBackMessage } from '@/utils/auth-messages';

export default function LoginScreen() {
  const { login, logout, isLoading, isAuthenticated, user } = useAuth();
  const { showSuccess } = useToast();
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={Brand.gold} />
      </View>
    );
  }

  if (isAuthenticated && user) {
    const home = getHomeHrefForRole(user.role);
    if (home) return <Redirect href={home} />;
  }

  const handleSubmit = async (values: LoginFormValues) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const session = await login(values);
      const home = getHomeHrefForRole(session.user.role);
      if (!home) {
        await logout();
        throw new Error(
          'This account role is not supported in the mobile app. Please use the web portal.',
        );
      }
      showSuccess(welcomeBackMessage(session.user));
      router.replace(home);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    } finally {
      setSubmitting(false);
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
                <Text style={styles.subtitle}>Welcome back – sign in to continue</Text>
              </View>

              <LoginForm
                loading={submitting}
                onSubmit={handleSubmit}
                onForgotPassword={() => router.push('/forgot-password')}
                onRegisterStudent={() => router.push('/register')}
                onJoinCoach={() => router.push('/join-coach')}
              />
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 20,
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
});
