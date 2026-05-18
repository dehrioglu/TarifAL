import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { Ingredient } from '../types';

type IngredientCardProps = {
  ingredient: Ingredient;
  onOrder: () => void;
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
      <TouchableOpacity onPress={onOrder} activeOpacity={0.85} style={styles.button}>
        <Ionicons name="bag-add" size={14} color="#FFFFFF" />
        <Text style={styles.buttonText}>Sipariş Ver</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: {
    flex: 1,
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
});
