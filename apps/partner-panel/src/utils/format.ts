import type { BusinessType, CampaignType, OrderStatus, PartnerRole, PaymentStatus } from '../types';

export const currency = (value: number): string =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);

export const numberCompact = (value: number): string => new Intl.NumberFormat('tr-TR').format(value);

export const percent = (value: number): string => `%${Math.round(value)}`;

export const dateTime = (iso: string): string =>
  new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

export const roleLabels: Record<PartnerRole, string> = {
  admin: 'Admin',
  restaurant_owner: 'Restoran Sahibi',
  market_owner: 'Market Yöneticisi',
  brand_manager: 'Marka Yöneticisi',
  staff: 'Personel',
};

export const businessTypeLabels: Record<BusinessType, string> = {
  admin: 'TarifAL',
  restaurant: 'Restoran',
  market: 'Market',
  brand: 'Marka',
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  new: 'Yeni',
  accepted: 'Kabul edildi',
  preparing: 'Hazırlanıyor',
  ready: 'Teslimata hazır',
  on_the_way: 'Yolda',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: 'Ödendi',
  pending: 'Bekliyor',
  refunded: 'İade',
};

export const campaignTypeLabels: Record<CampaignType, string> = {
  product_discount: 'Ürün indirimi',
  menu_discount: 'Menü indirimi',
  sponsored_product: 'Sponsorlu ürün',
  cart_discount: 'Sepette indirim',
  recipe_category: 'Tarif kategorisi',
  first_order: 'İlk sipariş indirimi',
};
