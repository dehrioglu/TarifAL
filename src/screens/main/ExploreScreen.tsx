import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { CategoryPill } from '../../components/CategoryPill';
import { InputField } from '../../components/InputField';
import { RecipeCard } from '../../components/RecipeCard';
import { Screen } from '../../components/Screen';
import { categoryFilters } from '../../constants/categories';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { CategoryFilter } from '../../types';

export function ExploreScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('Hepsi');
  const recipes = useAppStore((store) => store.recipes);
  const likes = useAppStore((store) => store.likes);
  const toggleLike = useAppStore((store) => store.toggleLike);

  const filteredRecipes = useMemo(() => {
    const normalized = query.toLocaleLowerCase('tr-TR').trim();

    return recipes.filter((recipe) => {
      const matchesCategory = category === 'Hepsi' || recipe.category === category;
      const matchesQuery =
        !normalized ||
        recipe.title.toLocaleLowerCase('tr-TR').includes(normalized) ||
        recipe.description.toLocaleLowerCase('tr-TR').includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [category, query, recipes]);

  const openRecipe = (recipeId: string) => {
    navigation.getParent()?.navigate('RecipeDetail', { recipeId });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.title}>Keşfet</Text>
      <Text style={styles.subtitle}>İstediğin tarifi bul</Text>

      <InputField
        icon="search-outline"
        value={query}
        onChangeText={setQuery}
        placeholder="Tarif ara..."
        containerStyle={styles.search}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tallFilters}>
        {categoryFilters.map((item) => (
          <CategoryPill
            key={item}
            category={item}
            active={category === item}
            onPress={() => setCategory(item)}
            tall
          />
        ))}
      </ScrollView>

      <View style={styles.grid}>
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            liked={Boolean(likes[recipe.id])}
            onPress={() => openRecipe(recipe.id)}
            onToggleLike={() => toggleLike(recipe.id)}
            variant="grid"
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  search: {
    marginTop: 16,
  },
  tallFilters: {
    gap: 10,
    paddingTop: 16,
    paddingBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
});
