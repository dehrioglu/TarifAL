import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { Ingredient } from '../../types';

type RecipeCompatibilityCardProps = {
  matchPercent: number;
  matchedIngredients: Ingredient[];
  missingIngredients: Ingredient[];
  alternatives: string[];
};

export function RecipeCompatibilityCard({
  matchPercent,
  matchedIngredients,
  missingIngredients,
  alternatives,
}: RecipeCompatibilityCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="sparkles" size={19} color={theme.colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>TarifAL AI analizi</Text>
          <Text style={styles.title}>Dolap Uyumu</Text>
        </View>
        <Text style={styles.score}>%{matchPercent}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${matchPercent}%` }]} />
      </View>
      <Text style={styles.helper}>
        {missingIngredients.length === 0
          ? 'Dolabındaki ürünlerle bu tarifi hemen hazırlayabilirsin.'
          : `${matchedIngredients.length} ürün hazır, yalnızca ${missingIngredients.length} ürünü tamamlaman yeterli.`}
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
          <Text style={styles.summaryText}>{matchedIngredients.length} ürün evde</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="basket-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.summaryText}>{missingIngredients.length} ürün eksik</Text>
        </View>
      </View>

      {alternatives.length > 0 ? (
        <View style={styles.alternativeBox}>
          <Text style={styles.alternativeTitle}>Akıllı alternatifler</Text>
          {alternatives.map((alternative) => (
            <View key={alternative} style={styles.alternativeRow}>
              <Ionicons name="swap-horizontal-outline" size={15} color={theme.colors.primary} />
              <Text style={styles.alternativeText}>{alternative}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 16,
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  score: {
    color: theme.colors.primary,
    fontSize: 26,
    fontWeight: '900',
  },
  progressTrack: {
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFE0CF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  helper: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryItem: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  alternativeBox: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
  },
  alternativeTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  alternativeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  alternativeText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
});
