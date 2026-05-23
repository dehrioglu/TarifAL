import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { todayModes } from '../data/demoPremium';
import { theme } from '../constants/theme';
import { Recipe, RecipeMatch, UserGoal } from '../types';
import { getRecipeCost, getRecipeSuitabilityScore } from '../utils/recipeMatching';

type TodayDecisionCardProps = {
  matches: RecipeMatch[];
  userGoal: UserGoal;
  onOpenRecipe: (recipeId: string) => void;
  onAddMissing: (recipeId: string) => void;
  onAnalyze: () => void;
};

export function TodayDecisionCard({
  matches,
  userGoal,
  onOpenRecipe,
  onAddMissing,
  onAnalyze,
}: TodayDecisionCardProps) {
  const [selectedMode, setSelectedMode] = useState<(typeof todayModes)[number]['id']>('quick');
  const suggestions = useMemo(() => {
    const sorted = [...matches].sort((first, second) => {
      if (selectedMode === 'quick') {
        return first.recipe.prepTime - second.recipe.prepTime;
      }

      if (selectedMode === 'budget') {
        return getRecipeCost(first.recipe) - getRecipeCost(second.recipe);
      }

      return second.recipe.calories - first.recipe.calories;
    });

    return sorted.slice(0, 3);
  }, [matches, selectedMode]);

  const renderSuggestion = (recipe: Recipe, match: RecipeMatch) => {
    const cost = getRecipeCost(recipe);
    const score = getRecipeSuitabilityScore(recipe, match.matchPercent, userGoal);

    return (
      <View key={recipe.id} style={styles.suggestion}>
        <View style={styles.suggestionTop}>
          <Text style={styles.suggestionTitle} numberOfLines={1}>{recipe.title}</Text>
          <View style={styles.fitBadge}>
            <Text style={styles.fitText}>%{score}</Text>
          </View>
        </View>
        <Text style={styles.suggestionMeta}>
          {recipe.prepTime} dk • {recipe.difficulty} • ₺{cost.toFixed(0)} • %{match.matchPercent} uyum
        </Text>
        <View style={styles.suggestionActions}>
          <TouchableOpacity onPress={() => onOpenRecipe(recipe.id)} activeOpacity={0.85} style={styles.recipeButton}>
            <Text style={styles.recipeButtonText}>Tarifi Gör</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onAddMissing(recipe.id)} activeOpacity={0.85} style={styles.cartButton}>
            <Text style={styles.cartButtonText}>Eksikleri Sepete Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bugün Ne Pişirsem?</Text>
          <Text style={styles.subtitle}>
            Zamanına, bütçene ve evdeki malzemelerine göre sana en uygun yemeği seçelim.
          </Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="restaurant-outline" size={22} color={theme.colors.primary} />
        </View>
      </View>

      <TouchableOpacity onPress={onAnalyze} activeOpacity={0.86} style={styles.mainButton}>
        <Ionicons name="sparkles" size={17} color="#FFFFFF" />
        <Text style={styles.mainButtonText}>Bana Yemek Öner</Text>
      </TouchableOpacity>

      <View style={styles.modeRow}>
        {todayModes.map((mode) => {
          const active = selectedMode === mode.id;

          return (
            <TouchableOpacity
              key={mode.id}
              onPress={() => setSelectedMode(mode.id)}
              activeOpacity={0.85}
              style={[styles.modeCard, active && styles.activeModeCard]}
            >
              <Text style={[styles.modeTitle, active && styles.activeModeTitle]}>{mode.title}</Text>
              <Text style={[styles.modeDescription, active && styles.activeModeDescription]} numberOfLines={2}>
                {mode.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.suggestions}>
        {suggestions.map((match) => renderSuggestion(match.recipe, match))}
      </View>
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
    gap: 14,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
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
  mainButton: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.orangeShadow,
    shadowOpacity: 0.12,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeCard: {
    flex: 1,
    minHeight: 78,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 10,
  },
  activeModeCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  modeTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  activeModeTitle: {
    color: theme.colors.primary,
  },
  modeDescription: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
  activeModeDescription: {
    color: theme.colors.text,
  },
  suggestions: {
    gap: 9,
  },
  suggestion: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 8,
  },
  suggestionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  suggestionTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  fitBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fitText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  suggestionMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  recipeButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  cartButton: {
    flex: 1.3,
    minHeight: 36,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cartButtonText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
});
