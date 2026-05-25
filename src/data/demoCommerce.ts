import { Ingredient, IngredientBrandOption, RestaurantOption } from '../types';

export const commerceMarketDemo = {
  marketName: 'TarifAL Demo Market',
  deliveryEstimate: '30-45 dk',
  marketCommissionRate: 0.08,
  restaurantCommissionRate: 0.12,
  averageMarketBasket: 214,
  averageRestaurantBasket: 186,
  conversionRate: 0.42,
};

const normalizeIngredientName = (value: string) =>
  value
    .toLocaleLowerCase('tr-TR')
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const brand = (
  id: string,
  name: string,
  price: number,
  size: string,
  quality: IngredientBrandOption['quality'],
  campaign?: string,
  sponsored = false,
): IngredientBrandOption => ({
  id,
  name,
  price,
  size,
  quality,
  campaign,
  sponsored,
});

const brandCatalog: Record<string, IngredientBrandOption[]> = {
  bulgur: [
    brand('duru-bulgur', 'Duru Bulgur', 54.9, '1 kg', 'premium', 'Sponsorlu', true),
    brand('reis-bulgur', 'Reis Bulgur', 48.9, '1 kg', 'standard'),
    brand('migros-bulgur', 'Migros Bulgur', 39.9, '1 kg', 'economic', 'En uygun fiyat'),
    brand('yerel-bulgur', 'Yerel Marka Bulgur', 34.9, '900 gr', 'economic'),
  ],
  yumurta: [
    brand('gezen-yumurta', 'Gezen Tavuk Yumurta', 74.9, '10 adet', 'premium', 'Şef önerisi'),
    brand('migros-yumurta', 'Migros Yumurta', 58.9, '10 adet', 'standard'),
    brand('yerel-yumurta', 'Yerel Yumurta', 44.9, '10 adet', 'economic'),
  ],
  domates: [
    brand('sera-domates', 'Sera Domates', 39.9, '1 kg', 'standard'),
    brand('organik-domates', 'Organik Domates', 64.9, '1 kg', 'premium'),
    brand('pazar-domates', 'Pazar Domates', 29.9, '1 kg', 'economic', 'Kampanyalı'),
  ],
  'yesil-biber': [
    brand('tatli-biber', 'Tatlı Yeşil Biber', 34.9, '500 gr', 'standard'),
    brand('organik-biber', 'Organik Biber', 52.9, '500 gr', 'premium'),
    brand('ekonomik-biber', 'Ekonomik Biber', 24.9, '500 gr', 'economic'),
  ],
  'zeytinyagi': [
    brand('komili-zeytinyagi', 'Komili Zeytinyağı', 148.9, '500 ml', 'premium', 'Sponsorlu', true),
    brand('taris-zeytinyagi', 'Tariş Zeytinyağı', 136.9, '500 ml', 'premium'),
    brand('market-zeytinyagi', 'Market Zeytinyağı', 109.9, '500 ml', 'standard'),
  ],
  mercimek: [
    brand('duru-mercimek', 'Duru Kırmızı Mercimek', 59.9, '1 kg', 'premium'),
    brand('reis-mercimek', 'Reis Mercimek', 54.9, '1 kg', 'standard'),
    brand('migros-mercimek', 'Migros Mercimek', 42.9, '1 kg', 'economic', 'En uygun fiyat'),
  ],
  'kirmizi-mercimek': [
    brand('duru-mercimek', 'Duru Kırmızı Mercimek', 59.9, '1 kg', 'premium'),
    brand('reis-mercimek', 'Reis Mercimek', 54.9, '1 kg', 'standard'),
    brand('migros-mercimek', 'Migros Mercimek', 42.9, '1 kg', 'economic', 'En uygun fiyat'),
  ],
  sogan: [
    brand('organik-sogan', 'Organik Soğan', 32.9, '1 kg', 'premium'),
    brand('pazar-sogan', 'Pazar Soğan', 19.9, '1 kg', 'economic'),
    brand('market-sogan', 'Market Soğan', 24.9, '1 kg', 'standard'),
  ],
  patates: [
    brand('nevsehir-patates', 'Nevşehir Patates', 34.9, '1 kg', 'standard'),
    brand('organik-patates', 'Organik Patates', 49.9, '1 kg', 'premium'),
    brand('ekonomik-patates', 'Ekonomik Patates', 27.9, '1 kg', 'economic'),
  ],
  yogurt: [
    brand('sutas-yogurt', 'Sütaş Yoğurt', 74.9, '1 kg', 'premium'),
    brand('pinar-yogurt', 'Pınar Yoğurt', 69.9, '1 kg', 'standard'),
    brand('market-yogurt', 'Market Yoğurt', 52.9, '1 kg', 'economic', 'Kampanyalı'),
  ],
  makarna: [
    brand('barilla-makarna', 'Barilla Makarna', 44.9, '500 gr', 'premium', 'Sponsorlu', true),
    brand('filiz-makarna', 'Filiz Makarna', 31.9, '500 gr', 'standard'),
    brand('migros-makarna', 'Migros Makarna', 24.9, '500 gr', 'economic', 'En uygun fiyat'),
  ],
  tavuk: [
    brand('banvit-tavuk', 'Banvit Tavuk', 148.9, '600 gr', 'premium'),
    brand('sahinler-tavuk', 'Şahinler Tavuk', 126.9, '600 gr', 'standard'),
    brand('market-tavuk', 'Market Tavuk', 104.9, '600 gr', 'economic'),
  ],
  'tavuk-gogsu': [
    brand('banvit-tavuk', 'Banvit Tavuk Göğsü', 148.9, '600 gr', 'premium'),
    brand('sahinler-tavuk', 'Şahinler Tavuk Göğsü', 126.9, '600 gr', 'standard'),
    brand('market-tavuk', 'Market Tavuk Göğsü', 104.9, '600 gr', 'economic'),
  ],
  pirinc: [
    brand('baldo-pirinc', 'Baldo Pirinç', 69.9, '1 kg', 'premium'),
    brand('osmancik-pirinc', 'Osmancık Pirinç', 54.9, '1 kg', 'standard'),
    brand('market-pirinc', 'Market Pirinç', 44.9, '1 kg', 'economic'),
  ],
  un: [
    brand('sinangil-un', 'Sinangil Un', 43.9, '1 kg', 'premium'),
    brand('basak-un', 'Başak Un', 36.9, '1 kg', 'standard'),
    brand('market-un', 'Market Un', 29.9, '1 kg', 'economic'),
  ],
  sut: [
    brand('pinar-sut', 'Pınar Süt', 39.9, '1 lt', 'premium'),
    brand('sutas-sut', 'Sütaş Süt', 36.9, '1 lt', 'standard'),
    brand('market-sut', 'Market Süt', 29.9, '1 lt', 'economic'),
  ],
  kiyma: [
    brand('kasap-kiyma', 'Kasap Dana Kıyma', 189.9, '500 gr', 'premium'),
    brand('market-kiyma', 'Market Dana Kıyma', 154.9, '500 gr', 'standard'),
    brand('ekonomik-kiyma', 'Ekonomik Kıyma', 134.9, '500 gr', 'economic'),
  ],
};

