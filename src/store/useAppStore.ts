import { create } from 'zustand';

import { demoRecipes } from '../data/demoRecipes';
import { signInWithEmail, registerWithEmail, signOutUser } from '../services/authService';
import { saveCartItem, saveLike, saveOrder, saveRecipe, syncUser } from '../services/firestoreService';
import { AppUser, CartItem, Ingredient, NewRecipePayload, Order, Recipe } from '../types';

type AppState = {
  user: AppUser | null;
  authLoading: boolean;
  recipes: Recipe[];
  likes: Record<string, boolean>;
  cart: CartItem[];
  orders: Order[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  toggleLike: (recipeId: string) => void;
  addIngredientToCart: (recipe: Recipe, ingredient: Ingredient) => void;
  addRecipeToCart: (recipeId: string) => void;
  incrementCartItem: (itemId: string) => void;
  decrementCartItem: (itemId: string) => void;
  removeCartItem: (itemId: string) => void;
  placeOrder: (address: string) => Promise<void>;
  addRecipe: (payload: NewRecipePayload) => Recipe;
};

const initialLikes = {
  'recipe-kunefe': true,
} satisfies Record<string, boolean>;

const createCartItem = (recipe: Recipe, ingredient: Ingredient): CartItem => ({
  id: `${recipe.id}_${ingredient.id}`,
  recipeId: recipe.id,
  recipeTitle: recipe.title,
  ingredientId: ingredient.id,
  name: ingredient.name,
  gram: ingredient.gram,
  price: ingredient.price,
  quantity: 1,
});

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  authLoading: false,
  recipes: demoRecipes,
  likes: initialLikes,
  cart: [
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

  signIn: async (email, password) => {
    set({ authLoading: true });
    try {
      const user = await signInWithEmail(email.trim(), password);
      await syncUser(user);
      set({ user, authLoading: false });
    } catch (error) {
      set({ authLoading: false });
      throw error;
    }
  },

  signUp: async (name, email, password) => {
    set({ authLoading: true });
    try {
      const user = await registerWithEmail(name.trim(), email.trim(), password);
      await syncUser(user);
      set({ user, authLoading: false });
    } catch (error) {
      set({ authLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    await signOutUser();
    set({ user: null });
  },

  toggleLike: (recipeId) => {
    const userId = get().user?.id ?? 'demo-user';
    const liked = !get().likes[recipeId];

    set((state) => ({
      likes: { ...state.likes, [recipeId]: liked },
      recipes: state.recipes.map((recipe) =>
        recipe.id === recipeId
          ? { ...recipe, likes: Math.max(0, recipe.likes + (liked ? 1 : -1)) }
          : recipe,
      ),
    }));

    void saveLike(userId, recipeId, liked);
  },

  addIngredientToCart: (recipe, ingredient) => {
    const item = createCartItem(recipe, ingredient);
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

  addRecipeToCart: (recipeId) => {
    const recipe = get().recipes.find((item) => item.id === recipeId);

    if (!recipe) {
      return;
    }

    recipe.ingredients.forEach((ingredient) => get().addIngredientToCart(recipe, ingredient));
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
      steps: payload.steps,
      likes: 0,
      createdBy: user?.id ?? 'demo-user',
      createdByName: user?.name ?? 'Tarif AI',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ recipes: [recipe, ...state.recipes] }));
    void saveRecipe(recipe);

    return recipe;
  },
}));
