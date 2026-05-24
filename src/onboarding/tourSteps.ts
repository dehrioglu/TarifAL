import { TourStep } from './types';

export const onboardingTourSteps: TourStep[] = [
  {
    id: 'home-intro',
    target: 'homeHeader',
    title: 'Burası senin akıllı mutfağın',
    description:
      'TarifAL sana tarif, alışveriş ve yapay zekâ destekli önerileri tek ekranda sunar.',
  },
  {
    id: 'home-search',
    target: 'homeSearch',
    title: 'Ne pişirmek istediğini ara',
    description:
      'Yemek adı, kategori veya malzeme yazarak saniyeler içinde uygun tarifleri bulabilirsin.',
  },
  {
    id: 'home-pantry',
    target: 'homePantry',
    title: 'Evdeki malzemelerle tarif bul',
    description:
      'Buzdolabında ne varsa yaz; TarifAL sana yapabileceğin en uygun tarifleri önersin.',
  },
  {
    id: 'home-categories',
    target: 'homeQuickActions',
    title: 'Hızlı Başla',
    description:
      'Bugün ne pişirsem, evde ne var, haftalık plan ve market listesi gibi ana aksiyonlara buradan geçebilirsin.',
  },
  {
    id: 'home-recipes',
    target: 'homeRecipeCards',
    title: 'Tarif detaylarını incele',
    description:
      'Süre, zorluk, kalori ve malzeme bilgilerini görerek sana en uygun tarifi seç.',
  },
  {
    id: 'home-market',
    target: 'homeMarket',
    title: 'Tarifi alışverişe dönüştür',
    description:
      'Eksik malzemeleri sepete ekleyip alışverişini kolayca planlayabilirsin.',
    finalMessage: 'Harika! Artık TarifAL’i keşfetmeye hazırsın.',
  },
];
