import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/AppButton';
import { BrandLogo } from '../../components/BrandLogo';
import { FavoriteRecipesSection } from '../../components/FavoriteRecipesSection';
import { GamificationCard } from '../../components/GamificationCard';
import { InvestorDemoPanel } from '../../components/InvestorDemoPanel';
import { ProfileAchievementCards } from '../../components/ProfileAchievementCards';
import { ProfileCollectionShowcase } from '../../components/profile/ProfileCollectionShowcase';
import { RecipeCard } from '../../components/RecipeCard';
import { DailyReturnCard } from '../../components/retention/DailyReturnCard';
import { Screen } from '../../components/Screen';
import { UserGoalSelector } from '../../components/UserGoalSelector';
import { theme } from '../../constants/theme';
import { enhancedSocialCollections } from '../../data/mockCollections';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { useDailyReturn } from '../../retention/useDailyReturn';
import { useAppStore } from '../../store/useAppStore';
import { FavoriteListType, UserGoal } from '../../types';

type ProfileTab = 'mine' | 'saved' | 'collections' | 'tried' | 'activity';

const profileTabs: Array<{ id: ProfileTab; label: string }> = [
  { id: 'mine', label: 'Paylaştıklarım' },
  { id: 'saved', label: 'Kaydettiklerim' },
  { id: 'collections', label: 'Koleksiyonlarım' },
  { id: 'tried', label: 'Denediklerim' },
  { id: 'activity', label: 'Aktivitem' },
];

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<ProfileTab>('saved');
  const [favoriteTab, setFavoriteTab] = useState<FavoriteListType>('favorites');
  const [showInvestorDemo, setShowInvestorDemo] = useState(false);
  const user = useAppStore((store) => store.user);
  const recipes = useAppStore((store) => store.recipes);
  const likes = useAppStore((store) => store.likes);
  const cart = useAppStore((store) => store.cart);
  const orders = useAppStore((store) => store.orders);
  const userGoal = useAppStore((store) => store.userGoal);
  const recipeLists = useAppStore((store) => store.recipeLists);
  const triedRecipes = useAppStore((store) => store.triedRecipes);
  const collectionSaves = useAppStore((store) => store.collectionSaves);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const setUserGoal = useAppStore((store) => store.setUserGoal);
  const signOut = useAppStore((store) => store.signOut);
  const requestGuidedTourReplay = useAppStore((store) => store.requestGuidedTourReplay);
  const { showToast, showDemoModal } = useFeedback();
  const { streak, completedToday, completeDailyAction } = useDailyReturn();

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
  const triedRecipeCards = useMemo(
    () => recipes.filter((recipe) => triedRecipes.some((item) => item.recipeId === recipe.id)),
    [recipes, triedRecipes],
  );
  const visibleRecipes = activeTab === 'mine' ? myRecipes : activeTab === 'tried' ? triedRecipeCards : likedRecipes;
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
    showToast('Tanıtım turu yeniden başlatılacak.', 'info');
    navigation.navigate('Home');
  };

  const openFamilyAccount = () => {
    navigation.getParent()?.navigate('FamilyAccount');
  };

  const handleUserGoalChange = (goal: UserGoal) => {
    setUserGoal(goal);
    showToast(`Hedef güncellendi: ${goal}`, 'info');
  };

  const openCollection = (collectionId: string) => {
    navigation.getParent()?.navigate('CollectionDetail', { collectionId });
  };

  const achievements = [
    'TarifAL Onaylı kurucu profil',
    `${Math.max(2, recipeLists.cookedBefore.length)} tarif mutfak geçmişinde`,
    `${Math.max(3, likedRecipes.length)} tarif koleksiyonlara ilham verdi`,
    `${streak} günlük mutfak serisi`,
  ];

  const confirmSignOut = () => {
    showDemoModal({
      title: 'Çıkış yap',
      message: 'Hesabından çıkmak istiyor musun?',
      primaryLabel: 'Çıkış Yap',
      secondaryLabel: 'Vazgeç',
      onPrimary: () => {
        void handleSignOut();
      },
    });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.profileTop}>
        <View style={styles.avatar}>
          <BrandLogo size={94} />
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

      <View style={styles.socialIdentity}>
        <View style={styles.socialIdentityHeader}>
          <View style={styles.socialIdentityIcon}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.socialIdentityCopy}>
            <Text style={styles.socialIdentityTitle}>@eneschef</Text>
            <Text style={styles.socialIdentityText}>
              TarifAL kurucusu · Pratik tarifler, akıllı sepetler ve sosyal mutfak deneyimi.
            </Text>
          </View>
        </View>
        <View style={styles.socialBadges}>
          {['Kurucu', 'Mutfak Çırağı', 'Sepet Ustası', 'TarifAL Onaylı'].map((badge) => (
            <View key={badge} style={styles.socialBadge}>
              <Text style={styles.socialBadgeText}>{badge}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.retentionWrap}>
        <DailyReturnCard
          streak={streak}
          completedToday={completedToday}
          onPress={() => {
            void completeDailyAction();
            navigation.navigate('Explore');
            showToast('Sana özel keşif akışı açıldı.', 'info');
          }}
          compact
        />
      </View>

      <View style={styles.premiumSection}>
        <View style={styles.premiumSectionHeader}>
          <Text style={styles.premiumSectionTitle}>Profil başarıların</Text>
          <Text style={styles.premiumSectionMeta}>Bu hafta</Text>
        </View>
        <ProfileAchievementCards achievements={achievements} />
      </View>

      <View style={styles.premiumSection}>
        <ProfileCollectionShowcase
          collections={enhancedSocialCollections.slice(0, 6)}
          savedIds={collectionSaves}
          onOpenCollection={openCollection}
          onOpenAll={() => setActiveTab('collections')}
        />
      </View>

      <View style={styles.goalWrap}>
        <GamificationCard />
      </View>

      <View style={styles.goalWrap}>
        <UserGoalSelector value={userGoal} onChange={handleUserGoalChange} />
      </View>

      <AppButton
        title="Tanıtım turunu tekrar göster"
        icon="sparkles-outline"
        variant="soft"
        onPress={handleReplayTour}
        style={styles.tourButton}
      />

      <AppButton
        title="Ev Hesabını Aç"
        icon="people-outline"
        variant="soft"
        onPress={openFamilyAccount}
        style={styles.tourButton}
      />

      <AppButton
        title="Bildirim Merkezini Aç"
        icon="notifications-outline"
        variant="soft"
        onPress={() => navigation.getParent()?.navigate('Activity')}
        style={styles.tourButton}
      />

      <AppButton
        title={showInvestorDemo ? 'Demo Modunu Gizle' : 'Yatırımcı Demo Modu'}
        icon="analytics-outline"
        variant="soft"
        onPress={() => {
          setShowInvestorDemo((value) => !value);
          showToast(showInvestorDemo ? 'Yatırımcı demo modu gizlendi.' : 'Yatırımcı demo modu açıldı.', 'info');
        }}
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
        onPress={confirmSignOut}
        style={styles.logout}
      />

      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileTabRow}>
          {profileTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTab(tab.id)}
              activeOpacity={0.86}
              style={[styles.tabButton, activeTab === tab.id && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activeTab === 'collections' ? (
        <View style={styles.collectionTab}>
          <ProfileCollectionShowcase
            collections={enhancedSocialCollections}
            savedIds={collectionSaves}
            onOpenCollection={openCollection}
          />
          <Text style={styles.collectionHelper}>
            Koleksiyonları açarak tarifleri inceleyebilir veya tek dokunuşla kaydedebilirsin.
          </Text>
        </View>
      ) : activeTab === 'activity' ? (
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('Activity')}
          activeOpacity={0.84}
          style={styles.activityPreview}
        >
          <View style={styles.activityPreviewIcon}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.activityPreviewCopy}>
            <Text style={styles.activityPreviewTitle}>Günlük aktivite merkezini aç</Text>
            <Text style={styles.activityPreviewText}>
              Kaydetmeler, şef paylaşımları ve TarifAL Bot önerileri burada seni bekliyor.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      ) : visibleRecipes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={30} color={theme.colors.subtle} />
          <Text style={styles.emptyText}>
            {activeTab === 'mine'
              ? 'Henüz tarif paylaşmadın.'
              : activeTab === 'tried'
                ? 'Henüz denediğin tarif yok.'
                : 'Henüz kaydettiğin tarif yok.'}
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

      {activeTab !== 'collections' ? (
        <>
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
        </>
      ) : null}
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
  socialIdentity: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 14,
    gap: 12,
  },
  retentionWrap: {
    marginTop: 14,
  },
  premiumSection: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.03,
  },
  premiumSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  premiumSectionTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  premiumSectionMeta: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  socialIdentityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  socialIdentityIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIdentityCopy: {
    flex: 1,
  },
  socialIdentityTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  socialIdentityText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  socialBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  socialBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  socialBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
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
  },
  profileTabRow: {
    gap: 8,
  },
  tabButton: {
    minWidth: 132,
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
  collectionTab: {
    marginTop: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
  },
  collectionHelper: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  activityPreview: {
    marginTop: 18,
    minHeight: 88,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityPreviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityPreviewCopy: {
    flex: 1,
  },
  activityPreviewTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  activityPreviewText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
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
