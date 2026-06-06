import {
  SmartBasketBudgetMode,
  SmartBasketMarketInfo,
  SmartBasketMetric,
} from '../types';

export const demoSmartBasketMarket: SmartBasketMarketInfo = {
  name: 'TarifAL Market',
  deliveryEstimate: '30-45 dk',
  commissionRate: 0.084,
  averageBasket: 214,
  conversionRate: 42,
};

export const smartBasketBudgetModes: SmartBasketBudgetMode[] = [
  {
    id: 'under-150',
    label: '150 TL altı',
    helper: 'Ay sonu ve öğrenci modu için düşük maliyetli öneriler.',
    badge: 'Bütçe Dostu',
    limit: 150,
  },
  {
    id: 'under-250',
    label: '250 TL altı',
    helper: '2-3 kişilik pratik akşam yemekleri için dengeli bütçe.',
    badge: 'En Dengeli',
    limit: 250,
  },
  {
    id: 'under-500',
    label: '500 TL altı',
    helper: 'Daha doyurucu ve aileye uygun tarif planları.',
    badge: 'Aile Boyu',
    limit: 500,
  },
  {
    id: 'family',
    label: 'Aile boyu',
    helper: '4+ kişilik doyurucu yemekler ve birleşik market listesi.',
    badge: '4 Kişilik',
    limit: 650,
  },
  {
    id: 'end-month',
    label: 'Ay sonu modu',
    helper: 'Evde olan malzemeleri en iyi değerlendiren ekonomik plan.',
    badge: 'Kurtarıcı',
    limit: 120,
  },
];

export const smartBasketQuickIngredients = [
  'Yumurta',
  'Domates',
  'Tavuk',
  'Makarna',
  'Yoğurt',
  'Peynir',
  'Soğan',
  'Patates',
  'Mercimek',
  'Bulgur',
  'Pirinç',
  'Biber',
];

export const demoSmartBasketMetrics: SmartBasketMetric[] = [
  {
    id: 'average-basket',
    label: 'Ortalama sepet',
    value: '₺214',
    helper: 'Demo simülasyon',
  },
  {
    id: 'commission',
    label: 'Tahmini komisyon',
    value: '₺18',
    helper: 'Market yönlendirme',
  },
  {
    id: 'conversion',
    label: 'Sepete dönüşüm',
    value: '%42',
    helper: 'Tariften markete',
  },
  {
    id: 'delivery',
    label: 'Demo teslimat',
    value: '30-45 dk',
    helper: 'Market eşleşmesi',
  },
];
