import { ComponentProps, ReactNode, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/AppButton';
import { BetaInviteModal } from '../../components/BetaInviteModal';
import { BetaTestGuideModal } from '../../components/BetaTestGuideModal';
import { BrandLogo } from '../../components/BrandLogo';
import { DataSyncBanner } from '../../components/DataSyncBanner';
import { ProfileAchievementCards } from '../../components/ProfileAchievementCards';
import { ProfileCollectionShowcase } from '../../components/profile/ProfileCollectionShowcase';
import { RecipeCard } from '../../components/RecipeCard';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { enhancedSocialCollections } from '../../data/mockCollections';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { useDailyReturn } from '../../retention/useDailyReturn';
import { useAppStore } from '../../store/useAppStore';
import { Order, OrderStatus, Recipe, SocialCollection, UserGoal } from '../../types';
import { buildProfileIdentity, isFounderUser } from '../../utils/profileIdentity';

type ProfileTab = 'recipes' | 'favorites' | 'orders';
type IconName = ComponentProps<typeof Ionicons>['name'];

const profileTabs: Array<{ id: ProfileTab; label: string; icon: IconName }> = [
  { id: 'recipes', label: 'Tariflerim', icon: 'grid-outline' },
  { id: 'favorites', label: 'Favorilerim', icon: 'heart-outline' },
  { id: 'orders', label: 'Siparişlerim', icon: 'receipt-outline' },
];

const goals: UserGoal[] = [
  'Kilo vermek',
  'Kas yapmak',
  'Sağlıklı beslenmek',
  'Ekonomik beslenmek',
  'Pratik yemek yapmak',
  'Aile için pratik yemek',
  'Öğrenci modu',
  'Zaman kazanmak',
];

const orderStatusLabels: Record<OrderStatus, string> = {
  new: 'Yeni',
  preparing: 'Hazırlanıyor',
  on_the_way: 'Yolda',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<ProfileTab>('favorites');
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [achievementsVisible, setAchievementsVisible] = useState(false);
  const [showBetaGuide, setShowBetaGuide] = useState(false);
  const [showBetaInvite, setShowBetaInvite] = useState(false);

  const user = useAppStore((store) => store.user);
  const profile = useAppStore((store) => store.profile);
  const accountMode = useAppStore((store) => store.accountMode);
  const authLoading = useAppStore((store) => store.authLoading);
  const dataError = useAppStore((store) => store.dataError);
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
  const { streak, completeDailyAction } = useDailyReturn();

  const myRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.createdBy === user?.id),
    [recipes, user?.id],
  );
  const likedRecipes = useMemo(
    () => recipes.filter((recipe) => likes[recipe.id] || recipeLists.favorites.includes(recipe.id)),
    [likes, recipeLists.favorites, recipes],
  );
  const triedRecipeCards = useMemo(
    () => recipes.filter((recipe) => triedRecipes.some((item) => item.recipeId === recipe.id)),
    [recipes, triedRecipes],
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const orderCount = orders.length;
  const isFounderAccount = isFounderUser(user);
  const isBetaTester = Boolean(profile?.isBetaTester || user?.isBetaTester);
  const showTestingTools = Boolean(isFounderAccount || isBetaTester);

  const profileIdentity = useMemo(
    () =>
      buildProfileIdentity({
        user,
        isBetaTester,
        cartCount,
        likedCount: likedRecipes.length,
        triedCount: triedRecipes.length,
        userGoal,
      }),
    [cartCount, isBetaTester, likedRecipes.length, triedRecipes.length, user, userGoal],
  );
  const visibleProfileBadges = useMemo(
    () =>
      profileIdentity.badges
        .filter(
          (badge) =>
            ![
              'Yeni Üye',
              'Mutfak Çırağı',
              'Keşif Başladı',
              'TarifAL Topluluğu',
              'TarifAL topluluğuna katıldı',
            ].includes(badge),
        )
        .slice(0, isFounderAccount ? 2 : 1),
    [isFounderAccount, profileIdentity.badges],
  );

  const achievements = isFounderAccount
    ? [
        'TarifAL Onaylı kurucu profil',
        `${Math.max(2, recipeLists.cookedBefore.length)} tarif mutfak geçmişinde`,
        `${Math.max(3, likedRecipes.length)} tarif koleksiyonlara ilham verdi`,
        `${streak} günlük mutfak serisi`,
      ]
    : [
        isBetaTester ? 'Beta test kullanıcısı' : 'TarifAL topluluğuna katıldı',
        `${recipeLists.cookedBefore.length} tarif mutfak geçmişinde`,
        `${likedRecipes.length} favori tarif kaydetti`,
        `${streak} günlük mutfak serisi`,
      ];

  const openRecipe = (recipeId: string) => {
    navigation.getParent()?.navigate('RecipeDetail', { recipeId });
  };

  const openCollection = (collectionId: string) => {
    navigation.getParent()?.navigate('CollectionDetail', { collectionId });
  };

  const handleReplayTour = () => {
    setSettingsVisible(false);
    void requestGuidedTourReplay();
    showToast('Tanıtım turu yeniden başlatılacak.', 'info');
    navigation.navigate('Home');
  };

  const handleGoalChange = (goal: UserGoal) => {
    setUserGoal(goal);
    setGoalModalVisible(false);
    showToast(`${goal} hedefine göre öneriler güncellendi.`, 'info');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setSettingsVisible(false);
      showToast('Çıkış yapıldı.', 'info');
      const rootNavigation = navigation.getParent();

      if (rootNavigation) {
        rootNavigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          }),
        );
        return;
      }

      navigation.navigate('Auth');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Çıkış yapılamadı. Tekrar dene.', 'warning');
    }
  };

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

  const openRealAccount = () => {
    setSettingsVisible(false);
    navigation.getParent()?.navigate('Auth');
  };

  const goToAddRecipe = () => {
    navigation.getParent()?.navigate('MainTabs', { screen: 'AddRecipe' });
  };

  const goToExplore = () => {
    navigation.getParent()?.navigate('MainTabs', { screen: 'Explore' });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarShell}>
              <BrandLogo size={54} />
            </View>
            <View style={styles.profileCopy}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {user?.name ?? 'TarifAL Kullanıcısı'}
                </Text>
                <TouchableOpacity
                  onPress={() => setSettingsVisible(true)}
                  activeOpacity={0.84}
                  style={styles.settingsButton}
                  accessibilityRole="button"
                  accessibilityLabel="Profil ayarlarını aç"
                >
                  <Ionicons name="settings-outline" size={19} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.email} numberOfLines={1}>
                {user?.email ?? profileIdentity.username}
              </Text>
              <Text style={styles.bio} numberOfLines={1}>
                {profileIdentity.bio}
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            {accountMode === 'account' ? (
              <ProfileBadge icon="cloud-done-outline" label="Gerçek Hesap" tone="success" />
            ) : null}
            {isBetaTester ? <ProfileBadge icon="rocket-outline" label="Beta" /> : null}
            {isFounderAccount ? <ProfileBadge icon="shield-checkmark-outline" label="Kurucu" /> : null}
            {visibleProfileBadges.map((badge) => (
              <ProfileBadge key={badge} icon="checkmark-circle-outline" label={badge} />
            ))}
          </View>

          <View style={styles.statsRow}>
            <ProfileStat value={myRecipes.length} label="Tarif" icon="restaurant-outline" />
            <ProfileStat value={likedRecipes.length} label="Favori" icon="heart-outline" />
            <ProfileStat value={orderCount || cartCount} label={orderCount > 0 ? 'Sipariş' : 'Sepet'} icon="basket-outline" />
          </View>

          <View style={styles.compactInfoGrid}>
            <TouchableOpacity
              onPress={() => setGoalModalVisible(true)}
              activeOpacity={0.86}
              style={styles.compactInfoCard}
            >
              <Ionicons name="flag-outline" size={17} color={theme.colors.primary} />
              <View style={styles.compactInfoCopy}>
                <Text style={styles.compactInfoLabel}>Hedefin</Text>
                <Text style={styles.compactInfoValue} numberOfLines={1}>{userGoal}</Text>
              </View>
              <Text style={styles.changeText}>Değiştir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAchievementsVisible(true)}
              activeOpacity={0.86}
              style={styles.compactInfoCard}
            >
              <Ionicons name="trophy-outline" size={17} color={theme.colors.primary} />
              <View style={styles.compactInfoCopy}>
                <Text style={styles.compactInfoLabel}>Mutfak seviyen</Text>
                <Text style={styles.compactInfoValue} numberOfLines={1}>
                  Seviye 3 — Pratik Şef
                </Text>
              </View>
              <Text style={styles.changeText}>{achievements.length} rozet</Text>
            </TouchableOpacity>
          </View>
        </View>

        <DataSyncBanner message={dataError} />

        <View style={styles.tabsCard}>
          <View style={styles.tabsRow}>
            {profileTabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.84}
                style={[styles.tabButton, activeTab === tab.id && styles.activeTabButton]}
              >
                <Ionicons
                  name={tab.icon}
                  size={17}
                  color={activeTab === tab.id ? theme.colors.primary : theme.colors.muted}
                />
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'recipes' ? (
            <RecipesTab
              recipes={myRecipes}
              likedIds={likes}
              onOpenRecipe={openRecipe}
              onToggleLike={toggleLike}
              onEmptyAction={goToAddRecipe}
            />
          ) : null}

          {activeTab === 'favorites' ? (
            <FavoritesTab
              recipes={likedRecipes}
              likedIds={likes}
              onOpenRecipe={openRecipe}
              onToggleLike={toggleLike}
              onEmptyAction={goToExplore}
              collections={enhancedSocialCollections.slice(0, 4)}
              savedIds={collectionSaves}
              onOpenCollection={openCollection}
            />
          ) : null}

          {activeTab === 'orders' ? (
            <OrdersTab
              orders={orders}
              onEmptyAction={() => navigation.getParent()?.navigate('MainTabs', { screen: 'Home' })}
            />
          ) : null}
        </View>
      </View>

      <GoalModal
        visible={goalModalVisible}
        currentGoal={userGoal}
        onClose={() => setGoalModalVisible(false)}
        onSelect={handleGoalChange}
      />

      <AchievementsModal
        visible={achievementsVisible}
        achievements={achievements}
        collections={enhancedSocialCollections.slice(0, 6)}
        savedIds={collectionSaves}
        streak={streak}
        triedCount={triedRecipeCards.length}
        onClose={() => setAchievementsVisible(false)}
        onOpenCollection={openCollection}
        onContinueStreak={() => {
          void completeDailyAction();
          setAchievementsVisible(false);
          goToExplore();
          showToast('Sana özel keşif akışı açıldı.', 'info');
        }}
      />

      <SettingsModal
        visible={settingsVisible}
        accountMode={accountMode}
        authLoading={authLoading}
        showTestingTools={showTestingTools}
        isFounderAccount={isFounderAccount}
        onClose={() => setSettingsVisible(false)}
        onReplayTour={handleReplayTour}
        onOpenFamily={() => {
          setSettingsVisible(false);
          navigation.getParent()?.navigate('FamilyAccount');
        }}
        onOpenNotifications={() => {
          setSettingsVisible(false);
          navigation.getParent()?.navigate('Activity');
        }}
        onFeedback={() => {
          showToast('Geri bildirim alanı hazır.', 'info');
        }}
        onOpenBetaInvite={() => {
          setSettingsVisible(false);
          setShowBetaInvite(true);
        }}
        onOpenBetaGuide={() => {
          setSettingsVisible(false);
          setShowBetaGuide(true);
        }}
        onOpenAdmin={() => {
          setSettingsVisible(false);
          navigation.getParent()?.navigate('AdminPanel');
        }}
        onOpenRealAccount={openRealAccount}
        onSignOut={confirmSignOut}
      />

      <BetaTestGuideModal visible={showBetaGuide} onClose={() => setShowBetaGuide(false)} />
      <BetaInviteModal visible={showBetaInvite} onClose={() => setShowBetaInvite(false)} />
    </Screen>
  );
}

