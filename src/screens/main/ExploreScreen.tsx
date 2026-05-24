import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { CategoryPill } from '../../components/CategoryPill';
import { BudgetFilter, BudgetRecipeFilters } from '../../components/BudgetRecipeFilters';
import { EmptyState } from '../../components/EmptyState';
import { InputField } from '../../components/InputField';
import { RecipeCard } from '../../components/RecipeCard';
import { Screen } from '../../components/Screen';
import { WeeklyMealPlanner } from '../../components/WeeklyMealPlanner';
import { categoryFilters } from '../../constants/categories';
import { theme } from '../../constants/theme';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { useAppStore } from '../../store/useAppStore';
import { CategoryFilter, Difficulty } from '../../types';
import { getRecipeCost, sortRecipesByGoal } from '../../utils/recipeMatching';

const timeFilters = [
  { label: 'Hepsi', value: 999 },
  { label: '15 dk', value: 15 },
  { label: '30 dk', value: 30 },
  { label: '60 dk', value: 60 },
];

const budgetFilters = [
  { label: 'Hepsi', value: 9999 },
  { label: '₺100', value: 100 },
  { label: '₺250', value: 250 },
  { label: '₺500', value: 500 },
];

const difficultyFilters: Array<'Hepsi' | Difficulty> = ['Hepsi', 'Kolay', 'Orta', 'Zor'];

