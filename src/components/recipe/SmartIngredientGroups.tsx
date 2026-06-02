import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { Ingredient } from '../../types';

type SmartIngredientGroupsProps = {
  matchedIngredients: Ingredient[];
  missingIngredients: Ingredient[];
  alternatives: string[];
};

export function SmartIngredientGroups({
  matchedIngredients,
  missingIngredients,
  alternatives,
}: SmartIngredientGroupsProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.sectionTitle}>Akıllı malzeme listesi</Text>
      <Text style={styles.sectionSubtitle}>Dolabın, eksiklerin ve kullanabileceğin alternatifler tek yerde.</Text>

      <IngredientGroup
        icon="checkmark-circle"
        title="Evde Olanlar"
        tone="success"
        ingredients={matchedIngredients}
        emptyText="Henüz eşleşen ürün yok."
      />
      <IngredientGroup
        icon="basket-outline"
        title="Eksik Olanlar"
        tone="primary"
        ingredients={missingIngredients}
        emptyText="Harika, eksik ürün görünmüyor."
      />

      <View style={[styles.group, styles.alternativeGroup]}>
        <View style={styles.groupHeader}>
          <Ionicons name="swap-horizontal-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.groupTitle}>Alternatif Öneriler</Text>
        </View>
        {alternatives.map((alternative) => (
          <Text key={alternative} style={styles.alternativeText}>• {alternative}</Text>
        ))}
      </View>
    </View>
  );
}

function IngredientGroup({
  icon,
  title,
  tone,
  ingredients,
  emptyText,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tone: 'success' | 'primary';
  ingredients: Ingredient[];
  emptyText: string;
}) {
  const color = tone === 'success' ? theme.colors.success : theme.colors.primary;
  return (
    <View style={[styles.group, tone === 'success' ? styles.successGroup : styles.missingGroup]}>
      <View style={styles.groupHeader}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={styles.groupTitle}>{title}</Text>
      </View>
      {ingredients.length === 0 ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        ingredients.map((ingredient) => (
          <View key={ingredient.id} style={styles.ingredientRow}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <Text style={styles.ingredientAmount}>{ingredient.gram} gr</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 22,
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  sectionSubtitle: {
    marginBottom: 2,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  group: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 13,
    gap: 8,
  },
  successGroup: {
    borderColor: '#CDEEDC',
    backgroundColor: '#F2FFF7',
  },
  missingGroup: {
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
  },
  alternativeGroup: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  groupTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  ingredientRow: {
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  ingredientName: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  ingredientAmount: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  alternativeText: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
});
