import { AppUser, SocialUser, UserGoal } from '../types';

export const FOUNDER_EMAIL = 'kervankayaenes@gmail.com';

export type ProfileIdentity = {
  username: string;
  bio: string;
  badges: string[];
  icon: 'checkmark-circle' | 'rocket-outline' | 'person-circle-outline';
};

export const isFounderUser = (user?: AppUser | null) =>
  user?.email?.toLowerCase() === FOUNDER_EMAIL || user?.role === 'founder';

export const isAdminUser = (user?: AppUser | null) =>
  isFounderUser(user) || user?.role === 'admin';

export const createProfileUsername = (user?: AppUser | null) => {
  const source = user?.email?.split('@')[0] || user?.name || 'tarifal_user';
  const normalized = source
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 22);

  return `@${normalized || 'tarifal_user'}`;
};

export const buildProfileIdentity = ({
  user,
  isBetaTester,
  cartCount,
  likedCount,
  triedCount,
  userGoal,
}: {
  user?: AppUser | null;
  isBetaTester: boolean;
  cartCount: number;
  likedCount: number;
  triedCount: number;
  userGoal: UserGoal;
}): ProfileIdentity => {
  if (isFounderUser(user)) {
    return {
      username: '@eneschef',
      bio: 'TarifAL kurucusu · Pratik tarifler, akıllı sepetler ve sosyal mutfak deneyimi.',
      badges: ['Kurucu', 'Mutfak Çırağı', 'Sepet Ustası', 'TarifAL Onaylı'],
      icon: 'checkmark-circle',
    };
  }

  const displayName = user?.name?.trim() || 'TarifAL kullanıcısı';
  const badges = [
    isBetaTester ? 'Beta Kullanıcısı' : 'Yeni Üye',
    cartCount > 0 ? 'Sepet Deneyimi' : 'Mutfak Çırağı',
    likedCount > 0 ? 'Tarif Koleksiyoncusu' : 'Keşif Başladı',
    triedCount > 0 ? 'Tarif Denedi' : 'TarifAL Topluluğu',
  ];

  return {
    username: createProfileUsername(user),
    bio: `${displayName} · ${userGoal.toLocaleLowerCase('tr-TR')} hedefiyle TarifAL’de tarif ve akıllı sepet keşfediyor.`,
    badges,
    icon: isBetaTester ? 'rocket-outline' : 'person-circle-outline',
  };
};

export const buildCurrentSocialUser = (user?: AppUser | null): SocialUser => {
  if (isFounderUser(user)) {
    return {
      id: user?.id ?? 'founder-user',
      name: user?.name ?? 'Enes Kervankaya',
      username: '@eneschef',
      avatarUrl:
        user?.avatarUrl ??
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
      coverImageUrl:
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1200&auto=format&fit=crop',
      bio: 'TarifAL kurucusu · Pratik tarifler, akıllı sepetler ve sosyal mutfak deneyimi.',
      location: 'İstanbul',
      followers: 1840,
      following: 86,
      recipeCount: 4,
      totalLikes: 24800,
      averageRating: 4.8,
      badges: ['Kurucu', 'Sepet Ustası', 'TarifAL Onaylı'],
      level: 'TarifAL Kurucusu',
      isVerified: true,
      expertiseAreas: ['Akıllı sepet', 'Pratik tarif', 'Ürün deneyimi'],
    };
  }

  const isBetaTester = Boolean(user?.isBetaTester);
  const displayName = user?.name?.trim() || 'TarifAL Kullanıcısı';

  return {
    id: user?.id ?? 'demo-user',
    name: displayName,
    username: createProfileUsername(user),
    avatarUrl:
      user?.avatarUrl ??
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
    coverImageUrl:
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1200&auto=format&fit=crop',
    bio: `${displayName} · TarifAL topluluğunda tarif, sepet ve mutfak fikirleri keşfediyor.`,
    location: 'Türkiye',
    followers: isBetaTester ? 28 : 0,
    following: isBetaTester ? 6 : 0,
    recipeCount: 0,
    totalLikes: 0,
    averageRating: 0,
    badges: isBetaTester ? ['Beta Kullanıcısı', 'Mutfak Çırağı'] : ['Yeni Üye', 'Mutfak Çırağı'],
    level: 'Mutfak Çırağı',
    isVerified: false,
    expertiseAreas: ['Tarif keşfi', 'Akıllı sepet'],
  };
};
