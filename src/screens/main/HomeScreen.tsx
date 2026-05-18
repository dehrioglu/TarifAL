import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { CategoryPill } from '../../components/CategoryPill';
import { RecipeCard } from '../../components/RecipeCard';
import { Screen } from '../../components/Screen';
import { categoryFilters } from '../../constants/categories';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { CategoryFilter } from '../../types';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Hepsi');
  const user = useAppStore((store) => store.user);
  const recipes = useAppStore((store) => store.recipes);
  const likes = useAppStore((store) => store.likes);
  const toggleLike = useAppStore((store) => store.toggleLike);

  const featured = recipes.find((recipe) => recipe.isFeatured) ?? recipes[0];
  const filteredRecipes = useMemo(
    () =>
      selectedCategory === 'Hepsi'
        ? recipes
        : recipes.filter((recipe) => recipe.category === selectedCategory),
    [recipes, selectedCategory],
  );

  const openRecipe = (recipeId: string) => {
    navigation.getParent()?.navigate('RecipeDetail', { recipeId });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user?.name.split(' ')[0] ?? 'Tarif'} 👋</Text>
          <Text style={styles.title}>Bugün ne pişirelim?</Text>
        </View>
        <TouchableOpacity activeOpacity={0.85} style={styles.avatar}>
          <Text style={styles.avatarText}>T</Text>
        </TouchableOpacity>
      </View>

      <RecipeCard
        recipe={featured}
        liked={Boolean(likes[featured.id])}
        onPress={() => openRecipe(featured.id)}
        onToggleLike={() => toggleLike(featured.id)}
        variant="featured"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {categoryFilters.map((category) => (
          <CategoryPill
            key={category}
            category={category}
            active={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tarifler</Text>
        <Text style={styles.count}>{filteredRecipes.length} tarif</Text>
      </View>

      <View style={styles.recipeList}>
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            liked={Boolean(likes[recipe.id])}
            onPress={() => openRecipe(recipe.id)}
            onToggleLike={() => toggleLike(recipe.id)}
            variant="wide"
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  greeting: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 25,
    fontWeight: '900',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 17,
  },
  filters: {
    gap: 10,
    paddingVertical: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  count: {
    color: theme.colors.subtle,
    fontSize: 13,
    fontWeight: '700',
  },
  recipeList: {
    gap: 16,
  },
});
