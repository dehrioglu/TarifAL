import { create } from 'zustand';

import { demoFamilyAccount } from '../data/demoFamily';
import { mockSocialComments, mockSocialRecipes } from '../data/mockSocial';
import { mockSocialFeedExtras } from '../data/mockSocialPosts';
import { mockTriedRecipes } from '../data/mockTriedRecipes';
import { demoSmartBasketMarket, smartBasketBudgetModes } from '../data/demoSmartBasket';
import { demoRecipes } from '../data/demoRecipes';
import { onboardingStorage } from '../onboarding/onboardingStorage';
import { signInWithEmail, registerWithEmail, signOutUser } from '../services/authService';
import {
  fetchRecipes,
  fetchUserLikes,
  fetchUserOrders,
  saveCartItem,
  saveLike,
  saveOrder,
  saveRecipe,
  syncUser,
} from '../services/firestoreService';
import {
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
  authLoading: boolean;
  recipes: Recipe[];
  likes: Record<string, boolean>;
  cart: CartItem[];
  restaurantCart: RestaurantCartItem[];
  orders: Order[];
  dataLoading: boolean;
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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
  addRecipe: (payload: NewRecipePayload) => Recipe;
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

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  authLoading: false,
  recipes: demoRecipes,
  likes: persistedDemoState.likes ?? initialLikes,
  dataLoading: false,
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

  signIn: async (email, password) => {
    set({ authLoading: true });
    try {
      const user = await signInWithEmail(email.trim(), password);
      const onboarding = await onboardingStorage.getSnapshot(user.id);
      await syncUser(user);
      set({
        user,
        authLoading: false,
        hasSeenWelcomeOnboarding: onboarding.hasSeenWelcomeOnboarding,
        needsWelcomeOnboarding: false,
        shouldStartGuidedTour: false,
        hasCompletedGuidedTour: onboarding.hasCompletedGuidedTour,
        hasSkippedGuidedTour: onboarding.hasSkippedGuidedTour,
      });
      await get().loadRemoteData(user.id);
    } catch (error) {
      set({ authLoading: false });
      throw error;
    }
  },

  signUp: async (name, email, password) => {
    set({ authLoading: true });
    try {
      const user = await registerWithEmail(name.trim(), email.trim(), password);
      const onboarding = await onboardingStorage.getSnapshot(user.id);
      await syncUser(user);
      set({
        user,
        authLoading: false,
        hasSeenWelcomeOnboarding: onboarding.hasSeenWelcomeOnboarding,
        needsWelcomeOnboarding: !onboarding.hasSeenWelcomeOnboarding,
        shouldStartGuidedTour: false,
        hasCompletedGuidedTour: onboarding.hasCompletedGuidedTour,
        hasSkippedGuidedTour: onboarding.hasSkippedGuidedTour,
      });
      await get().loadRemoteData(user.id);
    } catch (error) {
      set({ authLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    await signOutUser();
    set({
      user: null,
      hasSeenWelcomeOnboarding: false,
      needsWelcomeOnboarding: false,
      shouldStartGuidedTour: false,
      hasCompletedGuidedTour: false,
      hasSkippedGuidedTour: false,
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
    set({ dataLoading: true });

    try {
      const [remoteRecipes, remoteLikes, remoteOrders] = await Promise.all([
        fetchRecipes(),
        fetchUserLikes(userId),
        fetchUserOrders(userId),
      ]);

      set((state) => ({
        recipes: remoteRecipes.length > 0 ? remoteRecipes : state.recipes,
        likes: Object.keys(remoteLikes).length > 0 ? remoteLikes : state.likes,
        orders: remoteOrders.length > 0 ? remoteOrders : state.orders,
        dataLoading: false,
      }));
    } catch {
      set({ dataLoading: false });
    }
  },

  toggleLike: (recipeId) => {
    const userId = get().user?.id ?? 'demo-user';
    const liked = !get().likes[recipeId];

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

    void saveLike(userId, recipeId, liked);
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
  },

  addIngredientToCart: (recipe, ingredient, alternative) => {
    const item = createCartItem(recipe, ingredient, alternative);
    const userId = get().user?.id ?? 'demo-user';

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

    void saveCartItem(userId, item);
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
    const { smartBasket, user } = get();
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

    items.forEach((item) => {
      void saveCartItem(user?.id ?? 'demo-user', item);
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
  },

  decrementCartItem: (itemId) => {
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
        )
        .filter((item) => item.quantity > 0),
    }));
  },

  removeCartItem: (itemId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    }));
  },

  clearCart: () => {
    set({ cart: [] });
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

    const order: Order = {
      id: `order-${Date.now()}`,
      userId: user?.id ?? 'demo-user',
      items: cart,
      address: address.trim(),
      total,
      subtotal,
      deliveryFee,
      serviceFee,
      marketName: options?.marketName,
      deliveryEstimate: options?.deliveryEstimate,
      deliverySlot: options?.deliverySlot,
      paymentMethod: options?.paymentMethod,
      commissionEstimate: options?.commissionEstimate,
      averageBasket: options?.averageBasket,
      conversionRate: options?.conversionRate,
      createdAt: new Date().toISOString(),
      status: 'mock-confirmed',
    };

    await saveOrder(order);
    set((state) => ({ orders: [order, ...state.orders], cart: [] }));

    return order;
  },

  addRecipe: (payload) => {
    const user = get().user;
    const estimatedPrice = payload.ingredients.reduce((sum, ingredient) => sum + ingredient.price, 0);
    const recipe: Recipe = {
      id: `recipe-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      imageUrl:
        payload.imageUrl ||
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
      ingredients: payload.ingredients,
      requiredIngredients: payload.ingredients,
      optionalIngredients: [],
      steps: payload.steps,
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
    void saveRecipe(recipe);

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

useAppStore.subscribe((state) =>
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
  }),
);
