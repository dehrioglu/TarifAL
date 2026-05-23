import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AiAnalysisModal } from '../../components/AiAnalysisModal';
import { AiChefAssistantCard } from '../../components/AiChefAssistantCard';
import { BrandLogo } from '../../components/BrandLogo';
import { BudgetAssistantCard } from '../../components/BudgetAssistantCard';
import { DailyMealPlan } from '../../components/DailyMealPlan';
import { EmptyState } from '../../components/EmptyState';
import { FavoriteRecipesSection } from '../../components/FavoriteRecipesSection';
import { HomeShareCard } from '../../components/HomeShareCard';
import { IngredientMatcher } from '../../components/IngredientMatcher';
import { InputField } from '../../components/InputField';
import { PremiumHeroCard } from '../../components/PremiumHeroCard';
import { RecipeCard } from '../../components/RecipeCard';
import { Screen } from '../../components/Screen';
import { TodayDecisionCard } from '../../components/TodayDecisionCard';
import { WasteReductionCard } from '../../components/WasteReductionCard';
import { WeeklyMealPlanner } from '../../components/WeeklyMealPlanner';
import { theme } from '../../constants/theme';
import { useOnboardingTour } from '../../onboarding/useOnboardingTour';
import { useAppStore } from '../../store/useAppStore';
import { FavoriteListType, Ingredient, Recipe } from '../../types';
import { getRecipeMatches, normalizeIngredientText, sortRecipesByGoal } from '../../utils/recipeMatching';

type HomeSection = 'pantry' | 'chef' | 'today' | 'weekly' | 'market' | 'favorites';

type MarketListItem = {
  key: string;
  recipe: Recipe;
  ingredient: Ingredient;
};

