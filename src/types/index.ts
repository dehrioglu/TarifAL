export type RecipeCategory =
  | 'Kahvaltı'
  | 'Çorba'
  | 'Ana Yemek'
  | 'Tatlı'
  | 'Salata'
  | 'Pratik'
  | 'Ekonomik';

export type CategoryFilter = 'Hepsi' | RecipeCategory;

export type Difficulty = 'Kolay' | 'Orta' | 'Zor';

export type UserGoal =
  | 'Kilo vermek'
  | 'Kas yapmak'
  | 'Sağlıklı beslenmek'
  | 'Ekonomik beslenmek'
  | 'Pratik yemek yapmak'
  | 'Aile için pratik yemek'
  | 'Öğrenci modu'
  | 'Zaman kazanmak';

export type GoalType =
  | 'kilo_vermek'
  | 'kas_yapmak'
  | 'saglikli_beslenmek'
  | 'ekonomik_beslenmek'
  | 'pratik_yemek';

export type FavoriteListType = 'favorites' | 'cookLater' | 'cookedBefore';

export type MarketAlternative = {
  id: string;
  name: string;
  gram: number;
  price: number;
  note: string;
};

export type Ingredient = {
  id: string;
  name: string;
  gram: number;
  price: number;
  alternatives?: MarketAlternative[];
};

export type MarketProduct = {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image?: string;
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
  requiredIngredients?: Ingredient[];
  optionalIngredients?: Ingredient[];
  steps: RecipeStep[];
  likes: number;
  prepTime: number;
  servings: number;
  calories: number;
  difficulty: Difficulty;
  tags: string[];
  goalTypes: GoalType[];
  estimatedPrice?: number;
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
  selectedAlternative?: MarketAlternative;
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

export type AiSuggestion = {
  id: string;
  title: string;
  reason: string;
  matchedIngredients: string[];
  missingIngredients: string[];
  recipeId?: string;
};

export type RecipeMatch = {
  recipe: Recipe;
  matchedIngredients: Ingredient[];
  missingIngredients: Ingredient[];
  matchPercent: number;
  label: string;
  qualityLabel: string;
};

export type NewRecipePayload = {
  title: string;
  description: string;
  category: RecipeCategory;
  imageUrl?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  prepTime: number;
  servings: number;
  calories: number;
  difficulty: Difficulty;
  tags: string[];
};
