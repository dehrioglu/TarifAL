import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { categoryIcons } from '../constants/categories';
import { theme } from '../constants/theme';
import { CategoryFilter, RecipeCategory } from '../types';

type IconName = ComponentProps<typeof Ionicons>['name'];

type CategoryPillProps = {
  category: CategoryFilter | RecipeCategory;
  active: boolean;
  onPress: () => void;
  tall?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CategoryPill({ category, active, onPress, tall = false, style }: CategoryPillProps) {
  const iconName = (categoryIcons[category as CategoryFilter] ?? 'restaurant') as IconName;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        tall ? styles.tall : styles.compact,
        active && styles.active,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons name={iconName} size={tall ? 16 : 14} color={active ? '#FFFFFF' : '#5B477A'} />
      <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
        {category}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  compact: {
    height: 44,
    paddingHorizontal: 16,
  },
  tall: {
    width: 78,
    height: 178,
    flexDirection: 'column',
    paddingHorizontal: 8,
  },
  active: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});
