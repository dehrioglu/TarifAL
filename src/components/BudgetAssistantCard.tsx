import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { budgetModes } from '../data/demoPremium';
import { theme } from '../constants/theme';
import { RecipeMatch } from '../types';
import { getRecipeCost } from '../utils/recipeMatching';

type BudgetAssistantCardProps = {
  matches: RecipeMatch[];
  onOpenRecipe: (recipeId: string) => void;
};

export function BudgetAssistantCard({ matches, onOpenRecipe }: BudgetAssistantCardProps) {
  const [activeMode, setActiveMode] = useState<(typeof budgetModes)[number]>('150 TL altı');
  const budgetRecipes = useMemo(
    () =>
      [...matches]
        .filter((match) => {
          const cost = getRecipeCost(match.recipe);

          if (activeMode === '150 TL altı') {
            return cost <= 150;
          }

          if (activeMode === '250 TL altı') {
            return cost <= 250;
          }

          if (activeMode === '4 kişilik ekonomik') {
            return match.recipe.servings >= 4 && cost <= 260;
          }

          if (activeMode === 'Ay sonu modu') {
            return cost <= 120 || match.recipe.tags.some((tag) => tag.toLocaleLowerCase('tr-TR').includes('ekonomik'));
          }

          return match.recipe.tags.some((tag) => tag.toLocaleLowerCase('tr-TR').includes('öğrenci'));
        })
        .slice(0, 3),
    [activeMode, matches],
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bütçene göre yemek önerelim</Text>
          <Text style={styles.subtitle}>Kaç kişilik ve kaç TL altında yemek istediğini seç.</Text>
        </View>
        <Ionicons name="wallet-outline" size={22} color={theme.colors.primary} />
      </View>

      <View style={styles.chips}>
        {budgetModes.map((mode) => {
          const active = activeMode === mode;

          return (
            <TouchableOpacity
              key={mode}
              onPress={() => setActiveMode(mode)}
              activeOpacity={0.86}
              style={[styles.chip, active && styles.activeChip]}
            >
              <Text style={[styles.chipText, active && styles.activeChipText]}>{mode}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.results}>
        {budgetRecipes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Bu bütçeye yakın tarifleri AI öneri listesinden tekrar sıralayabiliriz.</Text>
          </View>
        ) : (
          budgetRecipes.map((match) => {
            const cost = getRecipeCost(match.recipe);
            const perPerson = cost / Math.max(1, match.recipe.servings);

            return (
              <TouchableOpacity
                key={match.recipe.id}
                onPress={() => onOpenRecipe(match.recipe.id)}
                activeOpacity={0.86}
                style={styles.result}
              >
                <View style={styles.resultTop}>
                  <Text style={styles.resultTitle} numberOfLines={1}>{match.recipe.title}</Text>
                  <Text style={styles.resultPrice}>₺{cost.toFixed(0)}</Text>
                </View>
                <Text style={styles.resultMeta}>
                  Kişi başı ₺{perPerson.toFixed(0)} • {match.recipe.prepTime} dk • %{match.matchPercent} uyum
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {activeMode === 'Ay sonu modu' ? 'Ay Sonu Kurtarıcısı' : activeMode === 'Öğrenci modu' ? 'Öğrenci Favorisi' : 'Bütçe Dostu'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 36,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  results: {
    gap: 9,
  },
  result: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 7,
  },
  resultTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  resultPrice: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  resultMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  empty: {
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
