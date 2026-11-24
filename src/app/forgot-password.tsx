import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';

export default function ForgotPasswordScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Forgot password</Text>
        <Text style={styles.body}>
          Password reset will connect to the ChessVanguard API in a later update.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Back to sign in">
          <Text style={styles.buttonText}>Back to Sign In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.page,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    color: Brand.navy,
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    color: Brand.subtitle,
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
    height: 46,
    borderRadius: 999,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Brand.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
