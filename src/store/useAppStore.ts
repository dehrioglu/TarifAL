import { create } from 'zustand';

import { demoFamilyAccount } from '../data/demoFamily';
import { normalizeBetaCode, validBetaCodes } from '../data/betaConfig';
import { mockSocialComments, mockSocialRecipes } from '../data/mockSocial';
import { mockSocialFeedExtras } from '../data/mockSocialPosts';
import { mockTriedRecipes } from '../data/mockTriedRecipes';
import { demoSmartBasketMarket, smartBasketBudgetModes } from '../data/demoSmartBasket';
import { demoRecipes } from '../data/demoRecipes';
import { onboardingStorage } from '../onboarding/onboardingStorage';
import { trackEvent } from '../services/analyticsService';
import {
  DEMO_USER,
  signInWithEmail,
  registerWithEmail,
  signOutUser,
  subscribeToAuthState,
} from '../services/authService';
import { fetchUserCart, replaceUserCart } from '../services/cartService';
import { fetchUserFavorites, setUserFavorite } from '../services/favoriteService';
import {
  fetchUserOrders,
  saveOrder,
} from '../services/firestoreService';
import { fetchRemoteRecipes, saveUserRecipe } from '../services/recipeService';
import { ensureUserProfile, fetchUserProfile, joinBetaProgram as saveBetaProgram } from '../services/userService';
import {
  AccountMode,
  AiSuggestion,
  AppUser,
  CartItem,
  FavoriteListType,
  FamilyAccountState,
  FamilyShoppingItem,
  Ingredient,
  MarketAlternative,
  NewRecipePayload,
  Order,
  PlaceOrderOptions,
  Recipe,
  RestaurantCartItem,
  RestaurantOption,
  SocialComment,
  SocialRecipePost,
  SocialPostStats,
  SponsoredPlacementType,
  SponsoredProduct,
  SmartBasketFlowState,
  SmartBasketInput,
  SmartBasketPlan,
  TriedRecipePost,
  UserGoal,
} from '../types';
import {
  getRecipeCost,
  getRecipeMatch,
  getRecipeSuitabilityScore,
  parsePantryText,
} from '../utils/recipeMatching';

