export type DemoDetectedIngredient = {
  id: string;
  name: string;
  confidence: number;
  hint: string;
};

export const demoVisionAnalysisSteps = [
  'Görüntü analiz ediliyor...',
  'Malzemeler tanınıyor...',
  'Tarif uyumu hesaplanıyor...',
  'Akıllı Sepet için hazırlık yapılıyor...',
];

export const demoDetectedIngredients: DemoDetectedIngredient[] = [
  {
    id: 'vision-domates',
    name: 'Domates',
    confidence: 96,
    hint: 'Tezgah / sebzelik',
  },
  {
    id: 'vision-yumurta',
    name: 'Yumurta',
    confidence: 93,
    hint: 'Kahvaltılık',
  },
  {
    id: 'vision-peynir',
    name: 'Peynir',
    confidence: 88,
    hint: 'Süt ürünü',
  },
  {
    id: 'vision-tavuk',
    name: 'Tavuk',
    confidence: 84,
    hint: 'Protein',
  },
  {
    id: 'vision-yogurt',
    name: 'Yoğurt',
    confidence: 81,
    hint: 'Süt ürünü',
  },
];

export const demoVisionMetrics = [
  {
    id: 'detected',
    label: 'Tanınan malzeme',
    value: '5',
  },
  {
    id: 'ready-recipes',
    label: 'Olası tarif',
    value: '8',
  },
  {
    id: 'missing',
    label: 'Sepete dönüşebilir eksik',
    value: '6',
  },
];
