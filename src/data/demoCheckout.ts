import {
  DemoDeliverySlot,
  DemoMarketOption,
  DemoPaymentMethod,
  DemoTrackingStep,
} from '../types';

export const demoMarketOptions: DemoMarketOption[] = [
  {
    id: 'demo-market',
    name: 'Demo Market',
    badge: 'En dengeli',
    description: 'Tarif eksiklerini hızlı ve dengeli fiyatla tamamlar.',
    deliveryEstimate: '30-45 dk',
    deliveryFee: 29,
    serviceFee: 8,
    rating: 4.8,
    commissionRate: 0.085,
  },
  {
    id: 'hizli-market',
    name: 'Hızlı Market',
    badge: 'En hızlı',
    description: 'Acil akşam yemeği için daha kısa teslimat simülasyonu.',
    deliveryEstimate: '20-30 dk',
    deliveryFee: 39,
    serviceFee: 10,
    rating: 4.7,
    commissionRate: 0.092,
  },
  {
    id: 'ekonomik-market',
    name: 'Ekonomik Market',
    badge: 'Bütçe dostu',
    description: 'Daha uygun fiyatlı muadil ürünlerle sepeti optimize eder.',
    deliveryEstimate: '45-60 dk',
    deliveryFee: 19,
    serviceFee: 6,
    rating: 4.6,
    commissionRate: 0.075,
  },
];

export const demoDeliverySlots: DemoDeliverySlot[] = [
  {
    id: 'now',
    label: 'Hemen',
    helper: 'Akşam yemeği için en hızlı seçenek.',
    estimate: '30-45 dk',
  },
  {
    id: 'evening',
    label: 'Bugün akşam',
    helper: '18:00 - 20:00 arası planlı teslimat.',
    estimate: '18:00 - 20:00',
  },
  {
    id: 'morning',
    label: 'Yarın sabah',
    helper: 'Haftalık plan için sakin teslimat.',
    estimate: '09:00 - 11:00',
  },
];

export const demoPaymentMethods: DemoPaymentMethod[] = [
  {
    id: 'mock-card',
    label: 'Demo Kart',
    helper: 'Gerçek ödeme alınmaz, yatırımcı demosu için simüle edilir.',
    badge: 'Mock ödeme',
  },
  {
    id: 'wallet',
    label: 'TarifAL Cüzdan',
    helper: 'Gelecekte sadakat ve abonelik modeline bağlanabilir.',
    badge: 'Yakında',
  },
];

export const demoCheckoutMetrics = {
  averageBasket: 214,
  conversionRate: 42,
  repeatPotential: 31,
  subscriptionLift: 18,
};

export const demoCheckoutTrackingSteps: DemoTrackingStep[] = [
  {
    id: 'received',
    title: 'Sipariş alındı',
    description: 'Eksik ürünler market sepetine dönüştürüldü.',
    icon: 'checkmark-circle',
  },
  {
    id: 'preparing',
    title: 'Ürünler hazırlanıyor',
    description: 'Demo Market ürünleri tarif bazlı kontrol ediyor.',
    icon: 'basket',
  },
  {
    id: 'courier',
    title: 'Teslimat yolda',
    description: '30-45 dk içinde mutfağına ulaşacak şekilde planlandı.',
    icon: 'bicycle',
  },
  {
    id: 'cook',
    title: 'Pişirmeye hazır',
    description: 'Ürünler tamamlanınca tarif moduna geçebilirsin.',
    icon: 'restaurant',
  },
];

export const demoCheckoutAlternatives = [
  {
    id: 'budget',
    title: 'Bütçe optimizasyonu',
    description: '2 üründe daha uygun muadil önerildi.',
    value: '₺24 tasarruf',
  },
  {
    id: 'healthy',
    title: 'Sağlıklı seçim',
    description: 'Yoğurt ve makarna için daha dengeli alternatif hazır.',
    value: '+%12 uygunluk',
  },
  {
    id: 'stock',
    title: 'Stok güvenliği',
    description: 'Stok riski olan ürünler için otomatik yedek plan var.',
    value: '3 muadil',
  },
];
