import { TouchableOpacity, StyleSheet, Text } from 'react-native';

import { theme } from '../../constants/theme';
import { TasteCategory } from '../../personalization/tasteProfileStore';

type CategoryInterestChipProps = {
  category: TasteCategory;
  label: string;
  score?: number;
  active?: boolean;
  onPress: (category: TasteCategory) => void;
};

export function CategoryInterestChip({
  category,
  label,
  score,
  active = false,
  onPress,
}: CategoryInterestChipProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(category)}
      activeOpacity={0.86}
      accessibilityRole="button"
      accessibilityLabel={`${label} ilgi filtresi`}
      style={[styles.chip, active && styles.activeChip]}
    >
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
      {typeof score === 'number' ? (
        <Text style={[styles.score, active && styles.activeLabel]}>{score}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 38,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  activeChip: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  score: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});
