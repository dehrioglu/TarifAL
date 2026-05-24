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
  unit?: string;
  price: number;
  quantity: number;
  selectedAlternative?: MarketAlternative;
  source?: 'recipe' | 'smartBasket' | 'familyList';
  sourceLabel?: string;
  marketName?: string;
  deliveryEstimate?: string;
  commissionEstimate?: number;
  averageBasket?: number;
  conversionRate?: number;
};

export type FamilyMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
};

export type FamilyShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  category: string;
  addedBy: string;
  note: string;
  checked: boolean;
};

export type FamilyActivity = {
  id: string;
  actor: string;
  text: string;
  time: string;
  icon: string;
};

export type FamilyAccountState = {
  homeName: string;
  inviteCode: string;
  members: FamilyMember[];
  shoppingItems: FamilyShoppingItem[];
  activities: FamilyActivity[];
};

export type DemoMarketOption = {
  id: string;
  name: string;
  badge: string;
  description: string;
  deliveryEstimate: string;
  deliveryFee: number;
  serviceFee: number;
  rating: number;
  commissionRate: number;
};

export type DemoDeliverySlot = {
  id: string;
  label: string;
  helper: string;
  estimate: string;
};

export type DemoPaymentMethod = {
  id: string;
  label: string;
  helper: string;
  badge: string;
};

export type DemoTrackingStep = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type PlaceOrderOptions = {
  marketName?: string;
  deliveryEstimate?: string;
  deliverySlot?: string;
  deliveryFee?: number;
  serviceFee?: number;
  paymentMethod?: string;
  commissionEstimate?: number;
  averageBasket?: number;
  conversionRate?: number;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  address: string;
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  serviceFee?: number;
  marketName?: string;
  deliveryEstimate?: string;
  deliverySlot?: string;
  paymentMethod?: string;
  commissionEstimate?: number;
  averageBasket?: number;
  conversionRate?: number;
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

export type SmartBasketBudgetMode = {
  id: string;
  label: string;
  helper: string;
  badge: string;
  limit?: number;
};

export type SmartBasketMarketInfo = {
  name: string;
  deliveryEstimate: string;
  commissionRate: number;
  averageBasket: number;
  conversionRate: number;
};

export type SmartBasketMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
};

export type SmartBasketInput = {
  ingredients: string[];
  servings: number;
  budgetModeId: string;
  recipeId?: string;
};

export type SmartBasketPlan = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  recipeImage: string;
  description: string;
  category: RecipeCategory;
  prepTime: number;
  difficulty: Difficulty;
  calories: number;
  servings: number;
  matchPercent: number;
  suitabilityScore: number;
  estimatedCost: number;
  perPersonCost: number;
  missingIngredients: Ingredient[];
  matchedIngredients: Ingredient[];
  missingTotal: number;
  estimatedCommission: number;
  budgetModeId: string;
  budgetLabel: string;
};

export type SmartBasketFlowState = {
  input: SmartBasketInput | null;
  plans: SmartBasketPlan[];
  selectedPlanId?: string;
  completedPlanId?: string;
  lastAddedAt?: string;
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
