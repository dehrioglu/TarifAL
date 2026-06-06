import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { TarifALBotFab } from '../../components/TarifALBotFab';
import { FeedbackPromptButton } from '../../components/FeedbackPromptButton';
import { DailyReturnCard } from '../../components/retention/DailyReturnCard';
import { CommunityPreview } from '../../components/dashboard/CommunityPreview';
import { DailyPick, DailyPicksSection } from '../../components/dashboard/DailyPicksSection';
import { HeaderGreeting } from '../../components/dashboard/HeaderGreeting';
import { KitchenStatusItem, KitchenStatusStrip } from '../../components/dashboard/KitchenStatusStrip';
import { QuickActionGrid, QuickKitchenAction } from '../../components/dashboard/QuickActionGrid';
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
import { isFounderUser } from '../../utils/profileIdentity';
import { getRecipeCost, getRecipeMatches, parsePantryText } from '../../utils/recipeMatching';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { showDemoModal, showToast } = useFeedback();
  const { registerTarget } = useOnboardingTour();
  const user = useAppStore((store) => store.user);
  const profile = useAppStore((store) => store.profile);
  const recipes = useAppStore((store) => store.recipes);
  const pantryText = useAppStore((store) => store.pantryText);
  const recipeLists = useAppStore((store) => store.recipeLists);
  const cart = useAppStore((store) => store.cart);
  const readNotifications = useAppStore((store) => store.readNotifications);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const setUserGoal = useAppStore((store) => store.setUserGoal);
  const { recordCategoryInteraction, sortRecipes } = useUserTasteProfile();
  const [dailyPicksOffset, setDailyPicksOffset] = useState(0);
  const [showTodayDecision, setShowTodayDecision] = useState(false);
  const { streak, completedToday, completeDailyAction } = useDailyReturn();
  const isFounderAccount = isFounderUser(user);
  const showTestingTools = Boolean(isFounderAccount || profile?.isBetaTester || user?.isBetaTester);

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
  const economicRecipes = useMemo(
    () =>
      sortedRecipes.filter(
        (recipe) =>
          recipe.category === 'Ekonomik' ||
          recipe.goalTypes.includes('ekonomik_beslenmek') ||
          recipe.tags.some((tag) => tag.toLocaleLowerCase('tr-TR').includes('ekonomik')) ||
          (recipe.estimatedPrice ?? getRecipeCost(recipe)) <= 180,
      ),
    [sortedRecipes],
  );
  const fitRecipes = useMemo(
    () =>
      sortedRecipes.filter(
        (recipe) =>
          recipe.category === 'Salata' ||
          recipe.goalTypes.some((goal) => ['kilo_vermek', 'kas_yapmak', 'saglikli_beslenmek'].includes(goal)) ||
          recipe.tags.some((tag) => {
            const normalizedTag = tag.toLocaleLowerCase('tr-TR');
            return normalizedTag.includes('fit') || normalizedTag.includes('sağlıklı') || normalizedTag.includes('protein');
          }),
      ),
    [sortedRecipes],
  );
  const masterRecipes = useMemo(
    () =>
      sortedRecipes.filter(
        (recipe) =>
          recipe.difficulty === 'Zor' ||
          recipe.tags.some((tag) => {
            const normalizedTag = tag.toLocaleLowerCase('tr-TR');
            return normalizedTag.includes('usta') || normalizedTag.includes('geleneksel') || normalizedTag.includes('misafir');
          }),
      ),
    [sortedRecipes],
  );
  const dailyRecipe = useMemo(() => {
    if (practicalRecipes.length === 0) {
      return undefined;
    }

    const today = new Date();
    const daySeed = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000);

    return practicalRecipes[(daySeed + dailyPicksOffset) % practicalRecipes.length];
  }, [dailyPicksOffset, practicalRecipes]);
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

  const handleTodayDecision = (mode: 'home' | 'market' | 'restaurant') => {
    setShowTodayDecision(false);

    if (mode === 'home') {
      if (heroRecipe) {
        openRecipe(heroRecipe, 'home');
        showToast('Bugünün en uygun tarifini açtım.', 'info');
        return;
      }

      navigation.getParent()?.navigate('PantryVision');
      return;
    }

    if (mode === 'market') {
      if (heroRecipe) {
        openRecipe(heroRecipe, 'market');
        showToast('Eksik ürünleri sepete çevirebileceğin tarif açıldı.', 'info');
        return;
      }

      navigation.getParent()?.navigate('SmartBasket');
      return;
    }

    openReadyMeals();
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

  const showAnotherDailyPicks = () => {
    const longestPickListLength = Math.max(
      practicalRecipes.length,
      economicRecipes.length,
      fitRecipes.length,
      masterRecipes.length,
      1,
    );
    setDailyPicksOffset((currentOffset) => (currentOffset + 1) % longestPickListLength);
    showToast('Günün seçimlerini yeniledim.', 'info');
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
      tone: 'blue',
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
      tone: 'amber',
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
    const getRotatingRecipe = (candidates: Recipe[], salt: number, fallback?: Recipe) => {
      if (candidates.length === 0) {
        return fallback;
      }

      return candidates[(dailyPicksOffset + salt) % candidates.length];
    };

    const pickDefinitions = [
      {
        id: 'practical',
        label: 'Pratik',
        description: '30 dakikada sofrada.',
        recipe: getRotatingRecipe(practicalRecipes, 0, dailyRecipe),
      },
      {
        id: 'economic',
        label: 'Ekonomik',
        description: 'Bütçe dostu aile seçimi.',
        recipe: getRotatingRecipe(
          economicRecipes,
          1,
          recipes.find((recipe) => recipe.id === 'recipe-bulgur-pilavi'),
        ),
      },
      {
        id: 'fit',
        label: 'Fit',
        description: 'Hafif ve proteinli tabak.',
        recipe: getRotatingRecipe(
          fitRecipes,
          2,
          recipes.find((recipe) => recipe.id === 'recipe-ton-balikli-salata'),
        ),
      },
      {
        id: 'master',
        label: 'Usta işi',
        description: 'Hafta sonu için özel seçim.',
        recipe: getRotatingRecipe(
          masterRecipes,
          3,
          recipes.find((recipe) => recipe.id === 'recipe-hunkar-begendi'),
        ),
      },
    ];

    return pickDefinitions.flatMap((pick) => (pick.recipe ? [{ ...pick, recipe: pick.recipe }] : []));
  }, [dailyPicksOffset, dailyRecipe, economicRecipes, fitRecipes, masterRecipes, practicalRecipes, recipes]);

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

        {showTestingTools ? (
          <View style={styles.feedbackWrap}>
            <FeedbackPromptButton screenName="HomeScreen" compact />
          </View>
        ) : null}

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
              onOpenToday={() => setShowTodayDecision(true)}
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
            <Text style={styles.sectionSubtitle}>İhtiyacına uygun TarifAL servisini seç.</Text>
          </View>
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>6 servis</Text>
          </View>
        </View>
        <View ref={servicesTargetRef}>
          <View ref={pantryTargetRef}>
            <View ref={marketTargetRef}>
              <QuickActionGrid actions={quickActions} />
            </View>
          </View>
        </View>

        <View ref={recipeTargetRef} style={styles.sectionBlock}>
          <DailyPicksSection
            picks={dailyPicks}
            onOpenPick={openPick}
            onRefreshPicks={showAnotherDailyPicks}
          />
        </View>

        <View style={styles.sectionBlock}>
          <CommunityPreview
            items={communityItems}
            onOpenPost={openCommunityPost}
            onOpenExplore={() => navigation.navigate('Explore')}
          />
        </View>

        {isFounderAccount ? (
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('InvestorDemo')}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Kurucu sunum akışını başlat"
            style={styles.demoLink}
          >
            <Ionicons name="analytics-outline" size={17} color={theme.colors.primary} />
            <View style={styles.demoCopy}>
              <Text style={styles.demoTitle}>Kurucu sunum akışı</Text>
              <Text style={styles.demoText}>Tariften sepete dönüşen ana akışı hızlıca göster.</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : null}
      </Screen>

      <TodayDecisionModal
        visible={showTodayDecision}
        onClose={() => setShowTodayDecision(false)}
        onSelect={handleTodayDecision}
      />
      <TarifALBotFab onPress={() => navigation.getParent()?.navigate('AiChefChat')} />
    </View>
  );
}

function TodayDecisionModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (mode: 'home' | 'market' | 'restaurant') => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.decisionSheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.decisionHandle} />
          <View style={styles.decisionHeader}>
            <View style={styles.decisionIcon}>
              <Ionicons name="sparkles" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.decisionCopy}>
              <Text style={styles.decisionKicker}>TarifAL karar asistanı</Text>
              <Text style={styles.decisionTitle}>Bugün ne yapmak istiyorsun?</Text>
              <Text style={styles.decisionText}>
                TarifAL tarifi, eksik ürünü ve hazır yemek alternatifini tek akışta netleştirir.
              </Text>
            </View>
          </View>

          <DecisionOption
            icon="home-outline"
            title="Evde Yap"
            text="Evdeki malzemelerinle en uygun tarifi aç."
            onPress={() => onSelect('home')}
          />
          <DecisionOption
            icon="basket-outline"
            title="Eksikleri Al"
            text="Seçtiğin tarifin eksik ürünlerini sepete çevir."
            onPress={() => onSelect('market')}
          />
          <DecisionOption
            icon="restaurant-outline"
            title="Hazır Sipariş Et"
            text="Benzer yemekleri restoran alternatifleriyle gör."
            onPress={() => onSelect('restaurant')}
          />

          <TouchableOpacity onPress={onClose} activeOpacity={0.82} style={styles.decisionCloseButton}>
            <Text style={styles.decisionCloseText}>Şimdilik kapat</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DecisionOption({
  icon,
  title,
  text,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.84} style={styles.decisionOption}>
      <View style={styles.decisionOptionIcon}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.decisionOptionCopy}>
        <Text style={styles.decisionOptionTitle}>{title}</Text>
        <Text style={styles.decisionOptionText}>{text}</Text>
      </View>
      <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
    </TouchableOpacity>
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
    paddingBottom: 176,
  },
  heroWrap: {
    marginTop: 16,
  },
  feedbackWrap: {
    marginTop: 12,
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
  serviceBadge: {
    minHeight: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFF1E8',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceBadgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  demoLink: {
    marginTop: 24,
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...theme.shadow,
    shadowOpacity: 0.025,
  },
  demoCopy: {
    flex: 1,
  },
  demoTitle: {
    color: theme.colors.text,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 16, 32, 0.36)',
    justifyContent: 'flex-end',
    padding: 14,
  },
  decisionSheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 10,
    ...theme.shadow,
    shadowOpacity: 0.12,
  },
  decisionHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    marginBottom: 4,
  },
  decisionHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  decisionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionCopy: {
    flex: 1,
  },
  decisionKicker: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  decisionTitle: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
  },
  decisionText: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  decisionOption: {
    minHeight: 76,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFCFA',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  decisionOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionOptionCopy: {
    flex: 1,
  },
  decisionOptionTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  decisionOptionText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  decisionCloseButton: {
    minHeight: 44,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionCloseText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
});
