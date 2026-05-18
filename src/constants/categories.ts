import { CategoryFilter, RecipeCategory } from '../types';

export const recipeCategories: RecipeCategory[] = [
  'Kahvaltı',
  'Çorba',
  'Ana Yemek',
  'Tatlı',
];

export const categoryFilters: CategoryFilter[] = ['Hepsi', ...recipeCategories];

export const categoryIcons: Record<CategoryFilter, string> = {
  Hepsi: 'restaurant',
  Kahvaltı: 'cafe',
  Çorba: 'water',
  'Ana Yemek': 'flame',
  Tatlı: 'ice-cream',
};