const ingredientVisuals: Record<string, { image: string; category: string; defaultUnit: string }> = {
  yumurta: { image: '🥚', category: 'Kahvaltı', defaultUnit: 'adet' },
  domates: { image: '🍅', category: 'Sebze', defaultUnit: 'gr' },
  'yesil-biber': { image: '🫑', category: 'Sebze', defaultUnit: 'gr' },
  'zeytinyagi': { image: '🫒', category: 'Yağ', defaultUnit: 'ml' },
  mercimek: { image: '🥣', category: 'Bakliyat', defaultUnit: 'gr' },
  'kirmizi-mercimek': { image: '🥣', category: 'Bakliyat', defaultUnit: 'gr' },
  sogan: { image: '🧅', category: 'Sebze', defaultUnit: 'gr' },
  bulgur: { image: '🌾', category: 'Bakliyat', defaultUnit: 'gr' },
  pirinc: { image: '🍚', category: 'Bakliyat', defaultUnit: 'gr' },
  makarna: { image: '🍝', category: 'Makarna', defaultUnit: 'gr' },
  yogurt: { image: '🥛', category: 'Süt Ürünü', defaultUnit: 'gr' },
  sut: { image: '🥛', category: 'Süt Ürünü', defaultUnit: 'ml' },
  peynir: { image: '🧀', category: 'Süt Ürünü', defaultUnit: 'gr' },
  'beyaz-peynir': { image: '🧀', category: 'Süt Ürünü', defaultUnit: 'gr' },
  tavuk: { image: '🍗', category: 'Et', defaultUnit: 'gr' },
  'tavuk-gogsu': { image: '🍗', category: 'Et', defaultUnit: 'gr' },
  kiyma: { image: '🥩', category: 'Et', defaultUnit: 'gr' },
  patates: { image: '🥔', category: 'Sebze', defaultUnit: 'gr' },
  un: { image: '🌾', category: 'Temel Gıda', defaultUnit: 'gr' },
  seker: { image: '🍬', category: 'Temel Gıda', defaultUnit: 'gr' },
};