export function ExploreScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [pantry, setPantry] = useState('yumurta, domates, mercimek');
  const [category, setCategory] = useState<CategoryFilter>('Hepsi');
  const [timeLimit, setTimeLimit] = useState(999);
  const [budgetLimit, setBudgetLimit] = useState(9999);
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>('Hepsi');
  const [difficulty, setDifficulty] = useState<'Hepsi' | Difficulty>('Hepsi');
  const recipes = useAppStore((store) => store.recipes);
  const likes = useAppStore((store) => store.likes);
  const userGoal = useAppStore((store) => store.userGoal);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const suggestRecipes = useAppStore((store) => store.suggestRecipes);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const { showToast, showDemoModal } = useFeedback();

  const suggestions = useMemo(() => suggestRecipes(pantry), [pantry, suggestRecipes]);

  const filteredRecipes = useMemo(() => {
    const normalized = query.toLocaleLowerCase('tr-TR').trim();

    return sortRecipesByGoal(recipes, userGoal).filter((recipe) => {
      const recipeCost = getRecipeCost(recipe);
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
      const matchesCategory = category === 'Hepsi' || recipe.category === category;
      const matchesQuery = !normalized || searchable.includes(normalized);
      const matchesTime = recipe.prepTime <= timeLimit;
      const matchesBudget = recipeCost <= budgetLimit;
      const matchesDifficulty = difficulty === 'Hepsi' || recipe.difficulty === difficulty;
      const matchesBudgetFilter =
        budgetFilter === 'Hepsi' ||
        (budgetFilter === 'Ekonomik' && (recipeCost <= 200 || recipe.tags.includes('ekonomik'))) ||
        (budgetFilter === 'Öğrenci' && (recipeCost <= 150 || recipe.prepTime <= 25)) ||
        (budgetFilter === '100 TL altı' && recipeCost <= 100) ||
        (budgetFilter === '200 TL altı' && recipeCost <= 200) ||
        (budgetFilter === 'Aile boyu' && recipe.servings >= 4);

      return matchesCategory && matchesQuery && matchesTime && matchesBudget && matchesDifficulty && matchesBudgetFilter;
    });
  }, [budgetFilter, budgetLimit, category, difficulty, query, recipes, timeLimit, userGoal]);

  const openRecipe = (recipeId: string) => {
    navigation.getParent()?.navigate('RecipeDetail', { recipeId });
  };

  const createWeeklyList = () => {
    recipes.forEach((recipe, index) => {
      if (index < 5) {
        addMissingIngredientsToCart(recipe.id);
      }
    });
    showToast('Haftalık planın eksik malzemeleri sepete eklendi.');
    showDemoModal({
      title: 'Haftalık liste hazır',
      message: 'Haftalık planın eksik malzemeleri sepete eklendi. İstersen Akıllı Sipariş akışına geçebilirsin.',
      primaryLabel: 'Akıllı Siparişe Geç',
      secondaryLabel: 'Sepete Git',
      onPrimary: () => navigation.getParent()?.navigate('MarketCheckout'),
      onSecondary: () => navigation.navigate('Cart'),
    });
  };

  const handleToggleLike = (recipeId: string) => {
    const liked = Boolean(likes[recipeId]);
    toggleLike(recipeId);
    showToast(liked ? 'Favorilerden çıkarıldı.' : 'Favorilere eklendi.');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.title}>Keşfet</Text>
      <Text style={styles.subtitle}>Tarif, malzeme ve bütçeye göre ara</Text>

      <InputField
        icon="search-outline"
        value={query}
        onChangeText={setQuery}
        placeholder="Tarif, malzeme veya etiket ara..."
        containerStyle={styles.search}
      />

      <Text style={styles.filterTitle}>Bütçeye Göre</Text>
      <BudgetRecipeFilters active={budgetFilter} onChange={setBudgetFilter} />

      <View style={styles.aiPanel}>
        <View style={styles.aiHeader}>
          <View>
            <Text style={styles.aiTitle}>AI Malzeme Önerisi</Text>
            <Text style={styles.aiSubtitle}>Evde olanları yaz, eşleşen tarifleri bulalım</Text>
          </View>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
          </View>
        </View>
        <InputField
          value={pantry}
          onChangeText={setPantry}
          placeholder="Örn: yumurta, domates, peynir"
          containerStyle={styles.pantryInput}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
          {suggestions.length === 0 ? (
            <Text style={styles.noSuggestion}>Malzemeleri yazınca öneriler burada görünür.</Text>
          ) : (
            suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                onPress={() => suggestion.recipeId && openRecipe(suggestion.recipeId)}
                activeOpacity={0.85}
                style={styles.suggestionCard}
              >
                <Text style={styles.suggestionTitle} numberOfLines={1}>{suggestion.title}</Text>
                <Text style={styles.suggestionReason} numberOfLines={2}>{suggestion.reason}</Text>
                <Text style={styles.suggestionMeta} numberOfLines={1}>
                  Var: {suggestion.matchedIngredients.join(', ')}
                </Text>
                <Text style={styles.suggestionMissing} numberOfLines={1}>
                  Eksik: {suggestion.missingIngredients.join(', ') || 'Yok'}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.weekly}>
        <WeeklyMealPlanner recipes={recipes} onCreateList={createWeeklyList} onOpenRecipe={openRecipe} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tallFilters}>
        {categoryFilters.map((item) => (
          <CategoryPill
            key={item}
            category={item}
            active={category === item}
            onPress={() => setCategory(item)}
            tall
          />
        ))}
      </ScrollView>

      <Text style={styles.filterTitle}>Süre</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {timeFilters.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => setTimeLimit(item.value)}
            activeOpacity={0.85}
            style={[styles.filterChip, timeLimit === item.value && styles.activeChip]}
          >
            <Text style={[styles.filterChipText, timeLimit === item.value && styles.activeChipText]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.filterTitle}>Bütçe</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {budgetFilters.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => setBudgetLimit(item.value)}
            activeOpacity={0.85}
            style={[styles.filterChip, budgetLimit === item.value && styles.activeChip]}
          >
            <Text style={[styles.filterChipText, budgetLimit === item.value && styles.activeChipText]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.filterTitle}>Zorluk</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {difficultyFilters.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setDifficulty(item)}
            activeOpacity={0.85}
            style={[styles.filterChip, difficulty === item && styles.activeChip]}
          >
            <Text style={[styles.filterChipText, difficulty === item && styles.activeChipText]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>Sonuçlar</Text>
        <Text style={styles.resultCount}>{filteredRecipes.length} tarif</Text>
      </View>

      <View style={styles.grid}>
        {filteredRecipes.length === 0 ? (
          <View style={styles.fullWidth}>
            <EmptyState
              icon="search-outline"
              title="Bu filtrelere uygun tarif bulamadık"
              text="Arama kelimesini, bütçeyi veya süre filtresini değiştirmeyi dene."
            />
          </View>
        ) : (
          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              liked={Boolean(likes[recipe.id])}
              onPress={() => openRecipe(recipe.id)}
              onToggleLike={() => handleToggleLike(recipe.id)}
              variant="grid"
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  search: {
    marginTop: 16,
  },
  aiPanel: {
    marginTop: 16,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  aiTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  aiSubtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  aiIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pantryInput: {
    marginTop: 12,
  },
  suggestionRow: {
    gap: 10,
    paddingTop: 12,
  },
  suggestionCard: {
    width: 212,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    padding: 12,
  },
  suggestionTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  suggestionReason: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  suggestionMeta: {
    marginTop: 8,
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  suggestionMissing: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  noSuggestion: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  weekly: {
    marginTop: 16,
  },
  tallFilters: {
    gap: 10,
    paddingTop: 18,
    paddingBottom: 22,
  },
  filterTitle: {
    marginTop: 12,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  chipRow: {
    gap: 8,
    paddingTop: 10,
    paddingBottom: 2,
  },
  filterChip: {
    minHeight: 38,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  resultHeader: {
    marginTop: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  resultCount: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  fullWidth: {
    width: '100%',
  },
});
