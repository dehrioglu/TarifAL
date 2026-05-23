import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { Recipe } from '../types';

type DailyMealPlanProps = {
  recipes: Recipe[];
  onCreateList: () => void;
  onOpenRecipe: (recipeId: string) => void;
};

export function DailyMealPlan({ recipes, onCreateList, onOpenRecipe }: DailyMealPlanProps) {
  const mealSlots = [
    { label: 'Kahvaltı', recipe: recipes.find((recipe) => recipe.category === 'Kahvaltı') },
    { label: 'Öğle', recipe: recipes.find((recipe) => recipe.category === 'Çorba') ?? recipes[0] },
    { label: 'Akşam', recipe: recipes.find((recipe) => recipe.category === 'Ana Yemek') },
    { label: 'Tatlı', recipe: recipes.find((recipe) => recipe.category === 'Tatlı') },
  ].filter((slot) => slot.recipe);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bugün Ne Pişirsem?</Text>
          <Text style={styles.subtitle}>Dengeli günlük menü önerisi</Text>
        </View>
        <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.slots}>
        {mealSlots.map((slot) => (
          <TouchableOpacity
            key={slot.label}
            onPress={() => slot.recipe && onOpenRecipe(slot.recipe.id)}
            activeOpacity={0.85}
            style={styles.slot}
          >
            <Text style={styles.slotLabel}>{slot.label}</Text>
            <Text style={styles.slotTitle} numberOfLines={1}>{slot.recipe?.title}</Text>
            <Text style={styles.slotMeta}>{slot.recipe?.prepTime} dk • {slot.recipe?.difficulty}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={onCreateList} activeOpacity={0.85} style={styles.button}>
        <Ionicons name="bag-add" size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>Bu menünün alışveriş listesini oluştur</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  slots: {
    gap: 9,
  },
  slot: {
    borderRadius: 15,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  slotLabel: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  slotTitle: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  slotMeta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    minHeight: 46,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
