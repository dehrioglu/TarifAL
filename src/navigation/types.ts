import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  AddRecipe: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  WelcomeOnboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  RecipeDetail: { recipeId: string };
  SmartBasket: { recipeId?: string } | undefined;
};
