import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Preloader } from './src/components/Preloader';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/constants/theme';
import { OnboardingTourProvider } from './src/onboarding/OnboardingTourProvider';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    primary: theme.colors.primary,
    text: theme.colors.text,
  },
};

export default function App() {
  const [showPreloader, setShowPreloader] = useState(true);
  const handlePreloaderDone = useCallback(() => setShowPreloader(false), []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
      {showPreloader ? (
        <Preloader onDone={handlePreloaderDone} />
      ) : (
        <NavigationContainer theme={navigationTheme}>
          <OnboardingTourProvider>
            <RootNavigator />
          </OnboardingTourProvider>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}
