import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';

export default function RootLayout() {
  const NeonDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#0A0A0F',
      card: '#0F0F16',
      text: '#FFFFFF',
      border: '#1E1E28',
      primary: '#00F0FF', // Cyberpunk neon cyan
    },
  };

  return (
    <ThemeProvider value={NeonDarkTheme}>
      <Stack screenOptions={{ headerShown: false, navigationBarColor: '#0A0A0F' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="booking/success" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
