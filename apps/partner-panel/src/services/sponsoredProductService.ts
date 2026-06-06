import { demoSponsoredProducts } from '../data/demoData';
import type { PartnerUser, SponsoredProduct } from '../types';
import { canAccessBusiness } from '../utils/access';

type SponsoredProductDraft = Omit<
  SponsoredProduct,
  'id' | 'createdAt' | 'updatedAt' | 'impressionCount' | 'clickCount' | 'cartAddCount'
>;

export const sponsoredProductService = {
  getSponsoredProductsForUser(user: PartnerUser): SponsoredProduct[] {
    if (user.role === 'admin') {
      return demoSponsoredProducts;
    }

    if (user.role !== 'brand_manager') {
      return [];
    }

    return demoSponsoredProducts.filter((product) => canAccessBusiness(user, product.brandId));
  },

  addSponsoredProduct(draft: SponsoredProductDraft): SponsoredProduct {
    const item: SponsoredProduct = {
      ...draft,
      id: `sponsored-${Date.now()}`,
      impressionCount: 0,
      clickCount: 0,
      cartAddCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    demoSponsoredProducts.unshift(item);
    return item;
  },

  toggleActive(productId: string): SponsoredProduct | undefined {
    const product = demoSponsoredProducts.find((item) => item.id === productId);
    if (!product) {
      return undefined;
    }

    product.isActive = !product.isActive;
    product.updatedAt = new Date().toISOString();
    return product;
  },
};