const quickActions: Array<{ id: HomeSection; label: string }> = [
  { id: 'pantry', label: '🥚 Evde Ne Var?' },
  { id: 'chef', label: '✨ AI Şef' },
  { id: 'today', label: '📅 Bugün Ne Pişirsem?' },
  { id: 'weekly', label: '🗓 Haftalık Plan' },
  { id: 'market', label: '🛒 Market Listesi' },
  { id: 'favorites', label: '❤️ Favorilerim' },
];

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [activeSection, setActiveSection] = useState<HomeSection>('pantry');
  const [query, setQuery] = useState('');
  const [assistantAction, setAssistantAction] = useState<string>();
  const [favoriteTab, setFavoriteTab] = useState<FavoriteListType>('favorites');
  const [weeklyExpanded, setWeeklyExpanded] = useState(false);
  const [marketChecks, setMarketChecks] = useState<Record<string, boolean>>({});
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const { currentStep, isTourActive, registerTarget } = useOnboardingTour();

  const user = useAppStore((store) => store.user);
  const recipes = useAppStore((store) => store.recipes);
  const likes = useAppStore((store) => store.likes);
  const recipeLists = useAppStore((store) => store.recipeLists);
  const pantryText = useAppStore((store) => store.pantryText);
  const userGoal = useAppStore((store) => store.userGoal);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const setPantryText = useAppStore((store) => store.setPantryText);
  const addIngredientToCart = useAppStore((store) => store.addIngredientToCart);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const headerTargetRef = useMemo(() => registerTarget('homeHeader'), [registerTarget]);
  const searchTargetRef = useMemo(() => registerTarget('homeSearch'), [registerTarget]);
  const pantryTargetRef = useMemo(() => registerTarget('homePantry'), [registerTarget]);
  const quickActionsTargetRef = useMemo(() => registerTarget('homeQuickActions'), [registerTarget]);
  const recipeCardsTargetRef = useMemo(() => registerTarget('homeRecipeCards'), [registerTarget]);
  const marketTargetRef = useMemo(() => registerTarget('homeMarket'), [registerTarget]);

  const firstName = user?.name?.split(' ')[0] ?? 'Enes';
  const goalSortedRecipes = useMemo(() => sortRecipesByGoal(recipes, userGoal), [recipes, userGoal]);
  const matches = useMemo(() => getRecipeMatches(goalSortedRecipes, pantryText), [goalSortedRecipes, pantryText]);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase('tr-TR').trim();

    if (!normalizedQuery) {
      return [];
    }

    return goalSortedRecipes
      .filter((recipe) => {
        const searchable = [
          recipe.title,
          recipe.description,
          recipe.category,
          recipe.difficulty,
          ...recipe.tags,
          ...recipe.ingredients.map((ingredient) => ingredient.name),
        ]
          .join(' ')
          .toLocaleLowerCase('tr-TR');

        return searchable.includes(normalizedQuery);
      })
      .slice(0, 4);
  }, [goalSortedRecipes, query]);

  const favoriteRecipes = useMemo(
    () => recipes.filter((recipe) => recipeLists[favoriteTab].includes(recipe.id)),
    [favoriteTab, recipeLists, recipes],
  );

  const assistantMessage = useMemo(() => {
    const [topMatch] = matches;

    if (!topMatch) {
      return 'Evdeki malzemeleri yaz, sana en uygun tarifleri bulalım.';
    }

    const matched = topMatch.matchedIngredients.slice(0, 2).map((item) => item.name).join(' ve ');

    if (topMatch.missingIngredients.length === 0) {
      return `${matched} ile ${topMatch.recipe.title} tam uyumlu görünüyor. Hemen pişirebilirsin.`;
    }

    return `${matched || 'Bu malzemeler'} ile ${topMatch.recipe.title} yapabilirsin. ${topMatch.missingIngredients.length} eksiği tek tıkla sepete ekleyebiliriz.`;
  }, [matches]);

  const heroInsight = useMemo(() => {
    const topMatches = matches.slice(0, 3);
    const missingCount = topMatches.reduce((sum, match) => sum + match.missingIngredients.length, 0);

    if (userGoal === 'Ekonomik beslenmek') {
      return 'Bugün bütçe dostu tarifler öne çıkarıldı. Ortalama öneri maliyeti demo veride 150 TL altında.';
    }

    if (userGoal === 'Kas yapmak') {
      return 'Kas yapmak için protein etiketi güçlü tarifler ve uygun malzeme eşleşmeleri öne alındı.';
    }

    return `Evindeki malzemelerle ${topMatches.length} güçlü öneri bulundu. İlk önerilerde ${missingCount} eksik ürün market listesine dönüşebilir.`;
  }, [matches, userGoal]);

  const marketItems = useMemo<MarketListItem[]>(() => {
    const items = new Map<string, MarketListItem>();

    matches.slice(0, 4).forEach((match) => {
      match.missingIngredients.forEach((ingredient) => {
        const key = normalizeIngredientText(ingredient.name);

        if (!items.has(key)) {
          items.set(key, { key, recipe: match.recipe, ingredient });
        }
      });
    });

    return Array.from(items.values()).slice(0, 5);
  }, [matches]);

  const checkedMarketCount = marketItems.filter((item) => marketChecks[item.key] ?? true).length;

  useEffect(() => {
    if (!isTourActive || !currentStep) {
      return;
    }

    if (currentStep.target === 'homeMarket') {
      setActiveSection('market');
      return;
    }

    if (currentStep.target === 'homePantry' || currentStep.target === 'homeRecipeCards') {
      setActiveSection('pantry');
    }
  }, [currentStep, isTourActive]);

  const openRecipe = (recipeId: string) => {
    navigation.getParent()?.navigate('RecipeDetail', { recipeId });
  };

  const handleAssistantAction = (action: string) => {
    const pantryByAction: Record<string, string> = {
      'Daha sağlıklı yap': 'nohut, yeşillik, limon, mercimek',
      'Daha ekonomik yap': 'mercimek, soğan, havuç, yumurta',
      '20 dakikada hazır olsun': 'yumurta, domates, biber',
      'Çocuklara uygun yap': 'un, süt, yumurta, bal',
    };

    setAssistantAction(action);
    setPantryText(pantryByAction[action] ?? 'yumurta, domates');
    setAnalysisVisible(true);
  };

  const handleDailyList = () => {
    const dailyRecipes = [
      recipes.find((recipe) => recipe.category === 'Kahvaltı'),
      recipes.find((recipe) => recipe.category === 'Çorba'),
      recipes.find((recipe) => recipe.category === 'Ana Yemek'),
      recipes.find((recipe) => recipe.category === 'Tatlı'),
    ].filter(Boolean);

    dailyRecipes.forEach((recipe) => recipe && addMissingIngredientsToCart(recipe.id));
    Alert.alert('Liste hazır', 'Günlük menünün eksik malzemeleri sepete eklendi.');
  };

  const handleWeeklyList = () => {
    recipes.slice(0, 7).forEach((recipe) => addMissingIngredientsToCart(recipe.id));
    Alert.alert('Haftalık liste hazır', 'Haftalık planın eksik malzemeleri sepete eklendi.');
  };

  const handleWasteMode = () => {
    setPantryText('yoğurt, süt, yumurta, peynir, sebze');
    setActiveSection('pantry');
    setAnalysisVisible(true);
  };

  const toggleMarketItem = (key: string) => {
    setMarketChecks((current) => ({ ...current, [key]: !(current[key] ?? true) }));
  };

  const handleAddMarketList = () => {
    const selectedItems = marketItems.filter((item) => marketChecks[item.key] ?? true);

    if (selectedItems.length === 0) {
      Alert.alert('Liste boş', 'Sepete eklemek için en az bir malzeme seç.');
      return;
    }

    selectedItems.forEach((item) => addIngredientToCart(item.recipe, item.ingredient));
    Alert.alert('Sepet güncellendi', `${selectedItems.length} eksik malzeme sepete eklendi.`);
  };

  const handleClearMarketList = () => {
    setMarketChecks(
      marketItems.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.key] = false;
        return acc;
      }, {}),
    );
  };

  const renderMarketList = () => (
    <View style={styles.marketCard}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Market Listesi</Text>
          <Text style={styles.panelSubtitle}>Evdeki malzemelerine göre eksikleri seç.</Text>
        </View>
        <View style={styles.panelIcon}>
          <Ionicons name="cart-outline" size={21} color={theme.colors.primary} />
        </View>
      </View>

      {marketItems.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Eksik malzeme görünmüyor"
          text="Malzemelerini değiştirdiğinde alışveriş listesi burada oluşur."
        />
      ) : (
        <View style={styles.marketList}>
          {marketItems.map((item) => {
            const checked = marketChecks[item.key] ?? true;

            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => toggleMarketItem(item.key)}
                activeOpacity={0.85}
                style={styles.marketRow}
              >
                <Ionicons
                  name={checked ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={checked ? theme.colors.primary : theme.colors.subtle}
                />
                <View style={styles.marketCopy}>
                  <Text style={styles.marketName}>{item.ingredient.name}</Text>
                  <Text style={styles.marketMeta} numberOfLines={1}>
                    {item.recipe.title} için • {item.ingredient.gram} gr
                  </Text>
                </View>
                <Text style={styles.marketPrice}>₺{item.ingredient.price.toFixed(0)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.marketActions}>
        <TouchableOpacity onPress={handleAddMarketList} activeOpacity={0.86} style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Sepete ekle</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClearMarketList} activeOpacity={0.86} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Listeyi temizle</Text>
        </TouchableOpacity>
      </View>
      {marketItems.length > 0 ? (
        <Text style={styles.marketHint}>{checkedMarketCount} ürün seçili</Text>
      ) : null}
    </View>
  );

  const renderActivePanel = () => {
    if (activeSection === 'pantry') {
      return (
        <IngredientMatcher
          onOpenRecipe={openRecipe}
          maxMatches={2}
          targetRef={pantryTargetRef}
          matchesTargetRef={recipeCardsTargetRef}
        />
      );
    }

    if (activeSection === 'chef') {
      return (
        <View style={styles.panelStack}>
          <AiChefAssistantCard
            onAction={handleAssistantAction}
            message={assistantMessage}
            activeAction={assistantAction}
          />
          <BudgetAssistantCard matches={matches} onOpenRecipe={openRecipe} />
          <WasteReductionCard onUseWasteMode={handleWasteMode} />
        </View>
      );
    }

    if (activeSection === 'today') {
      return (
        <View style={styles.panelStack}>
          <TodayDecisionCard
            matches={matches}
            userGoal={userGoal}
            onAnalyze={() => setAnalysisVisible(true)}
            onOpenRecipe={openRecipe}
            onAddMissing={addMissingIngredientsToCart}
          />
          <DailyMealPlan recipes={recipes} onCreateList={handleDailyList} onOpenRecipe={openRecipe} />
        </View>
      );
    }

    if (activeSection === 'weekly') {
      return (
        <View style={styles.weeklyWrap}>
          <WeeklyMealPlanner
            recipes={recipes}
            onCreateList={handleWeeklyList}
            onOpenRecipe={openRecipe}
            previewDays={weeklyExpanded ? 7 : 3}
          />
          {!weeklyExpanded ? (
            <TouchableOpacity onPress={() => setWeeklyExpanded(true)} activeOpacity={0.86} style={styles.expandButton}>
              <Text style={styles.expandButtonText}>Tüm haftalık planı gör</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    if (activeSection === 'market') {
      return (
        <View ref={marketTargetRef} style={styles.panelStack}>
          {renderMarketList()}
          <HomeShareCard />
        </View>
      );
    }

    return (
      <View style={styles.favoritesWrap}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>Favorilerim</Text>
            <Text style={styles.panelSubtitle}>Kaydettiğin tarifler ve pişirme listelerin.</Text>
          </View>
          <View style={styles.panelIcon}>
            <Ionicons name="heart-outline" size={21} color={theme.colors.primary} />
          </View>
        </View>
        <FavoriteRecipesSection
          active={favoriteTab}
          onChange={setFavoriteTab}
          recipes={favoriteRecipes}
          likedIds={likes}
          onOpenRecipe={openRecipe}
          onToggleLike={toggleLike}
        />
      </View>
    );
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View ref={headerTargetRef}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>Merhaba {firstName} 👋</Text>
            <Text style={styles.title}>Bugün ne pişirelim?</Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.avatar}>
            <BrandLogo variant="mark" size={40} />
          </TouchableOpacity>
        </View>
        <PremiumHeroCard
          insight={heroInsight}
          onFindWithAi={() => setAnalysisVisible(true)}
          onOpenPantry={() => setActiveSection('pantry')}
        />
      </View>

      <View ref={searchTargetRef}>
        <InputField
          icon="search-outline"
          value={query}
          onChangeText={setQuery}
          placeholder="Tarif, malzeme veya etiket ara..."
          containerStyle={styles.search}
        />
      </View>

      <View ref={quickActionsTargetRef} style={styles.quickActions}>
        {quickActions.map((action) => {
          const active = activeSection === action.id;

          return (
            <TouchableOpacity
              key={action.id}
              onPress={() => setActiveSection(action.id)}
              activeOpacity={0.86}
              style={[styles.quickAction, active && styles.quickActionActive]}
            >
              <Text
                style={[styles.quickActionText, active && styles.quickActionTextActive]}
                numberOfLines={1}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.dynamicArea}>{renderActivePanel()}</View>

      {query.trim() ? (
        <View style={styles.searchResults}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Arama Sonuçları</Text>
            <Text style={styles.resultCount}>{searchResults.length} tarif</Text>
          </View>
          <View style={styles.resultList}>
            {searchResults.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title="Sonuç bulamadık"
                text="Tarif adı, malzeme veya etiketi farklı yazmayı dene."
              />
            ) : (
              searchResults.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  liked={Boolean(likes[recipe.id])}
                  onPress={() => openRecipe(recipe.id)}
                  onToggleLike={() => toggleLike(recipe.id)}
                  variant="wide"
                />
              ))
            )}
          </View>
        </View>
      ) : null}

      <AiAnalysisModal
        visible={analysisVisible}
        matches={matches}
        userGoal={userGoal}
        onClose={() => setAnalysisVisible(false)}
        onOpenRecipe={(recipeId) => {
          setAnalysisVisible(false);
          openRecipe(recipeId);
        }}
        onAddMissing={(recipeId) => {
          addMissingIngredientsToCart(recipeId);
          Alert.alert('Sepet güncellendi', 'Eksik ürünler alışveriş listene eklendi.');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  headerCopy: {
    flex: 1,
  },
  greeting: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginBottom: 14,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    paddingBottom: 16,
  },
  quickAction: {
    width: '48.5%',
    minHeight: 42,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
    shadowOpacity: 0.03,
  },
  quickActionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    ...theme.orangeShadow,
    shadowOpacity: 0.12,
  },
  quickActionText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  quickActionTextActive: {
    color: '#FFFFFF',
  },
  dynamicArea: {
    gap: 14,
  },
  panelStack: {
    gap: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  panelSubtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  panelIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyWrap: {
    gap: 10,
  },
  expandButton: {
    minHeight: 44,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButtonText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  marketCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 14,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  marketList: {
    gap: 9,
  },
  marketRow: {
    minHeight: 56,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  marketCopy: {
    flex: 1,
  },
  marketName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  marketMeta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  marketPrice: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  marketActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  marketHint: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  favoritesWrap: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 14,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  searchResults: {
    marginTop: 18,
  },
  resultHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  resultCount: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '800',
  },
  resultList: {
    gap: 12,
  },
});