type AppState = {
  user: AppUser | null;
  profile: AppUser | null;
  accountMode: AccountMode;
  authInitialized: boolean;
  authLoading: boolean;
  recipes: Recipe[];
  likes: Record<string, boolean>;
  cart: CartItem[];
  restaurantCart: RestaurantCartItem[];
  orders: Order[];
  dataLoading: boolean;
  dataError?: string;
  pendingFavoriteIds: Record<string, boolean>;
  pantryText: string;
  userGoal: UserGoal;
  recipeLists: Record<FavoriteListType, string[]>;
  socialLikes: Record<string, boolean>;
  socialSaves: Record<string, boolean>;
  followedUsers: Record<string, boolean>;
  socialComments: Record<string, SocialComment[]>;
  socialPostStats: Record<string, SocialPostStats>;
  socialPosts: SocialRecipePost[];
  socialPollVotes: Record<string, string>;
  socialPollOptionVotes: Record<string, Record<string, number>>;
  joinedChallenges: Record<string, boolean>;
  commentLikes: Record<string, boolean>;
  triedRecipes: TriedRecipePost[];
  readNotifications: Record<string, boolean>;
  collectionSaves: Record<string, boolean>;
  familyAccount: FamilyAccountState;
  smartBasket: SmartBasketFlowState;
  hasSeenWelcomeOnboarding: boolean;
  needsWelcomeOnboarding: boolean;
  shouldStartGuidedTour: boolean;
  hasCompletedGuidedTour: boolean;
  hasSkippedGuidedTour: boolean;
  initializeAuthSession: () => () => void;
  openDemoMode: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  joinBetaProgram: (betaCode: string) => Promise<void>;
  loadRemoteData: (userId: string) => Promise<void>;
  completeWelcomeOnboarding: (startTour: boolean) => Promise<void>;
  consumePendingGuidedTour: () => void;
  markGuidedTourCompleted: () => Promise<void>;
  markGuidedTourSkipped: () => Promise<void>;
  requestGuidedTourReplay: () => Promise<void>;
  toggleLike: (recipeId: string) => void;
  setPantryText: (value: string) => void;
  setUserGoal: (goal: UserGoal) => void;
  toggleRecipeList: (list: FavoriteListType, recipeId: string) => void;
  toggleSocialLike: (postId: string) => void;
  toggleSocialSave: (postId: string) => void;
  toggleFollowUser: (userId: string) => void;
  addSocialComment: (postId: string, text: string) => void;
  toggleCommentLike: (commentId: string) => void;
  voteSocialPoll: (postId: string, optionId: string) => void;
  toggleChallengeJoin: (postId: string) => void;
  addTriedRecipe: (payload: Omit<TriedRecipePost, 'id' | 'userId' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (notificationIds: string[]) => void;
  toggleCollectionSave: (collectionId: string) => void;
  addFamilyShoppingItem: (item: Omit<FamilyShoppingItem, 'id' | 'checked'>) => void;
  toggleFamilyShoppingItem: (itemId: string) => void;
  removeFamilyShoppingItem: (itemId: string) => void;
  addFamilyListToCart: () => void;
  addIngredientToCart: (recipe: Recipe, ingredient: Ingredient, alternative?: MarketAlternative) => void;
  addSponsoredProductToCart: (
    product: SponsoredProduct,
    context?: { recipeId?: string; recipeTitle?: string; placementType?: SponsoredPlacementType },
  ) => void;
  addRestaurantMealToCart: (recipe: Recipe, restaurant: RestaurantOption) => void;
  addMissingIngredientsToCart: (recipeId: string, pantryText?: string) => void;
  addRecipeToCart: (recipeId: string) => void;
  createSmartBasketPlan: (input: SmartBasketInput) => SmartBasketPlan[];
  selectSmartBasketPlan: (planId: string) => void;
  addSmartBasketItemsToCart: (planId?: string) => void;
  resetSmartBasketFlow: () => void;
  completeSmartBasketDemo: () => void;
  incrementCartItem: (itemId: string) => void;
  decrementCartItem: (itemId: string) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;
  incrementRestaurantItem: (itemId: string) => void;
  decrementRestaurantItem: (itemId: string) => void;
  removeRestaurantItem: (itemId: string) => void;
  clearRestaurantCart: () => void;
  placeOrder: (address: string, options?: PlaceOrderOptions) => Promise<Order>;
  addRecipe: (payload: NewRecipePayload) => Promise<Recipe>;
  suggestRecipes: (pantryText: string) => AiSuggestion[];
};

const initialLikes = {
  'recipe-kunefe': true,
} satisfies Record<string, boolean>;

const initialSocialPostStats = mockSocialRecipes.reduce<Record<string, SocialPostStats>>(
  (acc, post) => {
    acc[post.id] = {
      likes: post.likes,
      commentsCount: post.commentsCount,
      saves: post.saves,
    };

    return acc;
  },
  {},
);

mockSocialFeedExtras.forEach((post) => {
  initialSocialPostStats[post.id] = {
    likes: post.likes,
    commentsCount: post.commentsCount,
    saves: post.saves,
  };
});

const initialPollOptionVotes = mockSocialFeedExtras.reduce<Record<string, Record<string, number>>>(
  (acc, post) => {
    if (post.pollOptions) {
      acc[post.id] = post.pollOptions.reduce<Record<string, number>>((optionAcc, option) => {
        optionAcc[option.id] = option.votes;
        return optionAcc;
      }, {});
    }

    return acc;
  },
  {},
);

const mergeSocialPosts = (persistedPosts?: SocialRecipePost[]) => {
  const postMap = new Map<string, SocialRecipePost>();

  mockSocialRecipes.forEach((post) => postMap.set(post.id, post));
  persistedPosts?.forEach((post) => postMap.set(post.id, post));

  return Array.from(postMap.values());
};

const mergeSocialComments = (persistedComments?: Record<string, SocialComment[]>) => ({
  ...mockSocialComments,
  ...(persistedComments ?? {}),
});

const mergeSocialPostStats = (persistedStats?: Record<string, SocialPostStats>) => ({
  ...initialSocialPostStats,
  ...(persistedStats ?? {}),
});

const mergePollOptionVotes = (persistedVotes?: Record<string, Record<string, number>>) => ({
  ...initialPollOptionVotes,
  ...(persistedVotes ?? {}),
});

const mergeRecipes = (remoteRecipes: Recipe[]) => {
  const recipes = new Map(demoRecipes.map((recipe) => [recipe.id, recipe]));

  remoteRecipes.forEach((recipe) => recipes.set(recipe.id, recipe));

  return Array.from(recipes.values());
};

const createCartItem = (
  recipe: Recipe,
  ingredient: Ingredient,
  alternative?: MarketAlternative,
): CartItem => ({
  id: `${recipe.id}_${ingredient.id}${alternative ? `_${alternative.id}` : ''}`,
  recipeId: recipe.id,
  recipeTitle: recipe.title,
  ingredientId: ingredient.id,
  name: alternative?.name ?? ingredient.name,
  gram: alternative?.gram ?? ingredient.gram,
  price: alternative?.price ?? ingredient.price,
  quantity: 1,
  selectedAlternative: alternative,
});

const scaleIngredientForServings = (ingredient: Ingredient, multiplier: number): Ingredient => ({
  ...ingredient,
  gram: Math.max(1, Math.round(ingredient.gram * multiplier)),
  price: Math.max(1, Math.round(ingredient.price * multiplier)),
});

const createSmartBasketPlanFromRecipe = (
  recipe: Recipe,
  input: SmartBasketInput,
  userGoal: UserGoal,
): SmartBasketPlan => {
  const budgetMode =
    smartBasketBudgetModes.find((mode) => mode.id === input.budgetModeId) ??
    smartBasketBudgetModes[1];
  const match = getRecipeMatch(recipe, input.ingredients);
  const multiplier = Math.max(1, input.servings) / Math.max(1, recipe.servings);
  const scaledMissing = match.missingIngredients.map((ingredient) =>
    scaleIngredientForServings(ingredient, multiplier),
  );
  const estimatedCost = Math.round(getRecipeCost(recipe) * multiplier);
  const missingTotal = scaledMissing.reduce((sum, ingredient) => sum + ingredient.price, 0);
  const budgetPenalty = budgetMode.limit && estimatedCost > budgetMode.limit ? 14 : 0;
  const suitabilityScore = Math.max(
    42,
    getRecipeSuitabilityScore(recipe, match.matchPercent, userGoal) - budgetPenalty,
  );

  return {
    id: `smart-${recipe.id}`,
    recipeId: recipe.id,
    recipeTitle: recipe.title,
    recipeImage: recipe.imageUrl,
    description: recipe.description,
    category: recipe.category,
    prepTime: recipe.prepTime,
    difficulty: recipe.difficulty,
    calories: recipe.calories,
    servings: input.servings,
    matchPercent: match.matchPercent,
    suitabilityScore,
    estimatedCost,
    perPersonCost: Math.round(estimatedCost / Math.max(1, input.servings)),
    missingIngredients: scaledMissing,
    matchedIngredients: match.matchedIngredients,
    missingTotal,
    estimatedCommission: Math.round(missingTotal * demoSmartBasketMarket.commissionRate),
    budgetModeId: budgetMode.id,
    budgetLabel: budgetMode.label,
  };
};

type PersistedDemoState = Pick<
  AppState,
  | 'likes'
  | 'cart'
  | 'restaurantCart'
  | 'orders'
  | 'userGoal'
  | 'recipeLists'
  | 'socialLikes'
  | 'socialSaves'
  | 'followedUsers'
  | 'socialComments'
  | 'socialPostStats'
  | 'socialPosts'
  | 'socialPollVotes'
  | 'socialPollOptionVotes'
  | 'joinedChallenges'
  | 'commentLikes'
  | 'triedRecipes'
  | 'readNotifications'
  | 'collectionSaves'
  | 'pantryText'
  | 'familyAccount'
>;

const storageKey = 'tarifal-demo-state';

const readPersistedDemoState = (): Partial<PersistedDemoState> => {
  try {
    if (typeof localStorage === 'undefined') {
      return {};
    }

    const raw = localStorage.getItem(storageKey);

    return raw ? (JSON.parse(raw) as Partial<PersistedDemoState>) : {};
  } catch {
    return {};
  }
};

const writePersistedDemoState = (state: PersistedDemoState) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  } catch {
    // Persistence is a demo enhancement; the app should keep working without it.
  }
};

const persistedDemoState = readPersistedDemoState();

const demoSessionData = () => {
  const persisted = readPersistedDemoState();

  return {
    likes: persisted.likes ?? initialLikes,
    cart: persisted.cart ?? [
      {
        id: 'recipe-kunefe_kunefe-kadayif',
        recipeId: 'recipe-kunefe',
        recipeTitle: 'Künefe',
        ingredientId: 'kunefe-kadayif',
        name: 'Tel kadayıf',
        gram: 250,
        price: 45,
        quantity: 1,
      },
    ],
    orders: persisted.orders ?? [],
    recipeLists: persisted.recipeLists ?? {
      favorites: ['recipe-kunefe'],
      cookLater: ['recipe-adana', 'recipe-mercimek'],
      cookedBefore: ['recipe-menemen'],
    },
  };
};

const cartSyncQueues = new Map<string, Promise<void>>();

const persistAccountCart = (state: AppState) => {
  if (state.accountMode !== 'account' || !state.user) {
    return;
  }

  const userId = state.user.id;
  const cart = state.cart;
  const previous = cartSyncQueues.get(userId) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(() => replaceUserCart(userId, cart));

  cartSyncQueues.set(userId, next);

  void next
    .then(() => {
      if (cartSyncQueues.get(userId) === next) {
        cartSyncQueues.delete(userId);
      }
    })
    .catch(() => {
      useAppStore.setState({
        dataError: 'Sepet buluta kaydedilemedi. Bağlantını kontrol edip tekrar deneyebilirsin.',
      });
    });
};

