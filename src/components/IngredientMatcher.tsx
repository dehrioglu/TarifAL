import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { getRecipeMatches, normalizeIngredientText, parsePantryText, sortRecipesByGoal } from '../utils/recipeMatching';
import { EmptyState } from './EmptyState';
import { IngredientInput } from './IngredientInput';
import { SelectedIngredientsChips } from './SelectedIngredientsChips';
import { SmartRecipeCard } from './SmartRecipeCard';

const quickIngredients = ['Yumurta', 'Tavuk', 'Makarna', 'Pirinç', 'Domates', 'Patates', 'Yoğurt', 'Peynir', 'Soğan', 'Biber', 'Süt'];

type IngredientMatcherProps = {
  onOpenRecipe: (recipeId: string) => void;
  onOpenVision?: () => void;
  maxMatches?: number;
  targetRef?: (node: View | null) => void;
  matchesTargetRef?: (node: View | null) => void;
};

export function IngredientMatcher({
  onOpenRecipe,
  onOpenVision,
  maxMatches = 3,
  targetRef,
  matchesTargetRef,
}: IngredientMatcherProps) {
  const [showMatches, setShowMatches] = useState(true);
  const recipes = useAppStore((store) => store.recipes);
  const pantryText = useAppStore((store) => store.pantryText);
  const userGoal = useAppStore((store) => store.userGoal);
  const setPantryText = useAppStore((store) => store.setPantryText);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const toggleRecipeList = useAppStore((store) => store.toggleRecipeList);
  const favorites = useAppStore((store) => store.recipeLists.favorites);

  const pantryItems = useMemo(() => parsePantryText(pantryText), [pantryText]);
  const matches = useMemo(() => {
    const goalSortedRecipes = sortRecipesByGoal(recipes, userGoal);

    return getRecipeMatches(goalSortedRecipes, pantryText).slice(0, maxMatches);
  }, [maxMatches, pantryText, recipes, userGoal]);
  const totalMissing = matches.reduce((sum, match) => sum + Math.min(match.missingIngredients.length, 3), 0);

  const updatePantry = (items: string[]) => {
    setPantryText([...new Set(items.map((item) => item.trim()).filter(Boolean))].join(', '));
  };

  const addIngredient = (ingredient: string) => {
    const exists = pantryItems.some((item) => normalizeIngredientText(item) === normalizeIngredientText(ingredient));

    if (!exists) {
      updatePantry([...pantryItems, ingredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    updatePantry(pantryItems.filter((item) => normalizeIngredientText(item) !== normalizeIngredientText(ingredient)));
  };

  const toggleIngredient = (ingredient: string) => {
    const exists = pantryItems.some((item) => normalizeIngredientText(item) === normalizeIngredientText(ingredient));

    if (exists) {
      removeIngredient(ingredient);
    } else {
      addIngredient(ingredient);
    }
  };

  const addMissing = (recipeId: string) => {
    addMissingIngredientsToCart(recipeId);
    Alert.alert('Sepet güncellendi', 'Eksik malzemeler sepete eklendi.');
  };

  return (
    <View ref={targetRef} style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Evde Ne Var?</Text>
          <Text style={styles.subtitle}>Dolabındaki malzemeleri ekle, TarifAL sana yapabileceğin tarifleri önersin.</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="basket-outline" size={22} color={theme.colors.primary} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {quickIngredients.map((ingredient) => {
          const active = pantryItems.some((item) => normalizeIngredientText(item) === normalizeIngredientText(ingredient));

          return (
            <TouchableOpacity
              key={ingredient}
              onPress={() => toggleIngredient(ingredient)}
              activeOpacity={0.85}
              style={[styles.chip, active && styles.activeChip]}
            >
              <Text style={[styles.chipText, active && styles.activeChipText]}>{ingredient}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <IngredientInput onAdd={addIngredient} />
      <SelectedIngredientsChips ingredients={pantryItems} onRemove={removeIngredient} />

      <TouchableOpacity onPress={onOpenVision} activeOpacity={0.86} style={styles.photoPlaceholder}>
        <Ionicons name="camera-outline" size={17} color={theme.colors.primary} />
        <Text style={styles.photoPlaceholderText}>Fotoğrafla Dolabımı Tara: demo AI malzeme tanıma</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowMatches(true)} activeOpacity={0.86} style={styles.findButton}>
        <Ionicons name="sparkles" size={17} color="#FFFFFF" />
        <Text style={styles.findButtonText}>Tarifleri Bul</Text>
      </TouchableOpacity>

      {showMatches ? (
        <View ref={matchesTargetRef} style={styles.matches}>
          <Text style={styles.matchTitle}>Sana uygun tarifler</Text>
          <View style={styles.smartSummary}>
            <Text style={styles.smartSummaryText}>
              Bu malzemelerle bugün {matches.length} yemek yapabilirsin.
              {totalMissing > 0 ? ` İlk öneriler için ${totalMissing} ürün eksik.` : ' İlk öneriler tam uyumlu görünüyor.'}
            </Text>
          </View>
          {matches.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title="Uygun tarif bulamadık"
              text="Malzemeleri biraz değiştirirsen önerileri yeniden sıralayabilirim."
            />
          ) : (
            matches.map((match) => (
              <SmartRecipeCard
                key={match.recipe.id}
                match={match}
                favorite={favorites.includes(match.recipe.id)}
                onPress={() => onOpenRecipe(match.recipe.id)}
                onCook={() => onOpenRecipe(match.recipe.id)}
                onAddMissing={() => addMissing(match.recipe.id)}
                onToggleFavorite={() => toggleRecipeList('favorites', match.recipe.id)}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  title: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    gap: 8,
    paddingTop: 14,
    paddingBottom: 12,
  },
  chip: {
    minHeight: 36,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  photoPlaceholder: {
    minHeight: 40,
    marginTop: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  photoPlaceholderText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  matches: {
    marginTop: 16,
    gap: 12,
  },
  findButton: {
    minHeight: 48,
    marginTop: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.orangeShadow,
    shadowOpacity: 0.12,
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  matchTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  smartSummary: {
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    padding: 12,
  },
  smartSummaryText: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '900',
  },
});
