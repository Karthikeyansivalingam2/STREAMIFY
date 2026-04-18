import { Stack } from "expo-router";
import { PlayerProvider } from "../context/PlayerContext";
import { LibraryProvider } from "../context/LibraryContext";

export default function RootLayout() {
  return (
    <LibraryProvider>
      <PlayerProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PlayerProvider>
    </LibraryProvider>
  );
}