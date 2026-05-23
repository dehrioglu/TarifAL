import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { RecipeMatch } from '../types';
import { getRecipeCost, getRecipeSuitabilityScore } from '../utils/recipeMatching';

type SmartRecipeCardProps = {
  match: RecipeMatch;
  favorite: boolean;
  onPress: () => void;
  onCook: () => void;
  onAddMissing: () => void;
  onToggleFavorite: () => void;
};

export function SmartRecipeCard({
  match,
  favorite,
  onPress,
  onCook,
  onAddMissing,
  onToggleFavorite,
}: SmartRecipeCardProps) {
  const userGoal = useAppStore((store) => store.userGoal);
  const { recipe, missingIngredients, matchPercent, label } = match;
  const visibleMissing = missingIngredients.slice(0, 3);
  const hiddenMissingCount = Math.max(0, missingIngredients.length - visibleMissing.length);
  const cost = getRecipeCost(recipe);
  const suitabilityScore = getRecipeSuitabilityScore(recipe, matchPercent, userGoal);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={styles.title} numberOfLines={1}>{recipe.title}</Text>
          <TouchableOpacity onPress={onToggleFavorite} activeOpacity={0.8} style={styles.favorite}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={19} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{recipe.prepTime} dk</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{recipe.difficulty}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{recipe.calories} kcal</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>₺{cost.toFixed(0)}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>%{matchPercent}</Text>
          </View>
          <Text style={styles.statusText}>{match.qualityLabel}</Text>
          <Text style={styles.missingText}>{missingIngredients.length} eksik</Text>
        </View>
        <View style={styles.aiScoreRow}>
          <View style={styles.aiScoreBadge}>
            <Ionicons name="sparkles" size={12} color={theme.colors.primary} />
            <Text style={styles.aiScoreText}>Sana uygunluk %{suitabilityScore}</Text>
          </View>
          <Text style={styles.perPersonText}>Kişi başı ₺{(cost / Math.max(1, recipe.servings)).toFixed(0)}</Text>
        </View>
        <Text style={styles.countText}>
          {match.matchedIngredients.length} eşleşti • {label}
        </Text>
        {missingIngredients.length > 0 ? (
          <Text style={styles.missingList} numberOfLines={1}>
            Eksik: {visibleMissing.map((ingredient) => ingredient.name).join(', ')}
            {hiddenMissingCount > 0 ? ` +${hiddenMissingCount} daha` : ''}
          </Text>
        ) : (
          <Text style={styles.missingList}>Tüm malzemeler hazır.</Text>
        )}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onCook} activeOpacity={0.85} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Hemen Pişir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAddMissing}
            activeOpacity={0.85}
            disabled={missingIngredients.length === 0}
            style={[styles.softButton, missingIngredients.length === 0 && styles.disabledButton]}
          >
            <Text style={styles.softText}>Eksikleri Al</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10,
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 92,
    height: 134,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
  },
  body: {
    flex: 1,
    gap: 7,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  favorite: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  dot: {
    color: theme.colors.subtle,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  percentBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  percentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  statusText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  missingText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  aiScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  aiScoreBadge: {
    flex: 1,
    minHeight: 26,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiScoreText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  perPersonText: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  countText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  missingList: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  softButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.55,
  },
  softText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});
