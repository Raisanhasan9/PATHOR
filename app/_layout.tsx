import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useAuthStore from "../store/authStore";

export default function RootLayout() {
  const loadSession = useAuthStore((s: any) => s.loadSession);

  useEffect(() => {
    loadSession();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(traveller)" />
        <Stack.Screen name="(guide)" />
      </Stack>
    </SafeAreaProvider>
  );
}
