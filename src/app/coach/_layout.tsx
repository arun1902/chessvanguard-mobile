import { Stack } from 'expo-router';

import { RequireAuth } from '@/features/auth/require-auth';
import { useNotificationWatcher } from '@/hooks/use-notification-watcher';

function CoachNotificationWatcher() {
  useNotificationWatcher(true, 15_000);
  return null;
}

export default function CoachLayout() {
  return (
    <RequireAuth allowedRoles={['Coach']}>
      <CoachNotificationWatcher />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="students" />
        <Stack.Screen name="puzzles" />
        <Stack.Screen name="classes" />
        <Stack.Screen name="tournament" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="support" />
        <Stack.Screen name="notifications" />
      </Stack>
    </RequireAuth>
  );
}
