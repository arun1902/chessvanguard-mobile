import { Image } from 'expo-image';
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

import { LoginForm, type LoginFormValues } from '@/components/login/login-form';
import { Brand, LoginLayout } from '@/constants/brand';
import { loginRequest } from '@/services/auth';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await loginRequest(values);
      // Successful auth will navigate into the app once the API is connected.
      router.replace('/dashboard');
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
                <Text style={styles.subtitle}>Welcome back – sign in to continue</Text>
              </View>

              <LoginForm
                loading={loading}
                onSubmit={handleSubmit}
                onForgotPassword={() => router.push('/forgot-password')}
                onRegisterStudent={() => router.push('/register')}
                onJoinCoach={() => router.push('/join-coach')}
              />

              {__DEV__ ? (
                <View style={styles.devLinks}>
                  <Text
                    onPress={() => router.push('/dashboard')}
                    style={styles.devLink}
                    accessibilityRole="link">
                    Preview student dashboard
                  </Text>
                  <Text
                    onPress={() => router.push('/coach/dashboard')}
                    style={styles.devLink}
                    accessibilityRole="link">
                    Preview coach dashboard
                  </Text>
                </View>
              ) : null}
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
  devLinks: {
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
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
  devLink: {
    marginTop: 4,
    color: Brand.gold,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
