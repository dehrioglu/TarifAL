import { TriedRecipePost } from '../types';

export const mockTriedRecipes: TriedRecipePost[] = [
  {
    id: 'tried-baklava-demo',
    userId: 'user-pasta-atolyesi',
    recipeId: 'recipe-baklava',
    rating: 5,
    comment: 'Katları açmak zor ama sonuç bayram sofrası gibi oldu.',
    imageUrl:
      'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=900&auto=format&fit=crop',
    createdAt: 'Dün',
  },
  {
    id: 'tried-icli-kofte-demo',
    userId: 'user-anneanne-defteri',
    recipeId: 'recipe-icli-kofte',
    rating: 5,
    comment: 'Hamuru kontrollü suyla yoğurunca hiç çatlamadı.',
    imageUrl:
      'https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=900&auto=format&fit=crop',
    createdAt: '2 gün önce',
  },
  {
    id: 'tried-lazanya-demo',
    userId: 'user-gurme-gezgin',
    recipeId: 'recipe-lazanya',
    rating: 4,
    comment: 'Bolonez sosu uzun pişirmek fark yaratıyor.',
    imageUrl:
      'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=900&auto=format&fit=crop',
    createdAt: '3 gün önce',
  },
];
