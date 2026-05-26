import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  AddRecipe: undefined;
  Cart: { activeBasket?: 'market' | 'restaurant' } | undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  WelcomeOnboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  RecipeDetail: { recipeId: string; openCooking?: boolean; purchaseMode?: 'home' | 'market' | 'restaurant'; socialPostId?: string };
  SmartBasket: { recipeId?: string; ingredients?: string[]; startFrom?: 'intro' | 'servings' } | undefined;
  PantryVision: undefined;
  FamilyAccount: undefined;
  MarketCheckout: undefined;
  AiChefChat: undefined;
  InvestorDemo: undefined;
  SocialProfile: { userId: string };
  Activity: undefined;
  Search: undefined;
  CollectionDetail: { collectionId: string };
};