function ProfileBadge({
  icon,
  label,
  tone = 'default',
}: {
  icon: IconName;
  label: string;
  tone?: 'default' | 'success';
}) {
  const isSuccess = tone === 'success';

  return (
    <View style={[styles.profileBadge, isSuccess && styles.profileBadgeSuccess]}>
      <Ionicons name={icon} size={11} color={isSuccess ? theme.colors.success : theme.colors.primary} />
      <Text style={[styles.profileBadgeText, isSuccess && styles.profileBadgeSuccessText]}>{label}</Text>
    </View>
  );
}

function ProfileStat({ value, label, icon }: { value: number; label: string; icon: IconName }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={14} color={theme.colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RecipesTab({
  recipes,
  likedIds,
  onOpenRecipe,
  onToggleLike,
  onEmptyAction,
}: {
  recipes: Recipe[];
  likedIds: Record<string, boolean>;
  onOpenRecipe: (recipeId: string) => void;
  onToggleLike: (recipeId: string) => void;
  onEmptyAction: () => void;
}) {
  if (recipes.length === 0) {
    return (
      <ProfileEmptyState
        icon="create-outline"
        title="Henüz tarif paylaşmadın."
        description="İlk tarifini paylaşarak TarifAL topluluğunda görünmeye başlayabilirsin."
        button="İlk tarifini paylaş"
        onPress={onEmptyAction}
      />
    );
  }

  return (
    <RecipeGrid recipes={recipes} likedIds={likedIds} onOpenRecipe={onOpenRecipe} onToggleLike={onToggleLike} />
  );
}

function FavoritesTab({
  recipes,
  likedIds,
  onOpenRecipe,
  onToggleLike,
  onEmptyAction,
  collections,
  savedIds,
  onOpenCollection,
}: {
  recipes: Recipe[];
  likedIds: Record<string, boolean>;
  onOpenRecipe: (recipeId: string) => void;
  onToggleLike: (recipeId: string) => void;
  onEmptyAction: () => void;
  collections: SocialCollection[];
  savedIds: Record<string, boolean>;
  onOpenCollection: (collectionId: string) => void;
}) {
  return (
    <View style={styles.tabStack}>
      {recipes.length === 0 ? (
        <ProfileEmptyState
          icon="heart-outline"
          title="Henüz favori tarifin yok."
          description="Beğendiğin tarifleri kaydetmeye başladığında burada düzenli şekilde görünür."
          button="Tarif keşfet"
          onPress={onEmptyAction}
        />
      ) : (
        <RecipeGrid recipes={recipes} likedIds={likedIds} onOpenRecipe={onOpenRecipe} onToggleLike={onToggleLike} />
      )}

      <View style={styles.inlineSection}>
        <ProfileCollectionShowcase
          collections={collections}
          savedIds={savedIds}
          onOpenCollection={onOpenCollection}
        />
      </View>
    </View>
  );
}

function OrdersTab({ orders, onEmptyAction }: { orders: Order[]; onEmptyAction: () => void }) {
  if (orders.length === 0) {
    return (
      <ProfileEmptyState
        icon="receipt-outline"
        title="Henüz sipariş oluşturmadın."
        description="Bir tarif seçip eksikleri sepete eklediğinde sipariş geçmişin burada görünür."
        button="Bugün Ne Pişirsem?"
        onPress={onEmptyAction}
      />
    );
  }

  return (
    <View style={styles.orderList}>
      {orders.map((order) => {
        const orderNumber = order.orderNumber ?? order.orderId ?? order.id;
        return (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderIcon}>
              <Ionicons name="receipt-outline" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.orderCopy}>
              <Text style={styles.orderTitle}>{orderNumber}</Text>
              <Text style={styles.orderMeta}>
                {formatProfileDate(order.createdAt)} · {order.items?.length ?? 0} ürün
              </Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderTotal}>₺{Math.round(order.total ?? 0)}</Text>
              <View style={styles.orderStatus}>
                <Text style={styles.orderStatusText}>{orderStatusLabels[order.status] ?? 'Demo'}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function RecipeGrid({
  recipes,
  likedIds,
  onOpenRecipe,
  onToggleLike,
}: {
  recipes: Recipe[];
  likedIds: Record<string, boolean>;
  onOpenRecipe: (recipeId: string) => void;
  onToggleLike: (recipeId: string) => void;
}) {
  return (
    <View style={styles.recipeGrid}>
      {recipes.map((recipe) => (
        <View key={recipe.id} style={styles.recipeGridItem}>
          <RecipeCard
            recipe={recipe}
            liked={Boolean(likedIds[recipe.id])}
            onPress={() => onOpenRecipe(recipe.id)}
            onToggleLike={() => onToggleLike(recipe.id)}
            variant="mini"
          />
        </View>
      ))}
    </View>
  );
}

function ProfileEmptyState({
  icon,
  title,
  description,
  button,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  button: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={19} color={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{description}</Text>
      <AppButton title={button} onPress={onPress} style={styles.emptyButton} />
    </View>
  );
}

function Sheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleWrap}>
              <Text style={styles.sheetTitle}>{title}</Text>
              {subtitle ? <Text style={styles.sheetSubtitle}>{subtitle}</Text> : null}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Kapat">
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function GoalModal({
  visible,
  currentGoal,
  onClose,
  onSelect,
}: {
  visible: boolean;
  currentGoal: UserGoal;
  onClose: () => void;
  onSelect: (goal: UserGoal) => void;
}) {
  return (
    <Sheet
      visible={visible}
      title="Hedefini değiştir"
      subtitle="Öneriler ana sayfada bu hedefe göre sıralanır."
      onClose={onClose}
    >
      <View style={styles.goalGrid}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal}
            onPress={() => onSelect(goal)}
            activeOpacity={0.84}
            style={[styles.goalChip, currentGoal === goal && styles.goalChipActive]}
          >
            <Text style={[styles.goalChipText, currentGoal === goal && styles.goalChipTextActive]}>
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Sheet>
  );
}

function AchievementsModal({
  visible,
  achievements,
  collections,
  savedIds,
  streak,
  triedCount,
  onClose,
  onOpenCollection,
  onContinueStreak,
}: {
  visible: boolean;
  achievements: string[];
  collections: SocialCollection[];
  savedIds: Record<string, boolean>;
  streak: number;
  triedCount: number;
  onClose: () => void;
  onOpenCollection: (collectionId: string) => void;
  onContinueStreak: () => void;
}) {
  return (
    <Sheet
      visible={visible}
      title="Mutfak seviyen"
      subtitle="Rozetlerin, serin ve koleksiyon vitrinin tek yerde."
      onClose={onClose}
    >
      <View style={styles.levelSummary}>
        <View style={styles.levelBubble}>
          <Text style={styles.levelNumber}>3</Text>
        </View>
        <View style={styles.levelCopy}>
          <Text style={styles.levelTitle}>Pratik Şef</Text>
          <Text style={styles.levelText}>
            {achievements.length} başarı açıldı · {streak} günlük seri · {triedCount} tarif denendi
          </Text>
        </View>
      </View>
      <ProfileAchievementCards achievements={achievements} />
      <View style={styles.modalCollectionWrap}>
        <ProfileCollectionShowcase
          collections={collections}
          savedIds={savedIds}
          onOpenCollection={onOpenCollection}
        />
      </View>
      <AppButton title="Seriyi devam ettir" icon="flame-outline" onPress={onContinueStreak} />
    </Sheet>
  );
}

function SettingsModal({
  visible,
  accountMode,
  authLoading,
  showTestingTools,
  isFounderAccount,
  onClose,
  onReplayTour,
  onOpenFamily,
  onOpenNotifications,
  onFeedback,
  onOpenBetaInvite,
  onOpenBetaGuide,
  onOpenAdmin,
  onOpenRealAccount,
  onSignOut,
}: {
  visible: boolean;
  accountMode: 'demo' | 'account';
  authLoading: boolean;
  showTestingTools: boolean;
  isFounderAccount: boolean;
  onClose: () => void;
  onReplayTour: () => void;
  onOpenFamily: () => void;
  onOpenNotifications: () => void;
  onFeedback: () => void;
  onOpenBetaInvite: () => void;
  onOpenBetaGuide: () => void;
  onOpenAdmin: () => void;
  onOpenRealAccount: () => void;
  onSignOut: () => void;
}) {
  return (
    <Sheet
      visible={visible}
      title="Ayarlar"
      subtitle="Hesap, bildirim, gizlilik ve kısa yollar."
      onClose={onClose}
    >
      <View style={styles.settingsList}>
        <SettingsRow icon="person-circle-outline" title="Hesap bilgileri" text="Profil ve giriş durumu" onPress={onFeedback} />
        <SettingsRow icon="notifications-outline" title="Bildirimler" text="Günlük öneri ve aktiviteler" onPress={onOpenNotifications} />
        <SettingsRow icon="lock-closed-outline" title="Gizlilik" text="Demo modunda kişisel veri paylaşılmaz" onPress={onFeedback} />
        <SettingsRow icon="chatbubble-ellipses-outline" title="Geri bildirim ver" text="Ürün deneyimi için görüş bırak" onPress={onFeedback} />
        <SettingsRow icon="sparkles-outline" title="Tanıtım turunu tekrar göster" text="Uygulama turunu yeniden başlat" onPress={onReplayTour} />
        <SettingsRow icon="people-outline" title="Ev hesabı" text="Ortak liste ve aile akışı" onPress={onOpenFamily} />
        {showTestingTools ? (
          <>
            <SettingsRow icon="rocket-outline" title="Beta rozeti" text="Beta katılım durumunu yönet" onPress={onOpenBetaInvite} />
            <SettingsRow icon="clipboard-outline" title="Beta test rehberi" text="Kontrol adımlarını aç" onPress={onOpenBetaGuide} />
          </>
        ) : null}
        {isFounderAccount ? (
          <SettingsRow icon="shield-checkmark-outline" title="Admin Paneli" text="Kurucuya özel yönetim ekranı" onPress={onOpenAdmin} />
        ) : null}
      </View>

      <View style={styles.settingsFooter}>
        <AppButton
          title={accountMode === 'demo' ? 'Gerçek Hesaba Geç' : 'Çıkış Yap'}
          icon={accountMode === 'demo' ? 'cloud-upload-outline' : 'log-out-outline'}
          variant={accountMode === 'demo' ? 'outline' : 'primary'}
          loading={authLoading}
          onPress={accountMode === 'demo' ? onOpenRealAccount : onSignOut}
        />
      </View>
    </Sheet>
  );
}

function SettingsRow({
  icon,
  title,
  text,
  onPress,
}: {
  icon: IconName;
  title: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.84} style={styles.settingsRow}>
      <View style={styles.settingsIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.settingsCopy}>
        <Text style={styles.settingsTitle}>{title}</Text>
        <Text style={styles.settingsText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
    </TouchableOpacity>
  );
}

function formatProfileDate(value?: string | null) {
  if (!value) {
    return 'Bugün';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Bugün';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 14,
    paddingBottom: 116,
  },
  container: {
    width: '100%',
    maxWidth: 940,
    alignSelf: 'center',
    gap: 10,
  },
  profileCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 10,
    ...theme.shadow,
    shadowOpacity: 0.025,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarShell: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  email: {
    marginTop: 2,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  bio: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  profileBadge: {
    minHeight: 24,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: '#FFE6D8',
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileBadgeSuccess: {
    borderColor: '#C9F1DD',
    backgroundColor: '#ECFDF3',
  },
  profileBadgeText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  profileBadgeSuccessText: {
    color: theme.colors.success,
  },
  statsRow: {
    minHeight: 42,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 7,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  compactInfoGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  compactInfoCard: {
    flex: 1,
    minWidth: 240,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FCFCFD',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactInfoCopy: {
    flex: 1,
    minWidth: 0,
  },
  compactInfoLabel: {
    color: theme.colors.muted,
    fontSize: 9,
    fontWeight: '900',
  },
  compactInfoValue: {
    marginTop: 2,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  changeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  tabsCard: {
    borderRadius: 0,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  activeTabText: {
    color: theme.colors.text,
  },
  tabContent: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 12,
    minHeight: 150,
    ...theme.shadow,
    shadowOpacity: 0.015,
  },
  tabStack: {
    gap: 16,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recipeGridItem: {
    maxWidth: Platform.OS === 'web' ? 220 : undefined,
  },
  inlineSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 14,
  },
  emptyState: {
    minHeight: 132,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 7,
  },
  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: 360,
  },
  emptyButton: {
    minHeight: 38,
    marginTop: 2,
    paddingHorizontal: 14,
  },
  orderList: {
    gap: 10,
  },
  orderCard: {
    minHeight: 78,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCopy: {
    flex: 1,
    minWidth: 0,
  },
  orderTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  orderMeta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 5,
  },
  orderTotal: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  orderStatus: {
    minHeight: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderStatusText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.42)',
    justifyContent: 'center',
    padding: 18,
  },
  sheet: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '88%',
    alignSelf: 'center',
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 14,
    ...theme.shadow,
    shadowOpacity: 0.14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sheetContent: {
    gap: 14,
    paddingBottom: 4,
  },
  sheetTitleWrap: {
    flex: 1,
  },
  sheetTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  goalChip: {
    minHeight: 42,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  goalChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  goalChipTextActive: {
    color: '#FFFFFF',
  },
  levelSummary: {
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  levelCopy: {
    flex: 1,
  },
  levelTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  levelText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  modalCollectionWrap: {
    maxHeight: 280,
  },
  settingsList: {
    gap: 9,
  },
  settingsRow: {
    minHeight: 70,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCopy: {
    flex: 1,
  },
  settingsTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  settingsText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  settingsFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 14,
  },
});
