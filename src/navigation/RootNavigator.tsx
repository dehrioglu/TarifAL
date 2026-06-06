import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { theme } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { ActivityScreen } from '../screens/main/ActivityScreen';
import { AdminPanelScreen } from '../screens/main/AdminPanelScreen';
import { AiChefChatScreen } from '../screens/main/AiChefChatScreen';
import { CollectionDetailScreen } from '../screens/main/CollectionDetailScreen';
import { FamilyAccountScreen } from '../screens/main/FamilyAccountScreen';
import { MarketCheckoutScreen } from '../screens/main/MarketCheckoutScreen';
import { PantryVisionScreen } from '../screens/main/PantryVisionScreen';
import { RecipeDetailScreen } from '../screens/main/RecipeDetailScreen';
import { SearchScreen } from '../screens/main/SearchScreen';
import { SmartBasketScreen } from '../screens/main/SmartBasketScreen';
import { InvestorDemoFlowScreen } from '../screens/main/InvestorDemoFlowScreen';
import { SocialProfileScreen } from '../screens/main/SocialProfileScreen';
import { WelcomeOnboardingScreen } from '../screens/onboarding/WelcomeOnboardingScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const authInitialized = useAppStore((store) => store.authInitialized);
  const initializeAuthSession = useAppStore((store) => store.initializeAuthSession);
  const needsWelcomeOnboarding = useAppStore((store) => store.needsWelcomeOnboarding);

  useEffect(() => initializeAuthSession(), [initializeAuthSession]);

  if (!authInitialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Hesap durumu hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {needsWelcomeOnboarding ? (
        <Stack.Screen name="WelcomeOnboarding" component={WelcomeOnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
          <Stack.Screen name="SmartBasket" component={SmartBasketScreen} />
          <Stack.Screen name="PantryVision" component={PantryVisionScreen} />
          <Stack.Screen name="FamilyAccount" component={FamilyAccountScreen} />
          <Stack.Screen name="MarketCheckout" component={MarketCheckoutScreen} />
          <Stack.Screen name="AiChefChat" component={AiChefChatScreen} />
          <Stack.Screen name="InvestorDemo" component={InvestorDemoFlowScreen} />
          <Stack.Screen name="SocialProfile" component={SocialProfileScreen} />
          <Stack.Screen name="Activity" component={ActivityScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
});
