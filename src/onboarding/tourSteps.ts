import { TourStep } from './types';

export const onboardingTourSteps: TourStep[] = [
  {
    id: 'home-intro',
    target: 'homeHeader',
    title: 'Burası senin TarifAL merkezin',
    description:
      'TarifAL sana tarif, alışveriş ve hazır yemek seçeneklerini tek merkezde sunar.',
  },
  {
    id: 'home-search',
    target: 'homeSearch',
    title: 'Nasıl TarifAL yapmak istediğini seç',
    description:
      'Evde yapmak, eksikleri sepete eklemek veya hazır yemek sipariş etmek için doğru yerdesin.',
  },
  {
    id: 'home-pantry',
    target: 'homePantry',
    title: 'Evdeki malzemelerle başla',
    description:
      'Buzdolabında ne varsa yaz; TarifAL sana yapabileceğin en uygun tarifleri önersin.',
  },
  {
    id: 'home-categories',
    target: 'homeQuickActions',
    title: 'Altı servis, tek mutfak asistanı',
    description:
      'TarifAL Evde, Sepet, Yemek, Plan, Ekonomik ve Fit servislerine buradan geçebilirsin.',
  },
  {
    id: 'home-recipes',
    target: 'homeRecipeCards',
    title: 'Günün tarifini incele',
    description:
      'Tek bir kısa öneriyle kararını hızlandırabilir veya Keşfet sayfasında sosyal akışa geçebilirsin.',
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
