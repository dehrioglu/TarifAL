import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type SelectedIngredientsChipsProps = {
  ingredients: string[];
  onRemove: (ingredient: string) => void;
};

export function SelectedIngredientsChips({ ingredients, onRemove }: SelectedIngredientsChipsProps) {
  if (ingredients.length === 0) {
    return null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {ingredients.map((ingredient) => (
        <TouchableOpacity
          key={ingredient}
          onPress={() => onRemove(ingredient)}
          activeOpacity={0.85}
          style={styles.chip}
        >
          <Text style={styles.text}>{ingredient}</Text>
          <Ionicons name="close" size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingTop: 12,
    paddingBottom: 2,
  },
  chip: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});
