import { demoBusinesses, demoMarketProfiles, demoRestaurantProfiles } from '../data/demoData';
import type { Business, MarketProfile, PartnerUser, RestaurantProfile } from '../types';
import { filterBusinessesForUser } from '../utils/access';

export const businessService = {
  getBusinessesForUser(user: PartnerUser): Business[] {
    return filterBusinessesForUser(demoBusinesses, user);
  },

  getAllBusinesses(): Business[] {
    return demoBusinesses;
  },

  getBusinessById(businessId: string): Business | undefined {
    return demoBusinesses.find((business) => business.id === businessId);
  },

  getRestaurantProfile(businessId: string): RestaurantProfile | undefined {
    return demoRestaurantProfiles.find((profile) => profile.businessId === businessId);
  },

  getMarketProfile(businessId: string): MarketProfile | undefined {
    return demoMarketProfiles.find((profile) => profile.businessId === businessId);
  },

  toggleBusinessStatus(businessId: string): Business | undefined {
    const business = demoBusinesses.find((item) => item.id === businessId);
    if (!business) {
      return undefined;
    }

    business.isActive = !business.isActive;
    business.updatedAt = new Date().toISOString();
    return business;
  },
};
