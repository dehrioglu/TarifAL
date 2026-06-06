import { demoRestaurantItems } from '../data/demoData';
import type { PartnerUser, RestaurantItem } from '../types';
import { canAccessBusiness } from '../utils/access';

type RestaurantItemDraft = Omit<RestaurantItem, 'id' | 'createdAt' | 'updatedAt'>;

export const restaurantService = {
  getItemsForUser(user: PartnerUser): RestaurantItem[] {
    if (user.role === 'market_owner' || user.role === 'brand_manager') {
      return [];
    }

    if (user.role === 'admin') {
      return demoRestaurantItems;
    }

    return demoRestaurantItems.filter((item) => canAccessBusiness(user, item.businessId));
  },

  addItem(draft: RestaurantItemDraft): RestaurantItem {
    const item: RestaurantItem = {
      ...draft,
      id: `rest-item-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    demoRestaurantItems.unshift(item);
    return item;
  },

  updateAvailability(itemId: string): RestaurantItem | undefined {
    const item = demoRestaurantItems.find((restaurantItem) => restaurantItem.id === itemId);
    if (!item) {
      return undefined;
    }

    item.isAvailable = !item.isAvailable;
    item.updatedAt = new Date().toISOString();
    return item;
  },
};
