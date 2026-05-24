import { create } from 'zustand';

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
  Ingredient,
  MarketAlternative,
  NewRecipePayload,
  Order,
  Recipe,
  SmartBasketFlowState,
  SmartBasketInput,
  SmartBasketPlan,
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
  orders: Order[];
  dataLoading: boolean;
  pantryText: string;
  userGoal: UserGoal;
  recipeLists: Record<FavoriteListType, string[]>;
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
  addIngredientToCart: (recipe: Recipe, ingredient: Ingredient, alternative?: MarketAlternative) => void;
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
  placeOrder: (address: string) => Promise<void>;
  addRecipe: (payload: NewRecipePayload) => Recipe;
  suggestRecipes: (pantryText: string) => AiSuggestion[];
};

const initialLikes = {
  'recipe-kunefe': true,
} satisfies Record<string, boolean>;

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

type PersistedDemoState = Pick<AppState, 'likes' | 'cart' | 'userGoal' | 'recipeLists' | 'pantryText'>;

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
  orders: [],
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

  placeOrder: async (address) => {
    const { cart, user } = get();

    if (cart.length === 0) {
      throw new Error('Sepetin boş.');
    }

    if (!address.trim()) {
      throw new Error('Teslimat adresi gerekli.');
    }

    const order: Order = {
      id: `order-${Date.now()}`,
      userId: user?.id ?? 'demo-user',
      items: cart,
      address: address.trim(),
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      createdAt: new Date().toISOString(),
      status: 'mock-confirmed',
    };

    await saveOrder(order);
    set((state) => ({ orders: [order, ...state.orders], cart: [] }));
  },

  addRecipe: (payload) => {
    const user = get().user;
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
      estimatedPrice: payload.ingredients.reduce((sum, ingredient) => sum + ingredient.price, 0),
      createdBy: user?.id ?? 'demo-user',
      createdByName: user?.name ?? 'TarifAL',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ recipes: [recipe, ...state.recipes] }));
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
    userGoal: state.userGoal,
    recipeLists: state.recipeLists,
    pantryText: state.pantryText,
  }),
);
