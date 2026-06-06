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

export type UserRole = 'user' | 'admin' | 'founder';

export type FavoriteListType = 'favorites' | 'cookLater' | 'cookedBefore';

export type MarketAlternative = {
  id: string;
  name: string;
  gram: number;
  price: number;
  note: string;
};

export type IngredientBrandQuality = 'economic' | 'standard' | 'premium';

export type IngredientBrandOption = {
  id: string;
  name: string;
  price: number;
  size: string;
  quality: IngredientBrandQuality;
  sponsored?: boolean;
  campaign?: string;
};

export type Ingredient = {
  id: string;
  name: string;
  gram: number;
  price: number;
  image?: string;
  category?: string;
  defaultUnit?: string;
  quantity?: number;
  brands?: IngredientBrandOption[];
  alternatives?: MarketAlternative[];
};

export type SponsoredPlacementType =
  | 'recipe_detail'
  | 'missing_items'
  | 'cart'
  | 'ai_chef'
  | 'discover_collection';

export type SponsoredProduct = {
  id: string;
  brandName: string;
  productName: string;
  category: string;
  subCategory?: string;
  imageURL?: string;
  price: number;
  unit: string;
  tags: string[];
  sponsorLabel: string;
  priority: number;
  targetIngredients: string[];
  targetRecipeCategories: string[];
  targetKeywords: string[];
  placementTypes: SponsoredPlacementType[];
  isActive: boolean;
  campaignName: string;
  campaignStartAt?: string;
  campaignEndAt?: string;
  clickCount: number;
  impressionCount: number;
  cartAddCount: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
};

export type SponsoredCollection = {
  id: string;
  title: string;
  subtitle: string;
  sponsorLabel: string;
  brandName: string;
  brandLogoUrl?: string;
  productIds: string[];
  recipeIds: string[];
  imageURL?: string;
  ctaLabel: string;
  isActive: boolean;
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
  updatedAt?: string;
  isDemo?: boolean;
  isFeatured?: boolean;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
  isDemo?: boolean;
  isBetaTester?: boolean;
  betaCode?: string;
  betaJoinedAt?: string;
};

export type AccountMode = 'demo' | 'account';

export type AnalyticsEventName =
  | 'user_registered'
  | 'user_logged_in'
  | 'user_logged_out'
  | 'recipe_opened'
  | 'recipe_favorited'
  | 'recipe_unfavorited'
  | 'missing_items_added_to_cart'
  | 'cart_item_added'
  | 'cart_item_removed'
  | 'smart_cart_created'
  | 'checkout_demo_started'
  | 'checkout_demo_completed'
  | 'recipe_shared'
  | 'ai_chef_opened'
  | 'demo_mode_used'
  | 'real_account_used'
  | 'beta_joined'
  | 'feedback_submitted'
  | 'mini_survey_answered'
  | 'order_created'
  | 'order_status_updated'
  | 'order_completed'
  | 'order_cancelled'
  | 'sponsored_impression'
  | 'sponsored_click'
  | 'sponsored_added_to_cart'
  | 'sponsored_collection_opened'
  | 'sponsored_alternative_viewed';

export type AnalyticsEventPayload = {
  userId?: string;
  userEmail?: string;
  recipeId?: string;
  recipeTitle?: string;
  cartTotal?: number;
  sourceScreen?: string;
  isDemoMode?: boolean;
  extraData?: Record<string, string | number | boolean | null | undefined>;
};

export type AnalyticsMetricSummary = {
  totalUsers: number;
  totalEvents: number;
  recipeOpenCount: number;
  favoriteCount: number;
  cartCreatedCount: number;
  checkoutCompletedCount: number;
  averageCartTotal: number;
  cartConversionRate: number;
  checkoutCompletionRate: number;
  demoUsageRate: number;
  realAccountUsageRate: number;
  topOpenedRecipes: Array<{ recipeTitle: string; count: number }>;
  topFavoritedRecipes: Array<{ recipeTitle: string; count: number }>;
};

export type FeedbackType =
  | 'liked'
  | 'confusing'
  | 'bug'
  | 'missing_feature'
  | 'idea';

export type FeedbackPayload = {
  userId?: string;
  userEmail?: string;
  userName?: string;
  screenName: string;
  feedbackType: FeedbackType;
  message?: string;
  rating?: number;
  isBetaTester?: boolean;
  isDemoMode?: boolean;
  extraData?: Record<string, string | number | boolean | null | undefined>;
};

export type FeedbackItem = FeedbackPayload & {
  id: string;
  createdAt?: string;
};

export type MiniSurveyPayload = {
  userId?: string;
  userEmail?: string;
  screenName: string;
  question: string;
  answer: string;
  relatedEvent: string;
  isBetaTester?: boolean;
  isDemoMode?: boolean;
};

export type MiniSurveyResponse = MiniSurveyPayload & {
  id: string;
  createdAt?: string;
};

