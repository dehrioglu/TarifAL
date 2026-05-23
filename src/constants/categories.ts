import { CategoryFilter, RecipeCategory } from '../types';

export const recipeCategories: RecipeCategory[] = [
  'Kahvaltı',
  'Çorba',
  'Ana Yemek',
  'Tatlı',
  'Salata',
  'Pratik',
  'Ekonomik',
];

export const categoryFilters: CategoryFilter[] = ['Hepsi', ...recipeCategories];

export const categoryIcons: Record<CategoryFilter, string> = {
  Hepsi: 'restaurant',
  Kahvaltı: 'cafe',
  Çorba: 'water',
  'Ana Yemek': 'flame',
  Tatlı: 'ice-cream',
  Salata: 'leaf',
  Pratik: 'flash',
  Ekonomik: 'wallet',
};
