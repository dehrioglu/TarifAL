import type { Business, PartnerRole, PartnerUser } from '../types';

export const isAdmin = (user: PartnerUser): boolean => user.role === 'admin';

export const canAccessBusiness = (user: PartnerUser, businessId: string): boolean =>
  user.role === 'admin' || user.businessId === businessId;

export const canManageCatalog = (role: PartnerRole): boolean =>
  role === 'admin' || role === 'restaurant_owner' || role === 'market_owner' || role === 'brand_manager';

export const canUpdateOrderStatus = (role: PartnerRole): boolean =>
  role === 'admin' || role === 'restaurant_owner' || role === 'market_owner' || role === 'staff';

export const getUserBusiness = (businesses: Business[], user: PartnerUser): Business | undefined =>
  businesses.find((business) => business.id === user.businessId);

export const filterBusinessesForUser = (businesses: Business[], user: PartnerUser): Business[] => {
  if (user.role === 'admin') {
    return businesses;
  }

  return businesses.filter((business) => business.id === user.businessId);
};
