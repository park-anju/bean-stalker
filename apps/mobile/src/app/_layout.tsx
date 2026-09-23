import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { LocationProvider } from '@/location/LocationProvider';
import { queryClient } from '@/query-client';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <LocationProvider>
          <AppTabs />
        </LocationProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
