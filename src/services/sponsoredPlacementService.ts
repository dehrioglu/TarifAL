import { demoSponsoredCollections, demoSponsoredProducts } from '../data/demoSponsoredProducts';
import {
  AnalyticsEventPayload,
  CartItem,
  Recipe,
  SponsoredCollection,
  SponsoredPlacementType,
  SponsoredProduct,
} from '../types';
import { normalizeIngredientText } from '../utils/recipeMatching';
import { trackEvent } from './analyticsService';

type SponsoredContext = {
  recipeId?: string;
  recipeTitle?: string;
  sourceScreen?: string;
  userId?: string;
  userEmail?: string;
  isDemoMode?: boolean;
};

const isCampaignActive = (product: SponsoredProduct) => {
  if (!product.isActive) {
    return false;
  }

  const now = Date.now();
  const startsAt = product.campaignStartAt ? Date.parse(product.campaignStartAt) : undefined;
  const endsAt = product.campaignEndAt ? Date.parse(product.campaignEndAt) : undefined;

  return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
};

const includesAny = (source: string, targets: string[]) => {
  const normalizedSource = normalizeIngredientText(source);

  return targets.some((target) => {
    const normalizedTarget = normalizeIngredientText(target);
    return normalizedSource.includes(normalizedTarget) || normalizedTarget.includes(normalizedSource);
  });
};

const getProductScoreForRecipe = (product: SponsoredProduct, recipe: Recipe) => {
  const recipeText = [
    recipe.title,
    recipe.description,
    recipe.category,
    ...recipe.tags,
    ...recipe.ingredients.map((ingredient) => ingredient.name),
  ].join(' ');

  let score = product.priority;

  if (includesAny(recipeText, product.targetIngredients)) {
    score += 45;
  }

  if (product.targetRecipeCategories.some((category) => normalizeIngredientText(category) === normalizeIngredientText(recipe.category))) {
    score += 28;
  }

  if (includesAny(recipeText, product.targetKeywords)) {
    score += 22;
  }

  return score;
};

const sortByScore = <T extends SponsoredProduct>(
  products: T[],
  getScore: (product: T) => number,
) => [...products].sort((first, second) => getScore(second) - getScore(first));

export const getSponsoredProductsForRecipe = (
  recipe: Recipe,
  placementType: SponsoredPlacementType = 'recipe_detail',
  limit = 1,
) =>
  sortByScore(
    demoSponsoredProducts.filter(
      (product) => isCampaignActive(product) && product.placementTypes.includes(placementType),
    ),
    (product) => getProductScoreForRecipe(product, recipe),
  )
    .filter((product) => getProductScoreForRecipe(product, recipe) > product.priority)
    .slice(0, limit);

export const getSponsoredProductsForIngredient = (
  ingredientName: string,
  placementType: SponsoredPlacementType = 'missing_items',
  limit = 2,
) =>
  sortByScore(
    demoSponsoredProducts.filter(
      (product) =>
        isCampaignActive(product) &&
        product.placementTypes.includes(placementType) &&
        includesAny(ingredientName, product.targetIngredients),
    ),
    (product) => product.priority,
  ).slice(0, limit);

export const getSponsoredProductsForCart = (cartItems: CartItem[], limit = 1) => {
  if (cartItems.length === 0) {
    return [];
  }

  const cartText = cartItems
    .map((item) => `${item.name} ${item.ingredientId} ${item.recipeTitle}`)
    .join(' ');
  const existingProductIds = new Set(cartItems.map((item) => item.sponsoredProductId).filter(Boolean));
  const existingNames = cartItems.map((item) => normalizeIngredientText(item.name));

  return sortByScore(
    demoSponsoredProducts.filter((product) => {
      if (!isCampaignActive(product) || !product.placementTypes.includes('cart')) {
        return false;
      }

      if (existingProductIds.has(product.id)) {
        return false;
      }

      const normalizedProduct = normalizeIngredientText(product.productName);
      if (existingNames.some((name) => name.includes(normalizedProduct) || normalizedProduct.includes(name))) {
        return false;
      }

      return includesAny(cartText, product.targetIngredients) || includesAny(cartText, product.targetKeywords);
    }),
    (product) => product.priority,
  ).slice(0, limit);
};

export const getSponsoredCollectionsForDiscover = (limit = 3): SponsoredCollection[] =>
  demoSponsoredCollections.filter((collection) => collection.isActive).slice(0, limit);

export const getSponsoredCollectionForDiscover = (): SponsoredCollection | undefined =>
  getSponsoredCollectionsForDiscover(1)[0];

const trackSponsoredEvent = (
  eventName: Parameters<typeof trackEvent>[0],
  product: SponsoredProduct,
  placementType: SponsoredPlacementType,
  context: SponsoredContext = {},
) => {
  const payload: AnalyticsEventPayload = {
    userId: context.userId,
    userEmail: context.userEmail,
    recipeId: context.recipeId,
    recipeTitle: context.recipeTitle,
    sourceScreen: context.sourceScreen,
    isDemoMode: context.isDemoMode,
    cartTotal: product.price,
    extraData: {
      sponsoredProductId: product.id,
      brandName: product.brandName,
      productName: product.productName,
      campaignName: product.campaignName,
      placementType,
      price: product.price,
    },
  };

  void trackEvent(eventName, payload);
};

export const trackSponsoredImpression = (
  product: SponsoredProduct,
  placementType: SponsoredPlacementType,
  context?: SponsoredContext,
) => trackSponsoredEvent('sponsored_impression', product, placementType, context);

export const trackSponsoredClick = (
  product: SponsoredProduct,
  placementType: SponsoredPlacementType,
  context?: SponsoredContext,
) => trackSponsoredEvent('sponsored_click', product, placementType, context);

export const trackSponsoredCartAdd = (
  product: SponsoredProduct,
  placementType: SponsoredPlacementType,
  context?: SponsoredContext,
) => trackSponsoredEvent('sponsored_added_to_cart', product, placementType, context);

export const trackSponsoredAlternativeViewed = (
  product: SponsoredProduct,
  placementType: SponsoredPlacementType,
  context?: SponsoredContext,
) => trackSponsoredEvent('sponsored_alternative_viewed', product, placementType, context);

export const trackSponsoredCollectionOpened = (
  collection: SponsoredCollection,
  context: SponsoredContext = {},
) => {
  void trackEvent('sponsored_collection_opened', {
    userId: context.userId,
    userEmail: context.userEmail,
    sourceScreen: context.sourceScreen ?? 'Discover',
    isDemoMode: context.isDemoMode,
    extraData: {
      collectionId: collection.id,
      brandName: collection.brandName,
      title: collection.title,
      productCount: collection.productIds.length,
      recipeCount: collection.recipeIds.length,
    },
  });
};
