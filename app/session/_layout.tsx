import { Stack } from 'expo-router';

export default function SessionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="active" />
      <Stack.Screen name="complete" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