const fallbackBrands = (ingredient: Ingredient): IngredientBrandOption[] => [
  brand(`${ingredient.id}-standard`, `${ingredient.name} Standart`, Math.max(ingredient.price, 12), '1 paket', 'standard'),
  brand(`${ingredient.id}-economic`, `${ingredient.name} Ekonomik`, Math.max(ingredient.price - 8, 8), '1 paket', 'economic', 'En uygun fiyat'),
  brand(`${ingredient.id}-premium`, `${ingredient.name} Premium`, Math.max(ingredient.price + 18, 24), '1 paket', 'premium'),
];

export const enrichIngredientForCommerce = (ingredient: Ingredient): Ingredient => {
  const key = normalizeIngredientName(ingredient.name);
  const visual = ingredientVisuals[key] ?? {
    image: '🛒',
    category: 'Market',
    defaultUnit: 'gr',
  };

  return {
    ...ingredient,
    image: ingredient.image ?? visual.image,
    category: ingredient.category ?? visual.category,
    defaultUnit: ingredient.defaultUnit ?? visual.defaultUnit,
    quantity: ingredient.quantity ?? ingredient.gram,
    brands: ingredient.brands ?? brandCatalog[key] ?? fallbackBrands(ingredient),
  };
};

export const getBrandOptionsForIngredient = (ingredient: Ingredient) =>
  enrichIngredientForCommerce(ingredient).brands ?? fallbackBrands(ingredient);

