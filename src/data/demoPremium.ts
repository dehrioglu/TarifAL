import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type DemoMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  icon: IconName;
};

export type DemoBadge = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  unlocked: boolean;
};

export type WasteIngredient = {
  id: string;
  name: string;
  daysLeft: number;
  suggestion: string;
};

export type HomeActivity = {
  id: string;
  actor: string;
  text: string;
  time: string;
};

export const demoInvestorMetrics: DemoMetric[] = [
  {
    id: 'recipes',
    label: 'Bugün önerilen',
    value: '18 tarif',
    helper: 'AI öneri motoru',
    icon: 'sparkles-outline',
  },
  {
    id: 'carts',
    label: 'Oluşan sepet',
    value: '7 sepet',
    helper: 'Tariften markete',
    icon: 'cart-outline',
  },
  {
    id: 'conversion',
    label: 'Sepete dönüşüm',
    value: '%42',
    helper: 'Demo metrik',
    icon: 'trending-up-outline',
  },
  {
    id: 'commission',
    label: 'Komisyon potansiyeli',
    value: '₺126',
    helper: 'Günlük tahmin',
    icon: 'cash-outline',
  },
];

export const demoBadges: DemoBadge[] = [
  {
    id: 'first-recipe',
    title: 'İlk Tarif',
    description: 'İlk tarifi pişirme listene aldın.',
    icon: 'restaurant-outline',
    unlocked: true,
  },
  {
    id: 'budget-chef',
    title: 'Ekonomik Şef',
    description: 'Bütçe dostu tarifleri keşfettin.',
    icon: 'wallet-outline',
    unlocked: true,
  },
  {
    id: 'waste-hunter',
    title: 'İsraf Avcısı',
    description: 'Dolaptaki ürünleri değerlendirdin.',
    icon: 'leaf-outline',
    unlocked: false,
  },
  {
    id: 'planner',
    title: 'Haftalık Planlayıcı',
    description: '7 günlük planı market listesine çevirdin.',
    icon: 'calendar-number-outline',
    unlocked: false,
  },
];

export const demoWasteIngredients: WasteIngredient[] = [
  {
    id: 'waste-yogurt',
    name: 'Yoğurt',
    daysLeft: 2,
    suggestion: 'Yoğurtlu makarna ve fırında tavuk için iyi eşleşir.',
  },
  {
    id: 'waste-milk',
    name: 'Süt',
    daysLeft: 3,
    suggestion: 'Pankek, sütlaç veya omlet için kullanılabilir.',
  },
  {
    id: 'waste-egg',
    name: 'Yumurta',
    daysLeft: 4,
    suggestion: 'Menemen ve omlet önerilerini güçlendirir.',
  },
];

export const demoHomeActivities: HomeActivity[] = [
  { id: 'home-1', actor: 'Sen', text: 'Akşam yemeği için tavuk eklendi.', time: '10 dk önce' },
  { id: 'home-2', actor: 'Anne', text: 'Yumurta az kaldı notu bıraktı.', time: '32 dk önce' },
  { id: 'home-3', actor: 'Ev Listesi', text: 'Süt ve yoğurt tekrar eden ürünlerde birleştirildi.', time: '1 saat önce' },
];

export const demoKitchenLevel = {
  level: 3,
  title: 'Pratik Şef',
  weeklyRecipes: 4,
  streakDays: 2,
  progress: 68,
  nextReward: 'Haftalık Planlayıcı',
};

export const budgetModes = [
  '150 TL altı',
  '250 TL altı',
  '4 kişilik ekonomik',
  'Ay sonu modu',
  'Öğrenci modu',
] as const;

export const todayModes = [
  {
    id: 'quick',
    title: 'Hızlı',
    description: '15-20 dakikada hazırlanabilecek tarifler.',
  },
  {
    id: 'budget',
    title: 'Ekonomik',
    description: 'Daha az maliyetli ve bütçe dostu seçenekler.',
  },
  {
    id: 'filling',
    title: 'Doyurucu',
    description: 'Aile veya tam öğün için daha doyurucu tarifler.',
  },
] as const;