const getCartTotal = (cart: CartItem[]) =>
  Math.round(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));

const trackStoreEvent = (
  state: AppState,
  eventName: Parameters<typeof trackEvent>[0],
  payload: Parameters<typeof trackEvent>[1] = {},
) => {
  void trackEvent(eventName, {
    userId: state.user?.id,
    userEmail: state.user?.email,
    isDemoMode: state.accountMode === 'demo',
    ...payload,
  });
};

export const useAppStore = create<AppState>((set, get) => ({
  user: DEMO_USER,
  profile: DEMO_USER,
  accountMode: 'demo',
  authInitialized: false,
  authLoading: false,
  recipes: demoRecipes,
  likes: persistedDemoState.likes ?? initialLikes,
  dataLoading: false,
  dataError: undefined,
  pendingFavoriteIds: {},
  pantryText: persistedDemoState.pantryText ?? 'yumurta, domates, mercimek',
  userGoal: persistedDemoState.userGoal ?? 'Pratik yemek yapmak',
  recipeLists: persistedDemoState.recipeLists ?? {
    favorites: ['recipe-kunefe'],
    cookLater: ['recipe-adana', 'recipe-mercimek'],
    cookedBefore: ['recipe-menemen'],
  },
  socialLikes: persistedDemoState.socialLikes ?? {
    'post-mercimek-ayse': true,
  },
  socialSaves: persistedDemoState.socialSaves ?? {
    'post-tavuk-makarna-ogrenci': true,
  },
  followedUsers: persistedDemoState.followedUsers ?? {
    'user-ayse': true,
    'user-tarifal-bot': true,
  },
  socialComments: mergeSocialComments(persistedDemoState.socialComments),
  socialPostStats: mergeSocialPostStats(persistedDemoState.socialPostStats),
  socialPosts: mergeSocialPosts(persistedDemoState.socialPosts),
  socialPollVotes: persistedDemoState.socialPollVotes ?? {},
  socialPollOptionVotes: mergePollOptionVotes(persistedDemoState.socialPollOptionVotes),
  joinedChallenges: persistedDemoState.joinedChallenges ?? {},
  commentLikes: persistedDemoState.commentLikes ?? {},
  triedRecipes: persistedDemoState.triedRecipes ?? mockTriedRecipes,
  readNotifications: persistedDemoState.readNotifications ?? {},
  collectionSaves: persistedDemoState.collectionSaves ?? {},
  familyAccount: persistedDemoState.familyAccount ?? demoFamilyAccount,
  smartBasket: {
    input: null,
    plans: [],
  },
  cart: persistedDemoState.cart ?? [
    {
      id: 'recipe-kunefe_kunefe-kadayif',
      recipeId: 'recipe-kunefe',
      recipeTitle: 'Künefe',
      ingredientId: 'kunefe-kadayif',
      name: 'Tel kadayıf',
      gram: 250,
      price: 45,
      quantity: 1,
    },
  ],
  restaurantCart: persistedDemoState.restaurantCart ?? [],
  orders: persistedDemoState.orders ?? [],
  hasSeenWelcomeOnboarding: false,
  needsWelcomeOnboarding: false,
  shouldStartGuidedTour: false,
  hasCompletedGuidedTour: false,
  hasSkippedGuidedTour: false,

  initializeAuthSession: () =>
    subscribeToAuthState(async (firebaseUser) => {
      if (!firebaseUser) {
        const demo = demoSessionData();

        set({
          user: DEMO_USER,
          profile: DEMO_USER,
          accountMode: 'demo',
          authInitialized: true,
          authLoading: false,
          dataLoading: false,
          dataError: undefined,
          recipes: demoRecipes,
          likes: demo.likes,
          cart: demo.cart,
          orders: demo.orders,
          recipeLists: demo.recipeLists,
          needsWelcomeOnboarding: false,
          shouldStartGuidedTour: false,
        });
        void trackEvent('demo_mode_used', {
          userId: DEMO_USER.id,
          userEmail: DEMO_USER.email,
          isDemoMode: true,
          sourceScreen: 'app_start',
        });
        return;
      }

      const onboarding = await onboardingStorage.getSnapshot(firebaseUser.id);

      set({
        user: firebaseUser,
        profile: firebaseUser,
        accountMode: 'account',
        authInitialized: true,
        authLoading: false,
        hasSeenWelcomeOnboarding: onboarding.hasSeenWelcomeOnboarding,
        shouldStartGuidedTour: false,
        hasCompletedGuidedTour: onboarding.hasCompletedGuidedTour,
        hasSkippedGuidedTour: onboarding.hasSkippedGuidedTour,
      });
      void trackEvent('real_account_used', {
        userId: firebaseUser.id,
        userEmail: firebaseUser.email,
        isDemoMode: false,
        sourceScreen: 'app_start',
      });

      try {
        const profile = await ensureUserProfile(firebaseUser);

        set({
          user: profile,
          profile,
          dataError: undefined,
        });
        await get().loadRemoteData(firebaseUser.id);
      } catch {
        set({
          dataLoading: false,
          dataError: 'Hesap verileri yüklenemedi. Yerel içerikler kullanılmaya devam ediyor.',
        });
      }
    }),

  openDemoMode: () => {
    const demo = demoSessionData();

    set({
      user: DEMO_USER,
      profile: DEMO_USER,
      accountMode: 'demo',
      authInitialized: true,
      authLoading: false,
      dataLoading: false,
      dataError: undefined,
      recipes: demoRecipes,
      likes: demo.likes,
      cart: demo.cart,
      orders: demo.orders,
      recipeLists: demo.recipeLists,
      needsWelcomeOnboarding: false,
      shouldStartGuidedTour: false,
    });
    void trackEvent('demo_mode_used', {
      userId: DEMO_USER.id,
      userEmail: DEMO_USER.email,
      isDemoMode: true,
      sourceScreen: 'login',
    });
  },

  signIn: async (email, password) => {
    set({ authLoading: true });
    try {
      const user = await signInWithEmail(email.trim(), password);
      const profile = user.isDemo ? user : await ensureUserProfile(user);
      const onboarding = await onboardingStorage.getSnapshot(profile.id);
      set({
        user: profile,
        profile,
        accountMode: profile.isDemo ? 'demo' : 'account',
        authInitialized: true,
        authLoading: false,
        hasSeenWelcomeOnboarding: onboarding.hasSeenWelcomeOnboarding,
        needsWelcomeOnboarding: false,
        shouldStartGuidedTour: false,
        hasCompletedGuidedTour: onboarding.hasCompletedGuidedTour,
        hasSkippedGuidedTour: onboarding.hasSkippedGuidedTour,
      });
      trackStoreEvent(get(), profile.isDemo ? 'demo_mode_used' : 'user_logged_in', {
        sourceScreen: 'LoginScreen',
      });
      if (!profile.isDemo) {
        trackStoreEvent(get(), 'real_account_used', { sourceScreen: 'LoginScreen' });
      }
      if (!profile.isDemo) {
        await get().loadRemoteData(profile.id);
      }
    } catch (error) {
      set({ authLoading: false });
      throw error;
    }
  },

  signUp: async (name, email, password) => {
    set({ authLoading: true });
    try {
      const user = await registerWithEmail(name.trim(), email.trim(), password);
      const profile = user.isDemo ? user : await ensureUserProfile(user);
      const onboarding = await onboardingStorage.getSnapshot(profile.id);
      set({
        user: profile,
        profile,
        accountMode: profile.isDemo ? 'demo' : 'account',
        authInitialized: true,
        authLoading: false,
        hasSeenWelcomeOnboarding: onboarding.hasSeenWelcomeOnboarding,
        needsWelcomeOnboarding: !onboarding.hasSeenWelcomeOnboarding,
        shouldStartGuidedTour: false,
        hasCompletedGuidedTour: onboarding.hasCompletedGuidedTour,
        hasSkippedGuidedTour: onboarding.hasSkippedGuidedTour,
      });
      trackStoreEvent(get(), profile.isDemo ? 'demo_mode_used' : 'user_registered', {
        sourceScreen: 'RegisterScreen',
      });
      if (!profile.isDemo) {
        trackStoreEvent(get(), 'real_account_used', { sourceScreen: 'RegisterScreen' });
      }
      if (!profile.isDemo) {
        await get().loadRemoteData(profile.id);
      }
    } catch (error) {
      set({ authLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    const previousState = get();
    set({ authLoading: true });

    try {
      trackStoreEvent(previousState, 'user_logged_out', { sourceScreen: 'ProfileScreen' });
      await signOutUser();
      const demo = demoSessionData();
      set({
        user: DEMO_USER,
        profile: DEMO_USER,
        accountMode: 'demo',
        authLoading: false,
        recipes: demoRecipes,
        likes: demo.likes,
        cart: demo.cart,
        orders: demo.orders,
        recipeLists: demo.recipeLists,
        dataError: undefined,
        hasSeenWelcomeOnboarding: false,
        needsWelcomeOnboarding: false,
        shouldStartGuidedTour: false,
        hasCompletedGuidedTour: false,
        hasSkippedGuidedTour: false,
      });
      void trackEvent('demo_mode_used', {
        userId: DEMO_USER.id,
        userEmail: DEMO_USER.email,
        isDemoMode: true,
        sourceScreen: 'sign_out',
      });
    } catch (error) {
      set({ authLoading: false });
      throw error;
    }
  },

  joinBetaProgram: async (betaCode) => {
    const normalizedCode = normalizeBetaCode(betaCode);
    const currentUser = get().user;

    if (!currentUser) {
      throw new Error('Beta programına katılmak için önce giriş yapmalısın.');
    }

    if (!validBetaCodes.includes(normalizedCode)) {
      throw new Error('Davet kodu geçersiz. Lütfen tekrar dene.');
    }

    const nextUser = await saveBetaProgram(currentUser, normalizedCode);

    set((state) => ({
      user: state.user?.id === nextUser.id ? nextUser : state.user,
      profile: state.profile?.id === nextUser.id ? { ...state.profile, ...nextUser } : nextUser,
    }));

    trackStoreEvent(get(), 'beta_joined', {
      sourceScreen: 'ProfileScreen',
      extraData: {
        betaCode: normalizedCode,
        isBetaTester: true,
      },
    });
  },

  completeWelcomeOnboarding: async (startTour) => {
    const userId = get().user?.id;

    await onboardingStorage.markWelcomeSeen(userId);

    if (startTour) {
      await onboardingStorage.resetTour(userId);
      set({
        hasSeenWelcomeOnboarding: true,
        needsWelcomeOnboarding: false,
        shouldStartGuidedTour: true,
        hasCompletedGuidedTour: false,
        hasSkippedGuidedTour: false,
      });
      return;
    }

    await onboardingStorage.markTourSkipped(userId);
    set({
      hasSeenWelcomeOnboarding: true,
      needsWelcomeOnboarding: false,
      shouldStartGuidedTour: false,
      hasCompletedGuidedTour: false,
      hasSkippedGuidedTour: true,
    });
  },

  consumePendingGuidedTour: () => {
    set({ shouldStartGuidedTour: false });
  },

  markGuidedTourCompleted: async () => {
    await onboardingStorage.markTourCompleted(get().user?.id);
    set({
      shouldStartGuidedTour: false,
      hasCompletedGuidedTour: true,
      hasSkippedGuidedTour: false,
    });
  },

  markGuidedTourSkipped: async () => {
    await onboardingStorage.markTourSkipped(get().user?.id);
    set({
      shouldStartGuidedTour: false,
      hasCompletedGuidedTour: false,
      hasSkippedGuidedTour: true,
    });
  },

  requestGuidedTourReplay: async () => {
    await onboardingStorage.resetTour(get().user?.id);
    set({
      needsWelcomeOnboarding: false,
      shouldStartGuidedTour: true,
      hasCompletedGuidedTour: false,
      hasSkippedGuidedTour: false,
    });
  },

  loadRemoteData: async (userId) => {
    if (get().accountMode !== 'account') {
      return;
    }

    set({ dataLoading: true });

    try {
      const [profile, remoteRecipes, remoteLikes, remoteCart, remoteOrders] = await Promise.all([
        fetchUserProfile(userId),
        fetchRemoteRecipes(),
        fetchUserFavorites(userId),
        fetchUserCart(userId),
        fetchUserOrders(userId),
      ]);

      set({
        profile: profile ?? get().profile,
        user: profile ?? get().user,
        recipes: mergeRecipes(remoteRecipes),
        likes: remoteLikes,
        recipeLists: {
          ...get().recipeLists,
          favorites: Object.keys(remoteLikes),
        },
        cart: remoteCart,
        orders: remoteOrders,
        dataLoading: false,
        dataError: undefined,
      });
    } catch {
      set({
        dataLoading: false,
        dataError: 'Hesap verileri güncellenemedi. İnternet bağlantını kontrol edebilirsin.',
      });
    }
  },

  toggleLike: (recipeId) => {
    const { accountMode, user } = get();
    const liked = !get().likes[recipeId];
    const recipe = get().recipes.find((item) => item.id === recipeId);

    set((state) => ({
      likes: { ...state.likes, [recipeId]: liked },
      recipeLists: {
        ...state.recipeLists,
        favorites: liked
          ? [...new Set([...state.recipeLists.favorites, recipeId])]
          : state.recipeLists.favorites.filter((id) => id !== recipeId),
      },
      recipes: state.recipes.map((recipe) =>
        recipe.id === recipeId
          ? { ...recipe, likes: Math.max(0, recipe.likes + (liked ? 1 : -1)) }
          : recipe,
      ),
    }));

    if (accountMode === 'account' && user) {
      set((state) => ({
        pendingFavoriteIds: { ...state.pendingFavoriteIds, [recipeId]: true },
      }));

      void setUserFavorite(user.id, recipeId, liked, recipe)
        .then(() => {
          set((state) => ({
            pendingFavoriteIds: { ...state.pendingFavoriteIds, [recipeId]: false },
            dataError: undefined,
          }));
        })
        .catch(() => {
          set((state) => ({
            pendingFavoriteIds: { ...state.pendingFavoriteIds, [recipeId]: false },
            dataError: 'Favori değişikliği kaydedilemedi. Bağlantını kontrol edip tekrar deneyebilirsin.',
          }));
        });
    }

    trackStoreEvent(get(), liked ? 'recipe_favorited' : 'recipe_unfavorited', {
      recipeId,
      recipeTitle: recipe?.title,
      sourceScreen: 'RecipeAction',
    });
  },

  setPantryText: (value) => set({ pantryText: value }),

  setUserGoal: (goal) => set({ userGoal: goal }),

  toggleRecipeList: (list, recipeId) => {
    if (list === 'favorites') {
      get().toggleLike(recipeId);
      return;
    }

    set((state) => {
      const current = state.recipeLists[list];
      const exists = current.includes(recipeId);

      return {
        recipeLists: {
          ...state.recipeLists,
          [list]: exists ? current.filter((id) => id !== recipeId) : [...current, recipeId],
        },
      };
    });
  },

  toggleSocialLike: (postId) => {
    const liked = !get().socialLikes[postId];

    set((state) => {
      const currentStats = state.socialPostStats[postId] ?? {
        likes: 0,
        commentsCount: state.socialComments[postId]?.length ?? 0,
        saves: 0,
      };

      return {
        socialLikes: { ...state.socialLikes, [postId]: liked },
        socialPostStats: {
          ...state.socialPostStats,
          [postId]: {
            ...currentStats,
            likes: Math.max(0, currentStats.likes + (liked ? 1 : -1)),
          },
        },
      };
    });
  },

  toggleSocialSave: (postId) => {
    const saved = !get().socialSaves[postId];

    set((state) => {
      const currentStats = state.socialPostStats[postId] ?? {
        likes: 0,
        commentsCount: state.socialComments[postId]?.length ?? 0,
        saves: 0,
      };

      return {
        socialSaves: { ...state.socialSaves, [postId]: saved },
        socialPostStats: {
          ...state.socialPostStats,
          [postId]: {
            ...currentStats,
            saves: Math.max(0, currentStats.saves + (saved ? 1 : -1)),
          },
        },
      };
    });
  },

  toggleFollowUser: (userId) => {
    set((state) => ({
      followedUsers: {
        ...state.followedUsers,
        [userId]: !state.followedUsers[userId],
      },
    }));
  },

  addSocialComment: (postId, text) => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    const comment: SocialComment = {
      id: `social-comment-${Date.now()}`,
      recipeId: postId,
      userId: get().user?.id ?? 'demo-user',
      text: trimmed,
      likes: 0,
      createdAt: 'simdi',
    };

    set((state) => {
      const comments = [comment, ...(state.socialComments[postId] ?? [])];
      const currentStats = state.socialPostStats[postId] ?? {
        likes: 0,
        commentsCount: 0,
        saves: 0,
      };

      return {
        socialComments: {
          ...state.socialComments,
          [postId]: comments,
        },
        socialPostStats: {
          ...state.socialPostStats,
          [postId]: {
            ...currentStats,
            commentsCount: currentStats.commentsCount + 1,
          },
        },
      };
    });
  },

  toggleCommentLike: (commentId) => {
    set((state) => {
      const liked = !state.commentLikes[commentId];

      const socialComments = Object.fromEntries(
        Object.entries(state.socialComments).map(([postId, comments]) => [
          postId,
          comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, likes: Math.max(0, comment.likes + (liked ? 1 : -1)), liked }
              : comment,
          ),
        ]),
      ) as Record<string, SocialComment[]>;

      return {
        commentLikes: {
          ...state.commentLikes,
          [commentId]: liked,
        },
        socialComments,
      };
    });
  },

  voteSocialPoll: (postId, optionId) => {
    set((state) => {
      const previousOptionId = state.socialPollVotes[postId];
      const currentVotes = state.socialPollOptionVotes[postId] ?? {};
      const nextVotes = { ...currentVotes };

      if (previousOptionId && nextVotes[previousOptionId]) {
        nextVotes[previousOptionId] = Math.max(0, nextVotes[previousOptionId] - 1);
      }

      nextVotes[optionId] = (nextVotes[optionId] ?? 0) + 1;

      return {
        socialPollVotes: {
          ...state.socialPollVotes,
          [postId]: optionId,
        },
        socialPollOptionVotes: {
          ...state.socialPollOptionVotes,
          [postId]: nextVotes,
        },
      };
    });
  },

  toggleChallengeJoin: (postId) => {
    set((state) => ({
      joinedChallenges: {
        ...state.joinedChallenges,
        [postId]: !state.joinedChallenges[postId],
      },
    }));
  },

  addTriedRecipe: (payload) => {
    const triedRecipe: TriedRecipePost = {
      ...payload,
      id: `tried-${Date.now()}`,
      userId: get().user?.id ?? 'demo-user',
      createdAt: 'şimdi',
    };

    set((state) => ({
      triedRecipes: [triedRecipe, ...state.triedRecipes],
    }));
  },

  markNotificationRead: (notificationId) => {
    set((state) => ({
      readNotifications: {
        ...state.readNotifications,
        [notificationId]: true,
      },
    }));
  },

  markAllNotificationsRead: (notificationIds) => {
    set((state) => ({
      readNotifications: notificationIds.reduce<Record<string, boolean>>(
        (next, notificationId) => {
          next[notificationId] = true;
          return next;
        },
        { ...state.readNotifications },
      ),
    }));
  },

  toggleCollectionSave: (collectionId) => {
    set((state) => ({
      collectionSaves: {
        ...state.collectionSaves,
        [collectionId]: !state.collectionSaves[collectionId],
      },
    }));
  },

  addFamilyShoppingItem: (item) => {
    const newItem: FamilyShoppingItem = {
      ...item,
      id: `family-${Date.now()}`,
      checked: true,
    };

    set((state) => ({
      familyAccount: {
        ...state.familyAccount,
        shoppingItems: [newItem, ...state.familyAccount.shoppingItems],
        activities: [
          {
            id: `activity-${Date.now()}`,
            actor: item.addedBy,
            text: `${item.name} ortak listeye eklendi.`,
            time: 'şimdi',
            icon: 'add-circle-outline',
          },
          ...state.familyAccount.activities,
        ].slice(0, 6),
      },
    }));
  },

  toggleFamilyShoppingItem: (itemId) => {
    set((state) => ({
      familyAccount: {
        ...state.familyAccount,
        shoppingItems: state.familyAccount.shoppingItems.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item,
        ),
      },
    }));
  },

  removeFamilyShoppingItem: (itemId) => {
    set((state) => ({
      familyAccount: {
        ...state.familyAccount,
        shoppingItems: state.familyAccount.shoppingItems.filter((item) => item.id !== itemId),
      },
    }));
  },

  addFamilyListToCart: () => {
    const checkedItems = get().familyAccount.shoppingItems.filter((item) => item.checked);

    if (checkedItems.length === 0) {
      return;
    }

    set((state) => {
      const cart = [...state.cart];

      checkedItems.forEach((item) => {
        const cartItem: CartItem = {
          id: `family_${item.id}`,
          recipeId: 'family-list',
          recipeTitle: 'Ev Listesi',
          ingredientId: item.id,
          name: item.name,
          gram: item.quantity,
          unit: item.unit,
          price: item.estimatedPrice,
          quantity: 1,
          source: 'familyList',
          sourceLabel: 'Ev Listesi',
          marketName: 'Demo Market',
          deliveryEstimate: '30-45 dk',
          averageBasket: 214,
          conversionRate: 42,
        };
        const existingIndex = cart.findIndex((current) => current.id === cartItem.id);

        if (existingIndex >= 0) {
          cart[existingIndex] = {
            ...cart[existingIndex],
            quantity: cart[existingIndex].quantity + 1,
          };
          return;
        }

        cart.push(cartItem);
      });

      return {
        cart,
        familyAccount: {
          ...state.familyAccount,
          activities: [
            {
              id: `activity-${Date.now()}`,
              actor: 'Ev Listesi',
              text: `${checkedItems.length} ürün market sepetine aktarıldı.`,
              time: 'şimdi',
              icon: 'cart-outline',
            },
            ...state.familyAccount.activities,
          ].slice(0, 6),
        },
      };
    });
    persistAccountCart(get());
    trackStoreEvent(get(), 'cart_item_added', {
      cartTotal: getCartTotal(get().cart),
      sourceScreen: 'FamilyAccount',
      extraData: {
        itemCount: checkedItems.length,
        source: 'family_list',
      },
    });
  },

  addIngredientToCart: (recipe, ingredient, alternative) => {
    const item = createCartItem(recipe, ingredient, alternative);

    set((state) => {
      const existing = state.cart.find((cartItem) => cartItem.id === item.id);
      const cart = existing
        ? state.cart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem,
          )
        : [...state.cart, item];

      return { cart };
    });
    persistAccountCart(get());
    trackStoreEvent(get(), 'cart_item_added', {
      recipeId: item.recipeId,
      recipeTitle: item.recipeTitle,
      cartTotal: getCartTotal(get().cart),
      sourceScreen: 'CartAction',
      extraData: {
        itemName: item.name,
        itemPrice: item.price,
      },
    });
  },

  addSponsoredProductToCart: (product, context) => {
    const amountMatch = product.unit.match(/\d+([.,]\d+)?/);
    const amount = amountMatch ? Number(amountMatch[0].replace(',', '.')) : 1;
    const item: CartItem = {
      id: `sponsored_${product.id}_${context?.recipeId ?? 'general'}`,
      recipeId: context?.recipeId ?? 'sponsored-product',
      recipeTitle: context?.recipeTitle ?? product.campaignName,
      ingredientId: product.targetIngredients[0] ?? product.category,
      name: product.productName,
      gram: Number.isFinite(amount) ? amount : 1,
      unit: product.unit.replace(amountMatch?.[0] ?? '', '').trim() || 'adet',
      price: product.price,
      quantity: 1,
      source: 'sponsored',
      sourceLabel: product.sponsorLabel,
      marketName: 'TarifAL Market',
      sponsoredProductId: product.id,
      brandName: product.brandName,
      sponsorLabel: product.sponsorLabel,
      commissionEstimate: Math.round(product.price * 0.08),
    };

    set((state) => {
      const existing = state.cart.find((cartItem) => cartItem.id === item.id);
      const cart = existing
        ? state.cart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem,
          )
        : [...state.cart, item];

      return { cart };
    });
    persistAccountCart(get());
    trackStoreEvent(get(), 'sponsored_added_to_cart', {
      recipeId: item.recipeId,
      recipeTitle: item.recipeTitle,
      cartTotal: getCartTotal(get().cart),
      sourceScreen: context?.placementType ?? 'sponsored',
      extraData: {
        sponsoredProductId: product.id,
        brandName: product.brandName,
        productName: product.productName,
        campaignName: product.campaignName,
        placementType: context?.placementType ?? 'cart',
        itemPrice: product.price,
      },
    });
  },

  addRestaurantMealToCart: (recipe, restaurant) => {
    const item: RestaurantCartItem = {
      id: `restaurant_${recipe.id}_${restaurant.id}`,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      portionPrice: restaurant.portionPrice,
      quantity: 1,
      deliveryFee: restaurant.deliveryFee,
      deliveryEstimate: restaurant.deliveryEstimate,
      tags: restaurant.tags,
      sourceLabel: 'Hazır yemek siparişi',
      commissionRate: restaurant.commissionRate,
      commissionEstimate: Math.round(restaurant.portionPrice * restaurant.commissionRate),
    };

    set((state) => {
      const existing = state.restaurantCart.find((cartItem) => cartItem.id === item.id);
      const restaurantCart = existing
        ? state.restaurantCart.map((cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + 1,
                  commissionEstimate:
                    cartItem.commissionEstimate +
                    Math.round(restaurant.portionPrice * restaurant.commissionRate),
                }
              : cartItem,
          )
        : [...state.restaurantCart, item];

      return { restaurantCart };
    });
  },

  addMissingIngredientsToCart: (recipeId, pantryText) => {
    const recipe = get().recipes.find((item) => item.id === recipeId);

    if (!recipe) {
      return;
    }

    const match = getRecipeMatch(recipe, parsePantryText(pantryText ?? get().pantryText));
    match.missingIngredients.forEach((ingredient) => get().addIngredientToCart(recipe, ingredient));
    trackStoreEvent(get(), 'missing_items_added_to_cart', {
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      cartTotal: getCartTotal(get().cart),
      sourceScreen: 'RecipeDetail',
      extraData: {
        missingCount: match.missingIngredients.length,
      },
    });
  },

  addRecipeToCart: (recipeId) => {
    const recipe = get().recipes.find((item) => item.id === recipeId);

    if (!recipe) {
      return;
    }

    recipe.ingredients.forEach((ingredient) => get().addIngredientToCart(recipe, ingredient));
  },

  createSmartBasketPlan: (input) => {
    const cleanIngredients = [...new Set(input.ingredients.map((item) => item.trim()).filter(Boolean))];
    const cleanInput: SmartBasketInput = {
      ...input,
      ingredients: cleanIngredients.length > 0 ? cleanIngredients : parsePantryText(get().pantryText),
      servings: Math.max(1, input.servings),
    };
    const plans = get()
      .recipes.map((recipe) => createSmartBasketPlanFromRecipe(recipe, cleanInput, get().userGoal))
      .sort((first, second) => {
        const firstPreferred = first.recipeId === cleanInput.recipeId ? 1 : 0;
        const secondPreferred = second.recipeId === cleanInput.recipeId ? 1 : 0;

        if (firstPreferred !== secondPreferred) {
          return secondPreferred - firstPreferred;
        }

        if (first.matchPercent !== second.matchPercent) {
          return second.matchPercent - first.matchPercent;
        }

        if (first.suitabilityScore !== second.suitabilityScore) {
          return second.suitabilityScore - first.suitabilityScore;
        }

        return first.estimatedCost - second.estimatedCost;
      })
      .slice(0, 3);

    set({
      pantryText: cleanInput.ingredients.join(', '),
      smartBasket: {
        input: cleanInput,
        plans,
        selectedPlanId: plans[0]?.id,
      },
    });
    trackStoreEvent(get(), 'smart_cart_created', {
      recipeId: plans[0]?.recipeId,
      recipeTitle: plans[0]?.recipeTitle,
      cartTotal: plans[0]?.missingTotal,
      sourceScreen: 'SmartBasket',
      extraData: {
        planCount: plans.length,
        servings: cleanInput.servings,
        budgetModeId: cleanInput.budgetModeId,
      },
    });

    return plans;
  },

  selectSmartBasketPlan: (planId) => {
    set((state) => ({
      smartBasket: {
        ...state.smartBasket,
        selectedPlanId: planId,
      },
    }));
  },

  addSmartBasketItemsToCart: (planId) => {
    const { smartBasket } = get();
    const plan =
      smartBasket.plans.find((item) => item.id === (planId ?? smartBasket.selectedPlanId)) ??
      smartBasket.plans[0];

    if (!plan) {
      return;
    }

    const items: CartItem[] = plan.missingIngredients.map((ingredient) => ({
      id: `smartbasket_${plan.id}_${ingredient.id}`,
      recipeId: plan.recipeId,
      recipeTitle: plan.recipeTitle,
      ingredientId: ingredient.id,
      name: ingredient.name,
      gram: ingredient.gram,
      price: ingredient.price,
      quantity: 1,
      source: 'smartBasket',
      sourceLabel: 'Akıllı Sepet',
      marketName: demoSmartBasketMarket.name,
      deliveryEstimate: demoSmartBasketMarket.deliveryEstimate,
      commissionEstimate: plan.estimatedCommission,
      averageBasket: demoSmartBasketMarket.averageBasket,
      conversionRate: demoSmartBasketMarket.conversionRate,
    }));

    set((state) => {
      const cart = [...state.cart];

      items.forEach((item) => {
        const existingIndex = cart.findIndex((cartItem) => cartItem.id === item.id);

        if (existingIndex >= 0) {
          cart[existingIndex] = {
            ...cart[existingIndex],
            quantity: cart[existingIndex].quantity + 1,
          };
          return;
        }

        cart.push(item);
      });

      return {
        cart,
        smartBasket: {
          ...state.smartBasket,
          selectedPlanId: plan.id,
          completedPlanId: plan.id,
          lastAddedAt: new Date().toISOString(),
        },
      };
    });
    persistAccountCart(get());
    trackStoreEvent(get(), 'missing_items_added_to_cart', {
      recipeId: plan.recipeId,
      recipeTitle: plan.recipeTitle,
      cartTotal: getCartTotal(get().cart),
      sourceScreen: 'SmartBasket',
      extraData: {
        missingCount: items.length,
        planId: plan.id,
      },
    });
  },

  resetSmartBasketFlow: () => {
    set({
      smartBasket: {
        input: null,
        plans: [],
      },
    });
  },

  completeSmartBasketDemo: () => {
    set((state) => ({
      smartBasket: {
        ...state.smartBasket,
        completedPlanId: state.smartBasket.selectedPlanId,
        lastAddedAt: new Date().toISOString(),
      },
    }));
  },

  incrementCartItem: (itemId) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    }));
    persistAccountCart(get());
    const item = get().cart.find((cartItem) => cartItem.id === itemId);
    trackStoreEvent(get(), 'cart_item_added', {
      recipeId: item?.recipeId,
      recipeTitle: item?.recipeTitle,
      cartTotal: getCartTotal(get().cart),
      sourceScreen: 'CartScreen',
      extraData: {
        itemName: item?.name,
      },
    });
  },

  decrementCartItem: (itemId) => {
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
        )
        .filter((item) => item.quantity > 0),
    }));
    persistAccountCart(get());
    trackStoreEvent(get(), 'cart_item_removed', {
      cartTotal: getCartTotal(get().cart),
      sourceScreen: 'CartScreen',
      extraData: {
        itemId,
      },
    });
  },

  removeCartItem: (itemId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    }));
    persistAccountCart(get());
    trackStoreEvent(get(), 'cart_item_removed', {
      cartTotal: getCartTotal(get().cart),
      sourceScreen: 'CartScreen',
      extraData: {
        itemId,
      },
    });
  },

  clearCart: () => {
    set({ cart: [] });
    persistAccountCart(get());
    trackStoreEvent(get(), 'cart_item_removed', {
      cartTotal: 0,
      sourceScreen: 'CartScreen',
      extraData: {
        action: 'clear_cart',
      },
    });
  },

  incrementRestaurantItem: (itemId) => {
    set((state) => ({
      restaurantCart: state.restaurantCart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: item.quantity + 1,
              commissionEstimate:
                item.commissionEstimate + Math.round(item.portionPrice * item.commissionRate),
            }
          : item,
      ),
    }));
  },

  decrementRestaurantItem: (itemId) => {
    set((state) => ({
      restaurantCart: state.restaurantCart
        .map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: Math.max(0, item.quantity - 1),
                commissionEstimate: Math.max(
                  0,
                  item.commissionEstimate - Math.round(item.portionPrice * item.commissionRate),
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    }));
  },

  removeRestaurantItem: (itemId) => {
    set((state) => ({
      restaurantCart: state.restaurantCart.filter((item) => item.id !== itemId),
    }));
  },

  clearRestaurantCart: () => {
    set({ restaurantCart: [] });
  },

  placeOrder: async (address, options) => {
    const { cart, user } = get();

    if (cart.length === 0) {
      throw new Error('Sepetin boş.');
    }

    if (!address.trim()) {
      throw new Error('Teslimat adresi gerekli.');
    }

    const subtotal =
      cart.reduce((sum, item) => sum + item.price * item.quantity, 0) *
      (options?.marketPriceMultiplier ?? 1);
    const deliveryFee = options?.deliveryFee ?? 0;
    const serviceFee = options?.serviceFee ?? 0;
    const total = subtotal + deliveryFee + serviceFee;
    const timestamp = Date.now();
    const orderNumber = `ORD-${String(timestamp).slice(-6)}`;
    const relatedRecipes = Array.from(
      cart.reduce((map, item) => {
        if (item.recipeId && item.recipeId !== 'family-list') {
          map.set(item.recipeId, {
            recipeId: item.recipeId,
            recipeTitle: item.recipeTitle,
          });
        }

        return map;
      }, new Map<string, { recipeId: string; recipeTitle: string }>()),
    ).map(([, recipe]) => recipe);

    const order: Order = {
      id: `order-${timestamp}`,
      orderId: `order-${timestamp}`,
      orderNumber,
      userId: user?.id ?? 'demo-user',
      userEmail: user?.email ?? null,
      userName: user?.name ?? null,
      items: cart,
      relatedRecipes,
      address: address.trim(),
      total,
      subtotal,
      deliveryFee,
      discount: 0,
      serviceFee,
      marketName: options?.marketName,
      deliveryEstimate: options?.deliveryEstimate,
      deliverySlot: options?.deliverySlot,
      paymentMethod: options?.paymentMethod,
      paymentStatus: 'demo',
      isPaid: false,
      isDemoOrder: true,
      userNote: 'Akıllı sipariş MVP demosu.',
      commissionEstimate: options?.commissionEstimate,
      averageBasket: options?.averageBasket,
      conversionRate: options?.conversionRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      status: 'new',
    };

    if (get().accountMode === 'account') {
      await saveOrder(order);
    }
    set((state) => ({ orders: [order, ...state.orders], cart: [] }));
    persistAccountCart(get());
    trackStoreEvent(get(), 'order_created', {
      cartTotal: order.total,
      sourceScreen: 'MarketCheckout',
      extraData: {
        orderId: order.id,
        orderNumber,
        marketName: order.marketName,
        isDemoOrder: true,
      },
    });
    trackStoreEvent(get(), 'checkout_demo_completed', {
      cartTotal: order.total,
      sourceScreen: 'MarketCheckout',
      extraData: {
        orderId: order.id,
        marketName: order.marketName,
      },
    });

    return order;
  },

  addRecipe: async (payload) => {
    const cleanTitle = payload.title.trim();
    const cleanDescription = payload.description.trim();
    const cleanIngredients = payload.ingredients.filter((ingredient) => ingredient.name.trim());
    const cleanSteps = payload.steps.filter((step) => step.text.trim());

    if (!cleanTitle || !cleanDescription || cleanIngredients.length === 0 || cleanSteps.length === 0) {
      throw new Error('Tarif başlığı, açıklama, en az bir malzeme ve bir hazırlık adımı gerekli.');
    }

    const user = get().user;
    const estimatedPrice = payload.ingredients.reduce((sum, ingredient) => sum + ingredient.price, 0);
    const recipe: Recipe = {
      id: `recipe-${Date.now()}`,
      title: cleanTitle,
      description: cleanDescription,
      category: payload.category,
      imageUrl:
        payload.imageUrl ||
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
      ingredients: cleanIngredients,
      requiredIngredients: cleanIngredients,
      optionalIngredients: [],
      steps: cleanSteps,
      likes: 0,
      prepTime: payload.prepTime,
      servings: payload.servings,
      calories: payload.calories,
      difficulty: payload.difficulty,
      tags: payload.tags,
      goalTypes: ['pratik_yemek'],
      estimatedPrice,
      createdBy: user?.id ?? 'demo-user',
      createdByName: user?.name ?? 'TarifAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: get().accountMode !== 'account',
    };
    const socialPost: SocialRecipePost = {
      id: `post-${recipe.id}`,
      recipeId: recipe.id,
      authorId: user?.id ?? 'demo-user',
      title: recipe.title,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      category: recipe.category,
      tags: recipe.tags,
      prepTime: Math.max(5, Math.round(recipe.prepTime * 0.35)),
      cookTime: Math.max(0, recipe.prepTime - Math.max(5, Math.round(recipe.prepTime * 0.35))),
      totalTime: recipe.prepTime,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      likes: 0,
      commentsCount: 0,
      saves: 0,
      marketBasketPrice: payload.socialMarketReady === false ? 0 : estimatedPrice,
      restaurantOrderAvailable: Boolean(payload.socialRestaurantReady),
      restaurantStartPrice: payload.socialRestaurantReady
        ? Math.max(89, Math.round(estimatedPrice * 1.35))
        : undefined,
      commercialBadges: [
        payload.socialMarketReady === false ? 'Evde Yap' : 'Market sepetine uygun',
        payload.socialRestaurantReady ? 'Hazir siparis uygun' : 'Topluluk tarifi',
      ],
      nutrition: {
        calories: recipe.calories,
      },
      createdAt: 'simdi',
      tip: 'Bu tarif topluluk tarafindan paylasildi; marka ve sepet secenekleri demo modunda gosterilir.',
    };

    if (get().accountMode === 'account') {
      await saveUserRecipe(recipe);
    }

    set((state) => ({
      recipes: [recipe, ...state.recipes],
      socialPosts: [socialPost, ...state.socialPosts],
      socialComments: {
        ...state.socialComments,
        [socialPost.id]: [],
      },
      socialPostStats: {
        ...state.socialPostStats,
        [socialPost.id]: {
          likes: 0,
          commentsCount: 0,
          saves: 0,
        },
      },
    }));
    trackStoreEvent(get(), 'recipe_shared', {
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      cartTotal: estimatedPrice,
      sourceScreen: 'AddRecipe',
      extraData: {
        category: recipe.category,
        ingredientCount: recipe.ingredients.length,
      },
    });

    return recipe;
  },

  suggestRecipes: (pantryText) => {
    const terms = parsePantryText(pantryText);

    if (terms.length === 0) {
      return [];
    }

    return get()
      .recipes.map<AiSuggestion>((recipe) => {
        const match = getRecipeMatch(recipe, terms);
        const matchedIngredients = match.matchedIngredients.map((ingredient) => ingredient.name);
        const missingIngredients = match.missingIngredients.slice(0, 3).map((ingredient) => ingredient.name);

        return {
          id: `suggestion-${recipe.id}`,
          title: recipe.title,
          recipeId: recipe.id,
          matchedIngredients,
          missingIngredients,
          reason:
            matchedIngredients.length > 0
              ? `${matchedIngredients.length} malzeme eşleşti, sepeti eksiklerle tamamlayabiliriz.`
              : `${recipe.category} kategorisinde iyi bir alternatif.`,
        };
      })
      .filter((suggestion) => suggestion.matchedIngredients.length > 0)
      .sort((first, second) => second.matchedIngredients.length - first.matchedIngredients.length)
      .slice(0, 4);
  },
}));

useAppStore.subscribe((state) => {
  if (state.accountMode !== 'demo') {
    return;
  }

  writePersistedDemoState({
    likes: state.likes,
    cart: state.cart,
    restaurantCart: state.restaurantCart,
    orders: state.orders,
    userGoal: state.userGoal,
    recipeLists: state.recipeLists,
    socialLikes: state.socialLikes,
    socialSaves: state.socialSaves,
    followedUsers: state.followedUsers,
    socialComments: state.socialComments,
    socialPostStats: state.socialPostStats,
    socialPosts: state.socialPosts,
    socialPollVotes: state.socialPollVotes,
    socialPollOptionVotes: state.socialPollOptionVotes,
    joinedChallenges: state.joinedChallenges,
    commentLikes: state.commentLikes,
    triedRecipes: state.triedRecipes,
    readNotifications: state.readNotifications,
    collectionSaves: state.collectionSaves,
    pantryText: state.pantryText,
    familyAccount: state.familyAccount,
  });
});
