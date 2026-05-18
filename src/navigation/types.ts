export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  RecipeDetail: { recipeId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  AddRecipe: undefined;
  Cart: undefined;
  Profile: undefined;
};
