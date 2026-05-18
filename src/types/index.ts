export type RecipeCategory = 'Kahvaltı' | 'Çorba' | 'Ana Yemek' | 'Tatlı';

export type CategoryFilter = 'Hepsi' | RecipeCategory;

export type Ingredient = {
  id: string;
  name: string;
  gram: number;
  price: number;
};

export type RecipeStep = {
  id: string;
  text: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  imageUrl: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  likes: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isFeatured?: boolean;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type CartItem = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  ingredientId: string;
  name: string;
  gram: number;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  address: string;
  total: number;
  createdAt: string;
  status: 'mock-confirmed';
};

export type NewRecipePayload = {
  title: string;
  description: string;
  category: RecipeCategory;
  imageUrl?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
};
