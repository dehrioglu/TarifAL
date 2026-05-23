import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { Ingredient, MarketAlternative } from '../types';

type IngredientCardProps = {
  ingredient: Ingredient;
  onOrder: (alternative?: MarketAlternative) => void;
};

export function IngredientCard({ ingredient, onOrder }: IngredientCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>{ingredient.name}</Text>
        <Text style={styles.meta}>
          {ingredient.gram} gr • ₺{ingredient.price.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => onOrder()} activeOpacity={0.85} style={styles.button}>
        <Ionicons name="bag-add" size={14} color="#FFFFFF" />
        <Text style={styles.buttonText}>Sipariş Ver</Text>
      </TouchableOpacity>
      {ingredient.alternatives?.length ? (
        <View style={styles.alternatives}>
          {ingredient.alternatives.map((alternative) => (
            <TouchableOpacity
              key={alternative.id}
              onPress={() => onOrder(alternative)}
              activeOpacity={0.85}
              style={styles.alternativeButton}
            >
              <Text style={styles.alternativeTitle} numberOfLines={1}>{alternative.name}</Text>
              <Text style={styles.alternativeMeta}>
                {alternative.note} • ₺{alternative.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 74,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  copy: {
    paddingRight: 112,
    gap: 4,
  },
  name: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 15,
  },
  meta: {
    color: theme.colors.muted,
    fontWeight: '600',
    fontSize: 12,
  },
  button: {
    position: 'absolute',
    top: 16,
    right: 14,
    minHeight: 42,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  alternatives: {
    gap: 8,
  },
  alternativeButton: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  alternativeTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  alternativeMeta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
});