export const demoRestaurantOptions: RestaurantOption[] = [
  {
    id: 'anadolu-lokantasi-kuru',
    recipeId: 'recipe-kuru-fasulye',
    name: 'Anadolu Lokantası',
    rating: 4.7,
    deliveryEstimate: '30-40 dk',
    portionPrice: 128,
    minBasket: 150,
    deliveryFee: 24,
    tags: ['Ev yemeği', 'Ekonomik'],
    label: 'Günün tenceresi',
    commissionRate: 0.12,
  },
  {
    id: 'ev-yemegi-mercimek',
    recipeId: 'recipe-mercimek',
    name: 'Ev Yemeği Mutfağı',
    rating: 4.8,
    deliveryEstimate: '25-35 dk',
    portionPrice: 74,
    minBasket: 120,
    deliveryFee: 18,
    tags: ['Ev yemeği', 'Hızlı teslimat'],
    label: 'Sıcak kase',
    commissionRate: 0.12,
  },
  {
    id: 'gunluk-tencere-nohut',
    recipeId: 'recipe-nohut-yemegi',
    name: 'Günlük Tencere',
    rating: 4.6,
    deliveryEstimate: '35-45 dk',
    portionPrice: 118,
    minBasket: 140,
    deliveryFee: 22,
    tags: ['Ev yemeği', 'Kampanyalı'],
    label: '2. porsiyon indirimli',
    commissionRate: 0.12,
  },
  {
    id: 'sefin-sofrasi-tavuk-sote',
    recipeId: 'recipe-tavuk-sote',
    name: 'Şefin Sofrası',
    rating: 4.9,
    deliveryEstimate: '35-50 dk',
    portionPrice: 172,
    minBasket: 220,
    deliveryFee: 34,
    tags: ['Premium', 'Şef önerisi'],
    label: 'Premium',
    featured: true,
    commissionRate: 0.14,
  },
  {
    id: 'express-tavuk-makarna',
    recipeId: 'recipe-tavuklu-makarna',
    name: 'TarifAL Express Kitchen',
    rating: 4.7,
    deliveryEstimate: '20-30 dk',
    portionPrice: 149,
    minBasket: 160,
    deliveryFee: 19,
    tags: ['Hızlı teslimat', 'Sponsorlu'],
    label: 'Hızlı teslimat',
    sponsored: true,
    featured: true,
    commissionRate: 0.15,
  },
  {
    id: 'anadolu-mercimek',
    recipeId: 'recipe-mercimek',
    name: 'Anadolu Lokantası',
    rating: 4.7,
    deliveryEstimate: '30-40 dk',
    portionPrice: 68,
    minBasket: 150,
    deliveryFee: 24,
    tags: ['Ev yemeği', 'Ekonomik'],
    label: 'En uygun',
    commissionRate: 0.12,
  },
  {
    id: 'ev-yemegi-menemen',
    recipeId: 'recipe-menemen',
    name: 'Ev Yemeği Mutfağı',
    rating: 4.5,
    deliveryEstimate: '20-30 dk',
    portionPrice: 96,
    minBasket: 120,
    deliveryFee: 18,
    tags: ['Hızlı teslimat', 'Ekonomik'],
    label: 'Kahvaltı favorisi',
    commissionRate: 0.12,
  },
  {
    id: 'express-makarna',
    recipeId: 'recipe-yogurtlu-makarna',
    name: 'TarifAL Express Kitchen',
    rating: 4.6,
    deliveryEstimate: '20-30 dk',
    portionPrice: 119,
    minBasket: 150,
    deliveryFee: 19,
    tags: ['Hızlı teslimat', 'Sponsorlu'],
    label: 'Sponsorlu',
    sponsored: true,
    commissionRate: 0.15,
  },
];

const fallbackRestaurants = (recipeId: string): RestaurantOption[] => [
  {
    id: `${recipeId}-anadolu`,
    recipeId,
    name: 'Anadolu Lokantası',
    rating: 4.6,
    deliveryEstimate: '30-40 dk',
    portionPrice: 132,
    minBasket: 150,
    deliveryFee: 24,
    tags: ['Ev yemeği', 'Ekonomik'],
    label: 'Ev yemeği',
    commissionRate: 0.12,
  },
  {
    id: `${recipeId}-express`,
    recipeId,
    name: 'TarifAL Express Kitchen',
    rating: 4.7,
    deliveryEstimate: '20-30 dk',
    portionPrice: 148,
    minBasket: 160,
    deliveryFee: 19,
    tags: ['Hızlı teslimat', 'Sponsorlu'],
    label: 'Hızlı teslimat',
    sponsored: true,
    commissionRate: 0.15,
  },
  {
    id: `${recipeId}-sefin-sofrasi`,
    recipeId,
    name: 'Şefin Sofrası',
    rating: 4.8,
    deliveryEstimate: '35-50 dk',
    portionPrice: 178,
    minBasket: 220,
    deliveryFee: 34,
    tags: ['Premium', 'Şef önerisi'],
    label: 'Premium',
    featured: true,
    commissionRate: 0.14,
  },
];

export const getRestaurantsForRecipe = (recipeId: string) => {
  const restaurants = demoRestaurantOptions.filter((restaurant) => restaurant.recipeId === recipeId);

  return restaurants.length > 0 ? restaurants : fallbackRestaurants(recipeId);
};
