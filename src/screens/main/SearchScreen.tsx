import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RecipeCard } from '../../components/RecipeCard';
import { Screen } from '../../components/Screen';
import { SearchResultTabs, SearchTab } from '../../components/SearchResultTabs';
import { UserProfileCard } from '../../components/UserProfileCard';
import { CollectionCard } from '../../components/CollectionCard';
import { theme } from '../../constants/theme';
import { enhancedSocialCollections } from '../../data/mockCollections';
import { mockSocialUsers } from '../../data/mockSocial';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { RootStackParamList } from '../../navigation/types';
import { useUserTasteProfile } from '../../personalization/useUserTasteProfile';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

const popularQueries = ['içli köfte', 'baklava', 'ekonomik', 'fit', 'Şef Murat', 'Tatlı Krizi'];

const normalize = (value: string) =>
  value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('içli köfte');
  const [activeTab, setActiveTab] = useState<SearchTab>('recipes');
  const recipes = useAppStore((store) => store.recipes);
  const likes = useAppStore((store) => store.likes);
  const followedUsers = useAppStore((store) => store.followedUsers);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const toggleFollowUser = useAppStore((store) => store.toggleFollowUser);
  const { showToast } = useFeedback();
  const { recordChefFollow, recordRecipeInteraction, recordTagInteraction } = useUserTasteProfile();
  const normalizedQuery = normalize(query.trim());

  const recipeResults = useMemo(
    () =>
      recipes.filter((recipe) => {
        const haystack = normalize(`${recipe.title} ${recipe.description} ${recipe.category} ${recipe.tags.join(' ')} ${recipe.ingredients.map((item) => item.name).join(' ')}`);
        return !normalizedQuery || haystack.includes(normalizedQuery);
      }),
    [normalizedQuery, recipes],
  );

  const chefResults = useMemo(
    () =>
      mockSocialUsers.filter((user) => {
        const haystack = normalize(`${user.name} ${user.username} ${user.bio} ${user.badges.join(' ')} ${user.expertiseAreas.join(' ')}`);
        return !normalizedQuery || haystack.includes(normalizedQuery);
      }),
    [normalizedQuery],
  );

  const tagResults = useMemo(() => {
    const tags = new Set<string>();
    recipes.forEach((recipe) => recipe.tags.forEach((tag) => tags.add(tag)));
    mockSocialUsers.forEach((user) => user.badges.forEach((badge) => tags.add(badge)));

    return Array.from(tags).filter((tag) => !normalizedQuery || normalize(tag).includes(normalizedQuery)).slice(0, 24);
  }, [normalizedQuery, recipes]);

  const collectionResults = useMemo(
    () =>
      enhancedSocialCollections.filter((collection) => {
        const haystack = normalize(`${collection.title} ${collection.description}`);
        return !normalizedQuery || haystack.includes(normalizedQuery);
      }),
    [normalizedQuery],
  );

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.86} style={styles.backButton}>
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Sosyal Arama</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={19} color={theme.colors.subtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tarif, şef, etiket veya koleksiyon ara..."
          placeholderTextColor={theme.colors.subtle}
          style={styles.input}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
        {popularQueries.map((item) => (
          <TouchableOpacity key={item} onPress={() => setQuery(item)} activeOpacity={0.86} style={styles.popularChip}>
            <Text style={styles.popularText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SearchResultTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === 'recipes' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipeRow}>
          {recipeResults.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              liked={Boolean(likes[recipe.id])}
              onPress={() => {
                recordRecipeInteraction(recipe, 'view');
                navigation.navigate('RecipeDetail', { recipeId: recipe.id });
              }}
              onToggleLike={() => {
                if (!likes[recipe.id]) {
                  recordRecipeInteraction(recipe, 'like');
                }
                toggleLike(recipe.id);
              }}
              variant="mini"
            />
          ))}
        </ScrollView>
      ) : null}

      {activeTab === 'chefs' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipeRow}>
          {chefResults.map((user) => (
            <UserProfileCard
              key={user.id}
              user={user}
              following={Boolean(followedUsers[user.id])}
              onPress={() => navigation.navigate('SocialProfile', { userId: user.id })}
              onToggleFollow={() => {
                if (!followedUsers[user.id]) {
                  recordChefFollow(user);
                }
                toggleFollowUser(user.id);
                showToast(followedUsers[user.id] ? 'Takip bırakıldı.' : `${user.name} takip ediliyor.`);
              }}
            />
          ))}
        </ScrollView>
      ) : null}

      {activeTab === 'tags' ? (
        <View style={styles.tagGrid}>
          {tagResults.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => {
                setQuery(tag);
                recordTagInteraction(tag);
              }}
              activeOpacity={0.86}
              style={styles.tag}
            >
              <Text style={styles.tagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {activeTab === 'collections' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipeRow}>
          {collectionResults.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onPress={() => navigation.navigate('CollectionDetail', { collectionId: collection.id })}
            />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.resultSummary}>
        <Text style={styles.resultTitle}>Sonuç özeti</Text>
        <Text style={styles.resultText}>
          {recipeResults.length} tarif, {chefResults.length} şef, {tagResults.length} etiket ve {collectionResults.length} koleksiyon bulundu.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingTop: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  searchBox: {
    marginTop: 18,
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  popularRow: {
    gap: 8,
    paddingVertical: 12,
  },
  popularChip: {
    minHeight: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  popularText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  recipeRow: {
    gap: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
  },
  tag: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  tagText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  resultSummary: {
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    padding: 14,
  },
  resultTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  resultText: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
});
