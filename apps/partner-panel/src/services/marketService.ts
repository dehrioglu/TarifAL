import { demoMarketProducts } from '../data/demoData';
import type { MarketProduct, PartnerUser } from '../types';
import { canAccessBusiness } from '../utils/access';

type MarketProductDraft = Omit<MarketProduct, 'id' | 'createdAt' | 'updatedAt'>;

export const marketService = {
  getProductsForUser(user: PartnerUser): MarketProduct[] {
    if (user.role === 'restaurant_owner' || user.role === 'brand_manager' || user.role === 'staff') {
      return [];
    }

    if (user.role === 'admin') {
      return demoMarketProducts;
    }

    return demoMarketProducts.filter((product) => canAccessBusiness(user, product.businessId));
  },

  addProduct(draft: MarketProductDraft): MarketProduct {
    const product: MarketProduct = {
      ...draft,
      id: `market-product-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    demoMarketProducts.unshift(product);
    return product;
  },

  updateStock(productId: string, stockQuantity: number): MarketProduct | undefined {
    const product = demoMarketProducts.find((item) => item.id === productId);
    if (!product) {
      return undefined;
    }

    product.stockQuantity = Math.max(0, stockQuantity);
    product.isAvailable = product.stockQuantity > 0;
    product.updatedAt = new Date().toISOString();
    return product;
  },
};
