import { Stack } from 'expo-router';

export default function PesagemLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="nova" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
