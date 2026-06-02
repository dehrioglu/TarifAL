import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { TarifALBotFab } from '../../components/TarifALBotFab';
import { DailyReturnCard } from '../../components/retention/DailyReturnCard';
import { CommunityPreview } from '../../components/dashboard/CommunityPreview';
import { DailyPick, DailyPicksSection } from '../../components/dashboard/DailyPicksSection';
import { HeaderGreeting } from '../../components/dashboard/HeaderGreeting';
import { KitchenStatusItem, KitchenStatusStrip } from '../../components/dashboard/KitchenStatusStrip';
import { QuickActionCarousel, QuickKitchenAction } from '../../components/dashboard/QuickActionCarousel';
import { SmartHeroCard } from '../../components/dashboard/SmartHeroCard';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { mockSocialRecipes, mockSocialUsers } from '../../data/mockSocial';
import { mockNotifications } from '../../data/mockNotifications';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { useOnboardingTour } from '../../onboarding/useOnboardingTour';
import { useDailyReturn } from '../../retention/useDailyReturn';
import { TasteCategory } from '../../personalization/tasteProfileStore';
import { useUserTasteProfile } from '../../personalization/useUserTasteProfile';
import { useAppStore } from '../../store/useAppStore';
import { Recipe, SocialRecipePost, SocialUser } from '../../types';
import { getRecipeCost, getRecipeMatches, parsePantryText } from '../../utils/recipeMatching';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { showDemoModal, showToast } = useFeedback();
  const { registerTarget } = useOnboardingTour();
  const user = useAppStore((store) => store.user);
  const recipes = useAppStore((store) => store.recipes);
  const pantryText = useAppStore((store) => store.pantryText);
  const recipeLists = useAppStore((store) => store.recipeLists);
  const cart = useAppStore((store) => store.cart);
  const readNotifications = useAppStore((store) => store.readNotifications);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const setUserGoal = useAppStore((store) => store.setUserGoal);
  const { recordCategoryInteraction, sortRecipes } = useUserTasteProfile();
  const [dailyRecipeOffset, setDailyRecipeOffset] = useState(0);
  const { streak, completedToday, completeDailyAction } = useDailyReturn();

  const headerTargetRef = useMemo(() => registerTarget('homeHeader'), [registerTarget]);
  const heroTargetRef = useMemo(() => registerTarget('homeSearch'), [registerTarget]);
  const servicesTargetRef = useMemo(() => registerTarget('homeQuickActions'), [registerTarget]);
  const pantryTargetRef = useMemo(() => registerTarget('homePantry'), [registerTarget]);
  const marketTargetRef = useMemo(() => registerTarget('homeMarket'), [registerTarget]);
  const recipeTargetRef = useMemo(() => registerTarget('homeRecipeCards'), [registerTarget]);

  const firstName = user?.name?.split(' ')[0] ?? 'Enes';
  const sortedRecipes = useMemo(() => sortRecipes(recipes), [recipes, sortRecipes]);
  const recipeMatches = useMemo(() => getRecipeMatches(sortedRecipes, pantryText), [pantryText, sortedRecipes]);
  const pantryCount = parsePantryText(pantryText).length;
  const unreadCount = mockNotifications.filter(
    (notification) => !(readNotifications[notification.id] ?? notification.isRead),
  ).length;

  const practicalRecipes = useMemo(
    () => sortedRecipes.filter((recipe) => recipe.difficulty === 'Kolay' && recipe.prepTime <= 30),
    [sortedRecipes],
  );
  const dailyRecipe = useMemo(() => {
    if (practicalRecipes.length === 0) {
      return undefined;
    }

    const today = new Date();
    const daySeed = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000);

    return practicalRecipes[(daySeed + dailyRecipeOffset) % practicalRecipes.length];
  }, [dailyRecipeOffset, practicalRecipes]);
  const heroRecipe =
    recipes.find((recipe) => recipe.id === 'recipe-tavuklu-makarna') ??
    dailyRecipe ??
    recipes[0];
  const missingBasketValue = Math.max(
    186,
    cart.reduce((total, item) => total + item.price * item.quantity, 0),
  );

  const usersById = useMemo(
    () =>
      mockSocialUsers.reduce<Record<string, SocialUser>>((acc, socialUser) => {
        acc[socialUser.id] = socialUser;
        return acc;
      }, {}),
    [],
  );
  const communityItems = useMemo(
    () =>
      ['post-hunkar-murat', 'post-mercimek-ayse', 'post-tarifal-kisir'].flatMap((postId) => {
        const post = mockSocialRecipes.find((item) => item.id === postId);
        const author = post ? usersById[post.authorId] : undefined;

        return post && author ? [{ post, author }] : [];
      }),
    [usersById],
  );

  const openRecipe = (recipe: Recipe, purchaseMode?: 'home' | 'market' | 'restaurant') => {
    navigation.getParent()?.navigate('RecipeDetail', { recipeId: recipe.id, purchaseMode });
  };

  const openReadyMeals = () => {
    const recipe =
      recipes.find((item) => item.id === 'recipe-hunkar-begendi') ??
      recipes.find((item) => item.category === 'Ana Yemek') ??
      recipes[0];

    if (!recipe) {
      showToast('Hazır yemek alternatifleri için önce bir tarif gerekli.', 'warning');
      return;
    }

    openRecipe(recipe, 'restaurant');
  };

  const openWeeklyPlan = () => {
    showDemoModal({
      title: 'TarifAL Plan',
      message:
        'Haftalık yemek planını kişi sayına ve bütçene göre Akıllı Sepet akışında hazırlayabilir, eksikleri tek seferde alışverişe dönüştürebilirsin.',
      primaryLabel: 'Planı Oluştur',
      secondaryLabel: 'Kapat',
      onPrimary: () => navigation.getParent()?.navigate('SmartBasket'),
    });
  };

  const showAnotherPracticalRecipe = () => {
    setDailyRecipeOffset((currentOffset) => (currentOffset + 1) % Math.max(practicalRecipes.length, 1));
    showToast('Yeni bir pratik tarif önerdim.', 'info');
  };

  const openTasteDiscover = (category: TasteCategory) => {
    recordCategoryInteraction(category);
    navigation.navigate('Explore');
  };

  const openEconomic = () => {
    setUserGoal('Ekonomik beslenmek');
    openTasteDiscover('ekonomik');
    showToast('Bütçe dostu tarifler senin için öne alındı.', 'info');
  };

  const openFit = () => {
    setUserGoal('Sağlıklı beslenmek');
    openTasteDiscover('fit');
    showToast('Fit tarifler senin için öne alındı.', 'info');
  };

  const openPick = (pick: DailyPick) => {
    const categoryByPick: Record<string, TasteCategory> = {
      practical: 'pratik',
      economic: 'ekonomik',
      fit: 'fit',
      master: 'geleneksel',
    };
    const category = categoryByPick[pick.id];

    if (category) {
      recordCategoryInteraction(category);
    }

    openRecipe(pick.recipe);
  };

  const openCommunityPost = (post: SocialRecipePost) => {
    navigation.getParent()?.navigate('RecipeDetail', {
      recipeId: post.recipeId,
      socialPostId: post.id,
    });
  };

  const quickActions: QuickKitchenAction[] = [
    {
      id: 'home',
      icon: 'home-outline',
      title: 'TarifAL Evde',
      description: 'Evdeki malzemelerle tarif bul.',
      onPress: () => navigation.getParent()?.navigate('PantryVision'),
    },
    {
      id: 'basket',
      icon: 'basket-outline',
      title: 'TarifAL Sepet',
      description: 'Eksikleri market sepetine çevir.',
      onPress: () => navigation.getParent()?.navigate('SmartBasket'),
    },
    {
      id: 'meal',
      icon: 'restaurant-outline',
      title: 'TarifAL Yemek',
      description: 'Hazır yemek alternatiflerini gör.',
      tone: 'navy',
      onPress: openReadyMeals,
    },
    {
      id: 'plan',
      icon: 'calendar-outline',
      title: 'TarifAL Plan',
      description: 'Haftalık yemek planı oluştur.',
      tone: 'navy',
      onPress: openWeeklyPlan,
    },
    {
      id: 'fit',
      icon: 'fitness-outline',
      title: 'TarifAL Fit',
      description: 'Dengeli ve hafif tarifleri seç.',
      tone: 'green',
      onPress: openFit,
    },
    {
      id: 'economic',
      icon: 'wallet-outline',
      title: 'TarifAL Ekonomik',
      description: 'Bütçeye uygun menüleri keşfet.',
      onPress: openEconomic,
    },
  ];

  const kitchenStatuses: KitchenStatusItem[] = [
    {
      id: 'pantry',
      icon: 'cube-outline',
      value: `${Math.max(12, pantryCount)} ürün`,
      label: 'dolapta',
    },
    {
      id: 'expiry',
      icon: 'time-outline',
      value: '3 ürün',
      label: 'yakında tüketilmeli',
      tone: 'green',
    },
    {
      id: 'missing',
      icon: 'basket-outline',
      value: `₺${missingBasketValue}`,
      label: 'eksik ürün',
    },
    {
      id: 'favorites',
      icon: 'heart-outline',
      value: `${Math.max(2, recipeLists.favorites.length)} tarif`,
      label: 'favorilerinde hazır',
      tone: 'navy',
    },
  ];

  const dailyPicks = useMemo<DailyPick[]>(() => {
    const pickDefinitions = [
      {
        id: 'practical',
        label: 'Pratik',
        description: '30 dakikada sofrada.',
        recipe: dailyRecipe,
      },
      {
        id: 'economic',
        label: 'Ekonomik',
        description: 'Bütçe dostu aile seçimi.',
        recipe: recipes.find((recipe) => recipe.id === 'recipe-bulgur-pilavi'),
      },
      {
        id: 'fit',
        label: 'Fit',
        description: 'Hafif ve proteinli tabak.',
        recipe: recipes.find((recipe) => recipe.id === 'recipe-ton-balikli-salata'),
      },
      {
        id: 'master',
        label: 'Usta işi',
        description: 'Hafta sonu için özel seçim.',
        recipe: recipes.find((recipe) => recipe.id === 'recipe-hunkar-begendi'),
      },
    ];

    return pickDefinitions.flatMap((pick) => (pick.recipe ? [{ ...pick, recipe: pick.recipe }] : []));
  }, [dailyRecipe, recipes]);

  return (
    <View style={styles.root}>
      <Screen scroll contentStyle={styles.content}>
        <View ref={headerTargetRef}>
          <HeaderGreeting
            firstName={firstName}
            unreadCount={unreadCount}
            onOpenNotifications={() => navigation.getParent()?.navigate('Activity')}
            onOpenProfile={() => navigation.navigate('Profile')}
          />
        </View>

        {heroRecipe ? (
          <View ref={heroTargetRef} style={styles.heroWrap}>
            <SmartHeroCard
              imageUrl={heroRecipe.imageUrl}
              recipeCount={Math.max(6, recipeMatches.slice(0, 6).length)}
              matchPercent={Math.max(82, recipeMatches[0]?.matchPercent ?? 0)}
              availableRecipeCount={Math.max(
                3,
                recipeMatches.filter((match) => match.matchPercent === 100).length,
              )}
              onOpenToday={() => navigation.getParent()?.navigate('AiChefChat')}
              onOpenPantry={() => navigation.getParent()?.navigate('PantryVision')}
            />
          </View>
        ) : null}

        <View style={styles.retentionWrap}>
          <DailyReturnCard
            streak={streak}
            completedToday={completedToday}
            onPress={() => {
              void completeDailyAction();
              navigation.navigate('Explore');
              showToast('Bugünün kişisel keşif akışı açıldı.', 'info');
            }}
            compact
          />
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Akıllı mutfak durumun</Text>
            <Text style={styles.sectionSubtitle}>Dolabından sepete, tek bakışta.</Text>
          </View>
        </View>
        <KitchenStatusStrip items={kitchenStatuses} />

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Hızlı başla</Text>
            <Text style={styles.sectionSubtitle}>İhtiyacın olan TarifAL servisini seç.</Text>
          </View>
          <Text style={styles.sectionMeta}>6 servis</Text>
        </View>
        <View ref={servicesTargetRef}>
          <View ref={pantryTargetRef}>
            <View ref={marketTargetRef}>
              <QuickActionCarousel actions={quickActions} />
            </View>
          </View>
        </View>

        <View ref={recipeTargetRef} style={styles.sectionBlock}>
          <DailyPicksSection
            picks={dailyPicks}
            onOpenPick={openPick}
            onRefreshPractical={showAnotherPracticalRecipe}
          />
        </View>

        <View style={styles.sectionBlock}>
          <CommunityPreview
            items={communityItems}
            onOpenPost={openCommunityPost}
            onOpenExplore={() => navigation.navigate('Explore')}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('InvestorDemo')}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Yatırımcı demosunu başlat"
          style={styles.demoLink}
        >
          <Ionicons name="analytics-outline" size={17} color={theme.colors.primary} />
          <View style={styles.demoCopy}>
            <Text style={styles.demoTitle}>Yatırımcı demosunu başlat</Text>
            <Text style={styles.demoText}>Tariften sepete dönüşen ana akışı 1 dakikada göster.</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </Screen>

      <TarifALBotFab onPress={() => navigation.getParent()?.navigate('AiChefChat')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFCFA',
  },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingTop: 14,
  },
  heroWrap: {
    marginTop: 16,
  },
  retentionWrap: {
    marginTop: 14,
  },
  sectionHeading: {
    marginTop: 22,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionBlock: {
    marginTop: 24,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  sectionSubtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionMeta: {
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '900',
  },
  demoLink: {
    marginTop: 24,
    minHeight: 70,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  demoCopy: {
    flex: 1,
  },
  demoTitle: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  demoText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
});
