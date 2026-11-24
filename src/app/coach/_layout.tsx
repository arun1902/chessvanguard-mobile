import { Stack } from 'expo-router';

export default function CoachLayout() {
  return (
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
  );
}
