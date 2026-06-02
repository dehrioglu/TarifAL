import { create } from 'zustand';

import { Recipe, SocialFeedPost, SocialUser } from '../types';

export type TasteCategory =
  | 'tatli'
  | 'fit'
  | 'ekonomik'
  | 'geleneksel'
  | 'pratik'
  | 'ogrenci'
  | 'misafir'
  | 'vegan'
  | 'balik'
  | 'hamurIsi';

export type TasteInteraction = 'view' | 'like' | 'save' | 'comment';

export type TasteProfile = Record<TasteCategory, number>;

type TasteProfileState = {
  scores: TasteProfile;
  recordInterest: (categories: TasteCategory[], amount: number) => void;
  recordRecipeInteraction: (
    recipe: Pick<Recipe, 'title' | 'category' | 'tags'>,
    interaction: TasteInteraction,
  ) => void;
  recordPostInteraction: (
    post: Pick<SocialFeedPost, 'title' | 'tags'>,
    interaction: TasteInteraction,
  ) => void;
  recordTagInteraction: (tag: string) => void;
  recordCategoryInteraction: (category: TasteCategory) => void;
  recordChefFollow: (chef: Pick<SocialUser, 'name' | 'expertiseAreas' | 'badges'>) => void;
};

const storageKey = 'tarifal-taste-profile';

export const defaultTasteProfile: TasteProfile = {
  tatli: 8,
  ekonomik: 6,
  pratik: 5,
  geleneksel: 4,
  fit: 2,
  ogrenci: 2,
  misafir: 3,
  vegan: 1,
  balik: 1,
  hamurIsi: 4,
};

export const tasteCategoryLabels: Record<TasteCategory, string> = {
  tatli: 'Tatlı',
  fit: 'Fit',
  ekonomik: 'Ekonomik',
  geleneksel: 'Geleneksel',
  pratik: 'Pratik',
  ogrenci: 'Öğrenci',
  misafir: 'Misafir',
  vegan: 'Vegan',
  balik: 'Balık',
  hamurIsi: 'Hamur işi',
};

const interactionWeights: Record<TasteInteraction, number> = {
  view: 1,
  like: 3,
  save: 5,
  comment: 4,
};

const normalize = (value: string) =>
  value
    .toLocaleLowerCase('tr-TR')
    .replace(/[ç]/g, 'c')
    .replace(/[ğ]/g, 'g')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ş]/g, 's')
    .replace(/[ü]/g, 'u')
    .replace(/\s+/g, '');

const keywordMap: Record<TasteCategory, string[]> = {
  tatli: ['tatli', 'baklava', 'sutlac', 'pasta', 'kek', 'kunefe', 'profiterol', 'serbet'],
  fit: ['fit', 'protein', 'saglikli', 'salata', 'hafif', 'kalori'],
  ekonomik: ['ekonomik', 'butce', 'uygun', 'kampanya', 'aysonu', 'ucuz', 'sepet'],
  geleneksel: ['geleneksel', 'anne', 'lokanta', 'osmanli', 'evyemegi', 'usta'],
  pratik: ['pratik', 'hizli', '15dakika', '30dakika', 'kolay', 'tektava'],
  ogrenci: ['ogrenci', 'ucuz', 'makarna', 'butce', 'kolay'],
  misafir: ['misafir', 'davet', 'ozelgun', 'bayram', 'premium'],
  vegan: ['vegan', 'bitkisel', 'sebze', 'salata', 'israf'],
  balik: ['balik', 'deniz', 'karides', 'kalamar', 'tonbaligi'],
  hamurIsi: ['hamur', 'firin', 'baklava', 'lazanya', 'kofte', 'perde'],
};

const readProfile = (): TasteProfile => {
  try {
    if (typeof localStorage === 'undefined') {
      return defaultTasteProfile;
    }

    const raw = localStorage.getItem(storageKey);

    return raw ? { ...defaultTasteProfile, ...(JSON.parse(raw) as Partial<TasteProfile>) } : defaultTasteProfile;
  } catch {
    return defaultTasteProfile;
  }
};

const writeProfile = (profile: TasteProfile) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(profile));
    }
  } catch {
    // Personalization is progressive enhancement; the app remains usable without persistence.
  }
};

export const getTasteCategoriesFromText = (...values: string[]): TasteCategory[] => {
  const haystack = normalize(values.join(' '));

  return (Object.keys(keywordMap) as TasteCategory[]).filter((category) =>
    keywordMap[category].some((keyword) => haystack.includes(normalize(keyword))),
  );
};

export const getRecipeTasteCategories = (
  recipe: Pick<Recipe, 'title' | 'category' | 'tags'>,
) => getTasteCategoriesFromText(recipe.title, recipe.category, recipe.tags.join(' '));

export const getPostTasteCategories = (
  post: Pick<SocialFeedPost, 'title' | 'tags'>,
) => getTasteCategoriesFromText(post.title, post.tags.join(' '));

export const getChefTasteCategories = (
  chef: Pick<SocialUser, 'name' | 'expertiseAreas' | 'badges'>,
) => getTasteCategoriesFromText(chef.name, chef.expertiseAreas.join(' '), chef.badges.join(' '));

export const useTasteProfileStore = create<TasteProfileState>((set, get) => ({
  scores: readProfile(),

  recordInterest: (categories, amount) => {
    if (categories.length === 0 || amount === 0) {
      return;
    }

    set((state) => {
      const scores = { ...state.scores };

      categories.forEach((category) => {
        scores[category] = Math.max(0, scores[category] + amount);
      });

      writeProfile(scores);
      return { scores };
    });
  },

  recordRecipeInteraction: (recipe, interaction) => {
    get().recordInterest(getRecipeTasteCategories(recipe), interactionWeights[interaction]);
  },

  recordPostInteraction: (post, interaction) => {
    get().recordInterest(getPostTasteCategories(post), interactionWeights[interaction]);
  },

  recordTagInteraction: (tag) => {
    get().recordInterest(getTasteCategoriesFromText(tag), 2);
  },

  recordCategoryInteraction: (category) => {
    get().recordInterest([category], 2);
  },

  recordChefFollow: (chef) => {
    get().recordInterest(getChefTasteCategories(chef), 5);
  },
}));
