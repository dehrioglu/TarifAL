import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { SmartBasketPlan } from '../types';

type SmartBasketPlanCardProps = {
  plan: SmartBasketPlan;
  selected?: boolean;
  onSelect: () => void;
  onOpenRecipe: () => void;
};

export function SmartBasketPlanCard({
  plan,
  selected = false,
  onSelect,
  onOpenRecipe,
}: SmartBasketPlanCardProps) {
  return (
    <View style={[styles.card, selected && styles.selectedCard]}>
      <Image source={{ uri: plan.recipeImage }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>{plan.recipeTitle}</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>%{plan.suitabilityScore}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>{plan.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{plan.prepTime} dk</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{plan.difficulty}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{plan.calories} kcal</Text>
        </View>
        <View style={styles.statGrid}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>%{plan.matchPercent}</Text>
            <Text style={styles.statLabel}>Malzeme uyumu</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>₺{plan.estimatedCost}</Text>
            <Text style={styles.statLabel}>Tahmini maliyet</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{plan.missingIngredients.length}</Text>
            <Text style={styles.statLabel}>Eksik ürün</Text>
          </View>
        </View>
        <Text style={styles.helper}>Kişi başı ₺{plan.perPersonCost} • {plan.budgetLabel}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onSelect} activeOpacity={0.86} style={styles.primaryButton}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.primaryText}>Planı Seç</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenRecipe} activeOpacity={0.86} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Tarifi Gör</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10,
    flexDirection: 'row',
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFF8F4',
  },
  image: {
    width: 94,
    height: 176,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
  },
  body: {
    flex: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  scoreBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
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
    fontSize: 11,
    fontWeight: '900',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  stat: {
    flex: 1,
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    padding: 8,
    justifyContent: 'center',
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 9,
    fontWeight: '800',
  },
  helper: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 0.9,
    minHeight: 38,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});
