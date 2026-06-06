import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';

import {
  AnalyticsEventName,
  AnalyticsEventPayload,
  AnalyticsMetricSummary,
} from '../types';
import { COLLECTIONS, db } from './firebase';

type StoredAnalyticsEvent = AnalyticsEventPayload & {
  eventName?: AnalyticsEventName;
};

const emptySummary: AnalyticsMetricSummary = {
  totalUsers: 0,
  totalEvents: 0,
  recipeOpenCount: 0,
  favoriteCount: 0,
  cartCreatedCount: 0,
  checkoutCompletedCount: 0,
  averageCartTotal: 0,
  cartConversionRate: 0,
  checkoutCompletionRate: 0,
  demoUsageRate: 0,
  realAccountUsageRate: 0,
  topOpenedRecipes: [],
  topFavoritedRecipes: [],
};

const cleanExtraData = (extraData?: AnalyticsEventPayload['extraData']) => {
  if (!extraData) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(extraData).filter(([, value]) => value !== undefined),
  );
};

export const trackEvent = async (
  eventName: AnalyticsEventName,
  payload: AnalyticsEventPayload = {},
) => {
  if (!db || payload.isDemoMode || !payload.userId || payload.userId === 'demo-user') {
    return;
  }

  try {
    await addDoc(collection(db, COLLECTIONS.analyticsEvents), {
      eventName,
      userId: payload.userId ?? 'demo-user',
      userEmail: payload.userEmail ?? null,
      recipeId: payload.recipeId ?? null,
      recipeTitle: payload.recipeTitle ?? null,
      cartTotal: payload.cartTotal ?? null,
      sourceScreen: payload.sourceScreen ?? null,
      isDemoMode: Boolean(payload.isDemoMode),
      extraData: cleanExtraData(payload.extraData) ?? {},
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('Analytics event gönderilemedi:', eventName, error);
    }
  }
};

const countByRecipeTitle = (events: StoredAnalyticsEvent[], eventName: AnalyticsEventName) => {
  const counts = events.reduce<Record<string, number>>((acc, event) => {
    if (event.eventName !== eventName || !event.recipeTitle) {
      return acc;
    }

    acc[event.recipeTitle] = (acc[event.recipeTitle] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([recipeTitle, count]) => ({ recipeTitle, count }))
    .sort((first, second) => second.count - first.count)
    .slice(0, 5);
};

export const fetchFounderAnalyticsSummary = async (): Promise<AnalyticsMetricSummary> => {
  if (!db) {
    return emptySummary;
  }

  try {
    const [usersSnapshot, eventsSnapshot] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.users)),
      getDocs(collection(db, COLLECTIONS.analyticsEvents)),
    ]);
    const events = eventsSnapshot.docs.map((eventDoc) => eventDoc.data() as StoredAnalyticsEvent);
    const totalEvents = events.length;
    const recipeOpenCount = events.filter((event) => event.eventName === 'recipe_opened').length;
    const favoriteCount = events.filter((event) => event.eventName === 'recipe_favorited').length;
    const cartCreatedCount = events.filter((event) =>
      event.eventName === 'smart_cart_created' ||
      event.eventName === 'missing_items_added_to_cart' ||
      event.eventName === 'cart_item_added',
    ).length;
    const checkoutStartedCount = events.filter((event) => event.eventName === 'checkout_demo_started').length;
    const checkoutCompletedCount = events.filter((event) => event.eventName === 'checkout_demo_completed').length;
    const cartTotals = events
      .map((event) => event.cartTotal)
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    const demoEvents = events.filter((event) => event.isDemoMode).length;
    const realEvents = totalEvents - demoEvents;

    return {
      totalUsers: usersSnapshot.size,
      totalEvents,
      recipeOpenCount,
      favoriteCount,
      cartCreatedCount,
      checkoutCompletedCount,
      averageCartTotal:
        cartTotals.length > 0
          ? Math.round(cartTotals.reduce((sum, value) => sum + value, 0) / cartTotals.length)
          : 0,
      cartConversionRate: recipeOpenCount > 0 ? Math.round((cartCreatedCount / recipeOpenCount) * 100) : 0,
      checkoutCompletionRate:
        checkoutStartedCount > 0 ? Math.round((checkoutCompletedCount / checkoutStartedCount) * 100) : 0,
      demoUsageRate: totalEvents > 0 ? Math.round((demoEvents / totalEvents) * 100) : 0,
      realAccountUsageRate: totalEvents > 0 ? Math.round((realEvents / totalEvents) * 100) : 0,
      topOpenedRecipes: countByRecipeTitle(events, 'recipe_opened'),
      topFavoritedRecipes: countByRecipeTitle(events, 'recipe_favorited'),
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('Kurucu metrikleri alınamadı:', error);
    }

    return emptySummary;
  }
};
