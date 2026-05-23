import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { theme } from '../constants/theme';

export type BudgetFilter = 'Hepsi' | 'Ekonomik' | 'Öğrenci' | '100 TL altı' | '200 TL altı' | 'Aile boyu';

const filters: BudgetFilter[] = ['Hepsi', 'Ekonomik', 'Öğrenci', '100 TL altı', '200 TL altı', 'Aile boyu'];

type BudgetRecipeFiltersProps = {
  active: BudgetFilter;
  onChange: (filter: BudgetFilter) => void;
};

export function BudgetRecipeFilters({ active, onChange }: BudgetRecipeFiltersProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          onPress={() => onChange(filter)}
          activeOpacity={0.85}
          style={[styles.chip, active === filter && styles.activeChip]}
        >
          <Text style={[styles.text, active === filter && styles.activeText]}>{filter}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 10,
  },
  chip: {
    minHeight: 38,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  text: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
