import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/AppButton';
import { BrandLogo } from '../../components/BrandLogo';
import { FavoriteRecipesSection } from '../../components/FavoriteRecipesSection';
import { GamificationCard } from '../../components/GamificationCard';
import { InvestorDemoPanel } from '../../components/InvestorDemoPanel';
import { RecipeCard } from '../../components/RecipeCard';
import { Screen } from '../../components/Screen';
import { UserGoalSelector } from '../../components/UserGoalSelector';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { FavoriteListType } from '../../types';

type ProfileTab = 'mine' | 'liked';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<ProfileTab>('liked');
  const [favoriteTab, setFavoriteTab] = useState<FavoriteListType>('favorites');
  const [showInvestorDemo, setShowInvestorDemo] = useState(false);
  const user = useAppStore((store) => store.user);
  const recipes = useAppStore((store) => store.recipes);
  const likes = useAppStore((store) => store.likes);
  const cart = useAppStore((store) => store.cart);
  const orders = useAppStore((store) => store.orders);
  const userGoal = useAppStore((store) => store.userGoal);
  const recipeLists = useAppStore((store) => store.recipeLists);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const setUserGoal = useAppStore((store) => store.setUserGoal);
  const signOut = useAppStore((store) => store.signOut);
  const requestGuidedTourReplay = useAppStore((store) => store.requestGuidedTourReplay);

  const myRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.createdBy === user?.id),
    [recipes, user?.id],
  );
  const likedRecipes = useMemo(
    () => recipes.filter((recipe) => likes[recipe.id]),
    [likes, recipes],
  );
  const totalHearts = myRecipes.reduce((sum, recipe) => sum + recipe.likes, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const visibleRecipes = activeTab === 'mine' ? myRecipes : likedRecipes;
  const favoriteRecipes = useMemo(
    () => recipes.filter((recipe) => recipeLists[favoriteTab].includes(recipe.id)),
    [favoriteTab, recipeLists, recipes],
  );

  const handleSignOut = async () => {
    await signOut();
  };

  const openRecipe = (recipeId: string) => {
    navigation.getParent()?.navigate('RecipeDetail', { recipeId });
  };

  const handleTab = (tab: ProfileTab) => {
    setActiveTab(tab);
  };

  const handleReplayTour = () => {
    void requestGuidedTourReplay();
    navigation.navigate('Home');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.profileTop}>
        <View style={styles.avatar}>
          <BrandLogo variant="mark" size={78} />
        </View>
        <Text style={styles.name}>{user?.name ?? 'Enes'}</Text>
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
          <Text style={styles.statLabel}>Favori</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{cartCount}</Text>
          <Text style={styles.statLabel}>Sepet</Text>
        </View>
      </View>

      <View style={styles.profileSummary}>
        <View style={styles.summaryItem}>
          <Ionicons name="flame-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.summaryText}>Hedef: {userGoal}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="bag-check-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.summaryText}>
            {recipeLists.cookedBefore.length} tamamlanan tarif • {totalHearts} toplam kalp • {orders.length} sipariş
          </Text>
        </View>
      </View>

      <View style={styles.goalWrap}>
        <GamificationCard />
      </View>

      <View style={styles.goalWrap}>
        <UserGoalSelector value={userGoal} onChange={setUserGoal} />
      </View>

      <AppButton
        title="Tanıtım turunu tekrar göster"
        icon="sparkles-outline"
        variant="soft"
        onPress={handleReplayTour}
        style={styles.tourButton}
      />

      <AppButton
        title={showInvestorDemo ? 'Demo Modunu Gizle' : 'Yatırımcı Demo Modu'}
        icon="analytics-outline"
        variant="soft"
        onPress={() => setShowInvestorDemo((value) => !value)}
        style={styles.tourButton}
      />

      {showInvestorDemo ? (
        <View style={styles.goalWrap}>
          <InvestorDemoPanel />
        </View>
      ) : null}

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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tarif Koleksiyonları</Text>
      </View>
      <FavoriteRecipesSection
        active={favoriteTab}
        onChange={setFavoriteTab}
        recipes={favoriteRecipes}
        likedIds={likes}
        onOpenRecipe={openRecipe}
        onToggleLike={toggleLike}
      />
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
  profileSummary: {
    marginTop: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    padding: 14,
    gap: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  logout: {
    alignSelf: 'center',
    minHeight: 42,
    marginTop: 16,
    paddingHorizontal: 18,
  },
  tourButton: {
    marginTop: 14,
  },
  goalWrap: {
    marginTop: 16,
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
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
});
