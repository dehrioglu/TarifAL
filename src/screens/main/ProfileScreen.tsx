import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/AppButton';
import { RecipeCard } from '../../components/RecipeCard';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

type ProfileTab = 'mine' | 'liked';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<ProfileTab>('liked');
  const user = useAppStore((store) => store.user);
  const recipes = useAppStore((store) => store.recipes);
  const likes = useAppStore((store) => store.likes);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const signOut = useAppStore((store) => store.signOut);

  const myRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.createdBy === user?.id),
    [recipes, user?.id],
  );
  const likedRecipes = useMemo(
    () => recipes.filter((recipe) => likes[recipe.id]),
    [likes, recipes],
  );
  const totalHearts = myRecipes.reduce((sum, recipe) => sum + recipe.likes, 0);
  const visibleRecipes = activeTab === 'mine' ? myRecipes : likedRecipes;

  const handleSignOut = async () => {
    await signOut();
  };

  const openRecipe = (recipeId: string) => {
    navigation.getParent()?.navigate('RecipeDetail', { recipeId });
  };

  const handleTab = (tab: ProfileTab) => {
    setActiveTab(tab);
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.profileTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>T</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Tarif AI'}</Text>
        <Text style={styles.email}>{user?.email ?? 'tarifai@tarifai.com'}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{myRecipes.length}</Text>
          <Text style={styles.statLabel}>Tarif</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{likedRecipes.length}</Text>
          <Text style={styles.statLabel}>Beğeni</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalHearts}</Text>
          <Text style={styles.statLabel}>Toplam Kalp</Text>
        </View>
      </View>

      <AppButton
        title="Çıkış Yap"
        icon="log-out-outline"
        variant="outline"
        onPress={() =>
          Alert.alert('Çıkış yap', 'Hesabından çıkmak istiyor musun?', [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Çıkış Yap', style: 'destructive', onPress: handleSignOut },
          ])
        }
        style={styles.logout}
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => handleTab('mine')}
          activeOpacity={0.86}
          style={[styles.tabButton, activeTab === 'mine' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'mine' && styles.activeTabText]}>Tariflerim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTab('liked')}
          activeOpacity={0.86}
          style={[styles.tabButton, activeTab === 'liked' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'liked' && styles.activeTabText]}>Beğendiklerim</Text>
        </TouchableOpacity>
      </View>

      {visibleRecipes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={30} color={theme.colors.subtle} />
          <Text style={styles.emptyText}>
            {activeTab === 'mine' ? 'Henüz tarif paylaşmadın.' : 'Henüz beğendiğin tarif yok.'}
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipeRow}>
          {visibleRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              liked={Boolean(likes[recipe.id])}
              onPress={() => openRecipe(recipe.id)}
              onToggleLike={() => toggleLike(recipe.id)}
              variant="mini"
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 36,
  },
  profileTop: {
    alignItems: 'center',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.orangeShadow,
    shadowOpacity: 0.12,
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 33,
    fontWeight: '900',
  },
  name: {
    marginTop: 16,
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  email: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  stats: {
    marginTop: 22,
    minHeight: 72,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.border,
  },
  logout: {
    alignSelf: 'center',
    minHeight: 42,
    marginTop: 16,
    paddingHorizontal: 18,
  },
  tabs: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    height: 44,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.muted,
    fontWeight: '900',
    fontSize: 13,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  recipeRow: {
    gap: 12,
    paddingTop: 18,
    paddingBottom: 4,
  },
  empty: {
    marginTop: 18,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: 132,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
