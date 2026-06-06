export type PartnerRole = 'admin' | 'restaurant_owner' | 'market_owner' | 'brand_manager' | 'staff';

export type BusinessType = 'admin' | 'restaurant' | 'market' | 'brand';

export type OrderType = 'restaurant' | 'market';

export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export type CampaignType =
  | 'product_discount'
  | 'menu_discount'
  | 'sponsored_product'
  | 'cart_discount'
  | 'recipe_category'
  | 'first_order';

export type DiscountType = 'percentage' | 'fixed' | 'free_delivery';

export type PlacementType = 'recipe_detail' | 'missing_items' | 'cart' | 'ai_chef' | 'discover_collection';

export interface PartnerUser {
  id: string;
  email: string;
  displayName: string;
  role: PartnerRole;
  businessId: string;
  businessType: BusinessType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  businessName: string;
  businessType: Exclude<BusinessType, 'admin'>;
  ownerUserId: string;
  email: string;
  phone: string;
  logoURL: string;
  coverImageURL: string;
  address: string;
  city: string;
  district: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantProfile {
  businessId: string;
  cuisineType: string;
  description: string;
  workingHours: string;
  minimumOrderAmount: number;
  deliveryTime: string;
  rating: number;
  isOpen: boolean;
}

export interface MarketProfile {
  businessId: string;
  deliveryZone: string;
  deliveryTime: string;
  minimumCartAmount: number;
  isOpen: boolean;
}

export interface RestaurantItem {
  id: string;
  businessId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageURL: string;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
  calories: number;
  isAvailable: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketProduct {
  id: string;
  businessId: string;
  productName: string;
  brandName: string;
  category: string;
  subCategory: string;
  price: number;
  discountedPrice?: number;
  unit: string;
  stockQuantity: number;
  imageURL: string;
  barcode: string;
  isAvailable: boolean;
  isSponsoredEligible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

export interface OrderTimelineItem {
  status: OrderStatus;
  label: string;
  time: string;
}

export interface PartnerOrder {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  businessId: string;
  businessName: string;
  type: OrderType;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  estimatedPreparationTime: string;
  deliveryAddress: string;
  relatedRecipe: string;
  isDemo: boolean;
  timeline: OrderTimelineItem[];
}

export interface SponsoredProduct {
  id: string;
  brandId: string;
  brandName: string;
  productName: string;
  category: string;
  imageURL: string;
  price: number;
  targetIngredients: string[];
  targetRecipeCategories: string[];
  targetKeywords: string[];
  placementTypes: PlacementType[];
  priority: number;
  budget: number;
  campaignStartAt: string;
  campaignEndAt: string;
  isActive: boolean;
  impressionCount: number;
  clickCount: number;
  cartAddCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  businessId: string;
  businessType: Exclude<BusinessType, 'admin'>;
  title: string;
  description: string;
  campaignType: CampaignType;
  discountType: DiscountType;
  discountValue: number;
  targetProducts: string[];
  targetCategories: string[];
  startAt: string;
  endAt: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerNotification {
  id: string;
  businessId: string;
  roleScope: PartnerRole[];
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  createdAt: string;
  isRead: boolean;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  tone: 'orange' | 'navy' | 'green' | 'red' | 'purple' | 'gray';
}

export interface PartnerReport {
  title: string;
  value: string;
  trend: string;
  series: number[];
}

export interface PartnerMenuItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  roles: PartnerRole[];
}

export interface ToastMessage {
  id: number;
  title: string;
  message: string;
  tone: 'success' | 'info' | 'warning' | 'danger';
}
