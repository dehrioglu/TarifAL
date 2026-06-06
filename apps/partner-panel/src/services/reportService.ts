import { demoBusinesses, demoMarketProducts, demoOrders, demoSponsoredProducts } from '../data/demoData';
import type { DashboardMetric, PartnerReport, PartnerUser } from '../types';
import { canAccessBusiness } from '../utils/access';
import { currency, percent } from '../utils/format';

const sum = (values: number[]): number => values.reduce((acc, value) => acc + value, 0);

export const reportService = {
  getDashboardMetrics(user: PartnerUser): DashboardMetric[] {
    const orders = demoOrders.filter((order) => canAccessBusiness(user, order.businessId));
    const completedOrders = orders.filter((order) => order.status === 'completed');
    const pendingOrders = orders.filter((order) => order.status === 'new' || order.status === 'accepted');
    const orderVolume = sum(orders.map((order) => order.total));
    const averageBasket = orders.length > 0 ? orderVolume / orders.length : 0;

    if (user.role === 'admin') {
      const sponsoredImpressions = sum(demoSponsoredProducts.map((item) => item.impressionCount));
      const sponsoredCartAdds = sum(demoSponsoredProducts.map((item) => item.cartAddCount));
      return [
        { label: 'Toplam restoran', value: `${demoBusinesses.filter((b) => b.businessType === 'restaurant').length}`, detail: 'aktif/pasif işletmeler', tone: 'orange' },
        { label: 'Toplam market', value: `${demoBusinesses.filter((b) => b.businessType === 'market').length}`, detail: 'teslimat ağı', tone: 'navy' },
        { label: 'Toplam marka', value: `${demoBusinesses.filter((b) => b.businessType === 'brand').length}`, detail: 'sponsor adayları', tone: 'purple' },
        { label: 'Bugünkü sipariş', value: `${orders.length}`, detail: `${pendingOrders.length} bekleyen`, tone: 'green' },
        { label: 'Sipariş hacmi', value: currency(orderVolume), detail: `ortalama ${currency(averageBasket)}`, tone: 'orange' },
        { label: 'Sponsor dönüşümü', value: percent((sponsoredCartAdds / Math.max(sponsoredImpressions, 1)) * 100), detail: `${sponsoredCartAdds} sepete ekleme`, tone: 'purple' },
      ];
    }

    if (user.role === 'brand_manager') {
      const sponsored = demoSponsoredProducts.filter((item) => item.brandId === user.businessId);
      const impressions = sum(sponsored.map((item) => item.impressionCount));
      const clicks = sum(sponsored.map((item) => item.clickCount));
      const cartAdds = sum(sponsored.map((item) => item.cartAddCount));
      return [
        { label: 'Aktif kampanya', value: `${sponsored.filter((item) => item.isActive).length}`, detail: 'sponsorlu ürün', tone: 'orange' },
        { label: 'Gösterim', value: `${impressions.toLocaleString('tr-TR')}`, detail: 'tarif ve sepet alanları', tone: 'navy' },
        { label: 'Tıklama', value: `${clicks.toLocaleString('tr-TR')}`, detail: percent((clicks / Math.max(impressions, 1)) * 100), tone: 'purple' },
        { label: 'Sepete ekleme', value: `${cartAdds.toLocaleString('tr-TR')}`, detail: percent((cartAdds / Math.max(clicks, 1)) * 100), tone: 'green' },
      ];
    }

    if (user.role === 'market_owner') {
      const products = demoMarketProducts.filter((product) => product.businessId === user.businessId);
      const lowStock = products.filter((product) => product.stockQuantity <= 6);
      return [
        { label: 'Market siparişi', value: `${orders.length}`, detail: `${pendingOrders.length} bekleyen`, tone: 'orange' },
        { label: 'Düşük stok', value: `${lowStock.length}`, detail: 'hızlı kontrol gerekli', tone: lowStock.length > 0 ? 'red' : 'green' },
        { label: 'Ortalama sepet', value: currency(averageBasket), detail: 'demo satış ortalaması', tone: 'navy' },
        { label: 'Tahmini ciro', value: currency(orderVolume), detail: 'bugünkü hacim', tone: 'green' },
      ];
    }

    return [
      { label: 'Bugünkü sipariş', value: `${orders.length}`, detail: `${pendingOrders.length} yeni/kabul`, tone: 'orange' },
      { label: 'Hazırlanan', value: `${orders.filter((order) => order.status === 'preparing').length}`, detail: 'mutfak akışı', tone: 'navy' },
      { label: 'Tamamlanan', value: `${completedOrders.length}`, detail: 'günlük teslimat', tone: 'green' },
      { label: 'Tahmini ciro', value: currency(orderVolume), detail: `ortalama ${currency(averageBasket)}`, tone: 'purple' },
    ];
  },

  getReports(user: PartnerUser): PartnerReport[] {
    const metrics = this.getDashboardMetrics(user);
    return metrics.map((metric, index) => ({
      title: metric.label,
      value: metric.value,
      trend: index % 2 === 0 ? '+%12 geçen haftaya göre' : '+%7 son 7 gün',
      series: [18 + index * 4, 28 + index * 6, 34 + index * 3, 46 + index * 4, 58 + index * 5, 64 + index * 3],
    }));
  },
};
