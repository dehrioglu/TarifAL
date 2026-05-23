import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { FavoriteListType, Recipe } from '../types';
import { RecipeCard } from './RecipeCard';

const labels: Record<FavoriteListType, string> = {
  favorites: 'Favorilerim',
  cookLater: 'Sonra Pişireceğim',
  cookedBefore: 'Daha Önce Yaptıklarım',
};

type FavoriteRecipesSectionProps = {
  active: FavoriteListType;
  onChange: (list: FavoriteListType) => void;
  recipes: Recipe[];
  likedIds: Record<string, boolean>;
  onOpenRecipe: (recipeId: string) => void;
  onToggleLike: (recipeId: string) => void;
};

export function FavoriteRecipesSection({
  active,
  onChange,
  recipes,
  likedIds,
  onOpenRecipe,
  onToggleLike,
}: FavoriteRecipesSectionProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {(Object.keys(labels) as FavoriteListType[]).map((list) => (
          <TouchableOpacity
            key={list}
            onPress={() => onChange(list)}
            activeOpacity={0.85}
            style={[styles.tab, active === list && styles.activeTab]}
          >
            <Text style={[styles.tabText, active === list && styles.activeTabText]}>{labels[list]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Henüz favori tarifin yok. Beğendiğin tarifleri kaydetmeye başla.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              liked={Boolean(likedIds[recipe.id])}
              onPress={() => onOpenRecipe(recipe.id)}
              onToggleLike={() => onToggleLike(recipe.id)}
              variant="mini"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  tabs: {
    gap: 8,
  },
  tab: {
    minHeight: 40,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  cards: {
    gap: 12,
  },
  empty: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  emptyText: {
    color: theme.colors.muted,
    fontWeight: '700',
    textAlign: 'center',
  },
});
