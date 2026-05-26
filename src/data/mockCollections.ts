import { SocialCollection } from '../types';
import { mockSocialCollections } from './mockSocial';

export const enhancedSocialCollections: SocialCollection[] = [
  ...mockSocialCollections.map((collection, index) => ({
    ...collection,
    saves: collection.saves ?? [1240, 860, 720, 1510][index] ?? 480,
    ownerId: collection.ownerId ?? 'user-tarifal-bot',
  })),
  {
    id: 'collection-under-30',
    userId: 'demo-user',
    ownerId: 'user-ayse',
    title: '30 Dakika Altı',
    description: 'Hızlı karar, hızlı sepet, hızlı sofra için pratik tarifler.',
    recipeIds: ['recipe-menemen', 'recipe-mercimek', 'recipe-yogurtlu-makarna', 'recipe-ton-balikli-salata'],
    coverImageUrl:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=900&auto=format&fit=crop',
    saves: 1180,
  },
  {
    id: 'collection-guest-table',
    userId: 'demo-user',
    ownerId: 'user-firin-ustasi',
    title: 'Misafir Sofraları',
    description: 'Gösterişli, zor ve yatırımcı demosunda premium duran tarifler.',
    recipeIds: ['recipe-perde-pilavi', 'recipe-hunkar-begendi', 'recipe-icli-kofte', 'recipe-baklava'],
    coverImageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900&auto=format&fit=crop',
    saves: 2030,
  },
  {
    id: 'collection-ready-order',
    userId: 'demo-user',
    ownerId: 'user-tarifal-bot',
    title: 'Hazır Sipariş Edilebilir',
    description: 'Evde yap veya restoran alternatifini karşılaştır.',
    recipeIds: ['recipe-hunkar-begendi', 'recipe-lazanya', 'recipe-kuru-fasulye', 'recipe-deniz-mahsullu-risotto'],
    coverImageUrl:
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=900&auto=format&fit=crop',
    saves: 940,
  },
  {
    id: 'collection-student',
    userId: 'demo-user',
    ownerId: 'user-ogrenci',
    title: 'Öğrenci Mutfağı',
    description: 'Az malzeme, net tarif, düşük sepet maliyeti.',
    recipeIds: ['recipe-tavuklu-makarna', 'recipe-bulgur-pilavi', 'recipe-patates-yemegi', 'recipe-omlet'],
    coverImageUrl:
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=900&auto=format&fit=crop',
    saves: 1760,
  },
];
