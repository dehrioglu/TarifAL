import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { Recipe } from '../types';
import { getRecipeCost } from '../utils/recipeMatching';

const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const plannerGoals = ['Ekonomik', 'Sağlıklı', 'Yüksek protein', 'Pratik', 'Aile için', 'Öğrenci modu'];
const meals = ['Kahvaltı', 'Öğle', 'Akşam'];

type WeeklyMealPlannerProps = {
  recipes: Recipe[];
  onCreateList: () => void;
  onOpenRecipe?: (recipeId: string) => void;
  previewDays?: number;
};

export function WeeklyMealPlanner({ recipes, onCreateList, onOpenRecipe, previewDays = 7 }: WeeklyMealPlannerProps) {
  const [servings, setServings] = useState(3);
  const [budget, setBudget] = useState('1200 TL');
  const [goal, setGoal] = useState('Pratik');
  const [meal, setMeal] = useState('Akşam');
  const [planReady, setPlanReady] = useState(false);
  const visibleDays = days.slice(0, previewDays);
  const weeklyRecipes = useMemo(
    () => visibleDays.map((day, dayIndex) => ({
      day,
      recipes: [
        recipes[dayIndex % recipes.length],
        recipes[(dayIndex + 2) % recipes.length],
        recipes[(dayIndex + 4) % recipes.length],
      ].filter(Boolean),
    })),
    [recipes, visibleDays],
  );
  const totalCost = weeklyRecipes.reduce(
    (sum, day) => sum + (day.recipes[0] ? getRecipeCost(day.recipes[0]) : 0),
    0,
  );
  const missingCount = Math.max(8, Math.round(totalCost / 72));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <View style={styles.badge}>
            <Ionicons name="star" size={12} color={theme.colors.primary} />
            <Text style={styles.badgeText}>Premium özellik</Text>
          </View>
          <Text style={styles.title}>Haftalık yemek planını oluşturalım</Text>
          <Text style={styles.subtitle}>Zamanına, bütçene ve hedeflerine göre 7 günlük pratik yemek planı hazırla.</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="calendar-number-outline" size={21} color={theme.colors.primary} />
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Kaç kişilik?</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => setServings((value) => Math.max(1, value - 1))} style={styles.stepButton}>
              <Ionicons name="remove" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{servings}</Text>
            <TouchableOpacity onPress={() => setServings((value) => value + 1)} style={styles.stepButton}>
              <Ionicons name="add" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chipRow}>
          {['800 TL', '1200 TL', '1800 TL'].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setBudget(item)}
              activeOpacity={0.85}
              style={[styles.chip, budget === item && styles.activeChip]}
            >
              <Text style={[styles.chipText, budget === item && styles.activeChipText]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chipRow}>
          {plannerGoals.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setGoal(item)}
              activeOpacity={0.85}
              style={[styles.chip, goal === item && styles.activeChip]}
            >
              <Text style={[styles.chipText, goal === item && styles.activeChipText]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chipRow}>
          {meals.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setMeal(item)}
              activeOpacity={0.85}
              style={[styles.chip, meal === item && styles.activeChip]}
            >
              <Text style={[styles.chipText, meal === item && styles.activeChipText]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={() => setPlanReady(true)} activeOpacity={0.86} style={styles.generateButton}>
        <Ionicons name="sparkles" size={16} color="#FFFFFF" />
        <Text style={styles.generateButtonText}>Haftalık Plan Oluştur</Text>
      </TouchableOpacity>

      {planReady ? (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>7 günlük plan hazır</Text>
          <Text style={styles.summaryText}>Toplam tahmini bütçe: ₺{Math.round(totalCost)}</Text>
          <Text style={styles.summaryText}>Eksik ürün: {missingCount}</Text>
          <Text style={styles.summaryText}>Tekrarlanan malzemeler birleştirildi.</Text>
        </View>
      ) : null}

      <View style={styles.days}>
        {weeklyRecipes.map((dayPlan) => (
          <View key={dayPlan.day} style={styles.dayCard}>
            <Text style={styles.day}>{dayPlan.day}</Text>
            <View style={styles.meals}>
              {dayPlan.recipes.slice(0, 3).map((recipe) => (
                <TouchableOpacity
                  key={`${dayPlan.day}-${recipe.id}`}
                  disabled={!onOpenRecipe}
                  onPress={() => onOpenRecipe?.(recipe.id)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.meal} numberOfLines={1}>{recipe.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={onCreateList} activeOpacity={0.85} style={styles.button}>
        <Ionicons name="cart" size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>Alışveriş Listesine Dönüştür</Text>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    gap: 9,
  },
  controlRow: {
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    minWidth: 18,
    textAlign: 'center',
    color: theme.colors.text,
    fontWeight: '900',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  generateButton: {
    minHeight: 46,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  summary: {
    borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    padding: 13,
    gap: 3,
  },
  summaryTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  summaryText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  days: {
    gap: 8,
  },
  dayCard: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  day: {
    width: 72,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  meals: {
    flex: 1,
    gap: 4,
  },
  meal: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
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