export type FeedbackStats = {
  betaTesterCount: number;
  totalFeedback: number;
  averageRating: number;
  topFeedbackScreen: string;
  mostLikedScreen: string;
  topBugScreen: string;
  topConfusingScreen: string;
  recentFeedback: FeedbackItem[];
  surveyAnswerDistribution: Record<string, Record<string, number>>;
  marketOrderIntent: {
    yes: number;
    maybe: number;
    no: number;
    total: number;
  };
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
  source?: 'recipe' | 'smartBasket' | 'familyList' | 'sponsored';
  sourceLabel?: string;
  marketName?: string;
  deliveryEstimate?: string;
  commissionEstimate?: number;
  averageBasket?: number;
  conversionRate?: number;
  sponsoredProductId?: string;
  brandName?: string;
  sponsorLabel?: string;
};

export type PurchaseMode = 'home' | 'market' | 'restaurant';

export type RestaurantTag =
  | 'Ev yemeği'
  | 'Hızlı teslimat'
  | 'Ekonomik'
  | 'Premium'
  | 'Şef önerisi'
  | 'Kampanyalı'
  | 'Sponsorlu';

export type RestaurantOption = {
  id: string;
  recipeId: string;
  name: string;
  rating: number;
  deliveryEstimate: string;
  portionPrice: number;
  minBasket: number;
  deliveryFee: number;
  tags: RestaurantTag[];
  label?: string;
  sponsored?: boolean;
  featured?: boolean;
  commissionRate: number;
};

export type RestaurantCartItem = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  restaurantId: string;
  restaurantName: string;
  portionPrice: number;
  quantity: number;
  deliveryFee: number;
  deliveryEstimate: string;
  tags: RestaurantTag[];
  sourceLabel: string;
  commissionRate: number;
  commissionEstimate: number;
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
  priceMultiplier: number;
  priceHint: string;
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
  marketPriceMultiplier?: number;
};

export type OrderStatus = 'new' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';

export type PaymentStatus = 'demo' | 'pending' | 'paid' | 'failed' | 'refunded';

export type RelatedRecipeSummary = {
  recipeId: string;
  recipeTitle: string;
};

export type Order = {
  id: string;
  orderId?: string;
  orderNumber?: string;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  items: CartItem[];
  relatedRecipes?: RelatedRecipeSummary[];
  address: string;
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  serviceFee?: number;
  marketName?: string;
  deliveryEstimate?: string;
  deliverySlot?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  isPaid?: boolean;
  isDemoOrder?: boolean;
  userNote?: string;
  commissionEstimate?: number;
  averageBasket?: number;
  conversionRate?: number;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
  status: OrderStatus;
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
  socialMarketReady?: boolean;
  socialRestaurantReady?: boolean;
};

export type SocialUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  coverImageUrl: string;
  bio: string;
  location: string;
  followers: number;
  following: number;
  recipeCount: number;
  totalLikes: number;
  averageRating: number;
  badges: string[];
  level: string;
  isVerified?: boolean;
  expertiseAreas: string[];
};

export type SocialRecipePost = {
  id: string;
  recipeId: string;
  authorId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  prepTime: number;
  cookTime: number;
  totalTime: number;
  difficulty: Difficulty;
  servings: number;
  likes: number;
  commentsCount: number;
  saves: number;
  marketBasketPrice: number;
  restaurantOrderAvailable: boolean;
  restaurantStartPrice?: number;
  commercialBadges: string[];
  nutrition?: {
    calories: number;
    protein?: number;
  };
  createdAt: string;
  tip: string;
};

export type SocialPostType =
  | 'recipe'
  | 'note'
  | 'basket'
  | 'restaurant'
  | 'poll'
  | 'challenge'
  | 'tried';

export type SocialPollOption = {
  id: string;
  label: string;
  votes: number;
};

export type SocialChallengeData = {
  title: string;
  description: string;
  participants: number;
  reward: string;
};

export type SocialFeedPost = {
  id: string;
  type: SocialPostType;
  authorId: string;
  recipeId?: string;
  title: string;
  text: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  likes: number;
  commentsCount: number;
  saves: number;
  shares: number;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  difficulty?: Difficulty;
  servings?: number;
  marketBasketPrice?: number;
  restaurantOrderAvailable?: boolean;
  restaurantStartPrice?: number;
  commercialBadges?: string[];
  pollOptions?: SocialPollOption[];
  challengeData?: SocialChallengeData;
};

export type SocialComment = {
  id: string;
  recipeId: string;
  userId: string;
  text: string;
  likes: number;
  createdAt: string;
  liked?: boolean;
  chefReply?: {
    userId: string;
    text: string;
    createdAt: string;
  };
};

export type SocialActivity = {
  id: string;
  type: 'like' | 'follow' | 'comment' | 'bot' | 'save' | 'campaign' | 'tried' | 'collection' | 'recipe';
  actorId: string;
  targetId?: string;
  text: string;
  createdAt: string;
  imageUrl?: string;
  isRead?: boolean;
};

export type SocialCollection = {
  id: string;
  userId: string;
  title: string;
  description: string;
  recipeIds: string[];
  coverImageUrl: string;
  saves?: number;
  ownerId?: string;
};

export type SocialPostStats = {
  likes: number;
  commentsCount: number;
  saves: number;
};

export type SocialStory = {
  id: string;
  authorId: string;
  recipeId?: string;
  imageUrl: string;
  text: string;
  createdAt: string;
};

export type SocialNotification = {
  id: string;
  type: SocialActivity['type'];
  actorId: string;
  targetId?: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  imageUrl?: string;
};

export type TriedRecipePost = {
  id: string;
  userId: string;
  recipeId: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  createdAt: string;
};
