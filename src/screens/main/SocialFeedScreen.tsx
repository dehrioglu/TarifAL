import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { CategoryInterestChip } from '../../components/personalization/CategoryInterestChip';
import { DiscoverRecipeRail } from '../../components/discover/DiscoverRecipeRail';
import { ProfileCollectionShowcase } from '../../components/profile/ProfileCollectionShowcase';
import { PersonalizedDiscoverSection } from '../../components/personalization/PersonalizedDiscoverSection';
import { DailyReturnCard } from '../../components/retention/DailyReturnCard';
import { Screen } from '../../components/Screen';
import { ShareRecipeModal } from '../../components/ShareRecipeModal';
import { SocialPostCard } from '../../components/SocialPostCard';
import { StoriesCarousel } from '../../components/StoriesCarousel';
import { TarifALBotFab } from '../../components/TarifALBotFab';
import { TriedRecipeModal } from '../../components/TriedRecipeModal';
import { UserProfileCard } from '../../components/UserProfileCard';
import { theme } from '../../constants/theme';
import { mockSocialUsers } from '../../data/mockSocial';
import { enhancedSocialCollections } from '../../data/mockCollections';
import { mockNotifications } from '../../data/mockNotifications';
import { mockSocialFeedExtras, recipePostToFeedPost } from '../../data/mockSocialPosts';
import { mockStories } from '../../data/mockStories';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { useDailyReturn } from '../../retention/useDailyReturn';
import { sortFeedPostsByTaste } from '../../personalization/TasteBasedFeedSorter';
import {
  getPostTasteCategories,
  TasteCategory,
  tasteCategoryLabels,
} from '../../personalization/tasteProfileStore';
import { useUserTasteProfile } from '../../personalization/useUserTasteProfile';
import { useAppStore } from '../../store/useAppStore';
import { SocialFeedPost, SocialUser } from '../../types';

const trendTags = ['tatlı', 'ekonomik', 'fit', 'ustaişi', '15dakika', 'geleneksel'];
type ExploreFilter = 'all' | 'practical' | 'economic' | 'fit' | 'master' | 'ready';

const exploreFilters: Array<{ id: ExploreFilter; label: string }> = [
  { id: 'all', label: 'Tümü' },
  { id: 'practical', label: 'Pratik' },
  { id: 'economic', label: 'Ekonomik' },
  { id: 'fit', label: 'Fit' },
  { id: 'master', label: 'Usta İşi' },
  { id: 'ready', label: 'Hazır Sipariş' },
];

export function SocialFeedScreen() {
  const navigation = useNavigation<any>();
  const [activeTaste, setActiveTaste] = useState<TasteCategory>();
  const [exploreFilter, setExploreFilter] = useState<ExploreFilter>('all');
  const [sharePost, setSharePost] = useState<SocialFeedPost | null>(null);
  const [triedPost, setTriedPost] = useState<SocialFeedPost | null>(null);
  const socialLikes = useAppStore((store) => store.socialLikes);
  const socialSaves = useAppStore((store) => store.socialSaves);
  const socialPostStats = useAppStore((store) => store.socialPostStats);
  const socialPosts = useAppStore((store) => store.socialPosts);
  const followedUsers = useAppStore((store) => store.followedUsers);
  const currentUser = useAppStore((store) => store.user);
  const socialPollVotes = useAppStore((store) => store.socialPollVotes);
  const socialPollOptionVotes = useAppStore((store) => store.socialPollOptionVotes);
  const joinedChallenges = useAppStore((store) => store.joinedChallenges);
  const readNotifications = useAppStore((store) => store.readNotifications);
  const toggleSocialLike = useAppStore((store) => store.toggleSocialLike);
  const toggleSocialSave = useAppStore((store) => store.toggleSocialSave);
  const toggleFollowUser = useAppStore((store) => store.toggleFollowUser);
  const voteSocialPoll = useAppStore((store) => store.voteSocialPoll);
  const toggleChallengeJoin = useAppStore((store) => store.toggleChallengeJoin);
  const addTriedRecipe = useAppStore((store) => store.addTriedRecipe);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const {
    scores,
    rankedInterests,
    primaryInterest,
    recordPostInteraction,
    recordTagInteraction,
    recordCategoryInteraction,
    recordChefFollow,
  } = useUserTasteProfile();
  const { showToast, showDemoModal } = useFeedback();
  const { streak, completedToday, completeDailyAction } = useDailyReturn();

  const currentSocialUser: SocialUser = useMemo(
    () => ({
      id: currentUser?.id ?? 'demo-user',
      name: currentUser?.name ?? 'Enes Kervankaya',
      username: '@eneschef',
      avatarUrl:
        currentUser?.avatarUrl ??
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
      coverImageUrl:
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1200&auto=format&fit=crop',
      bio: 'TarifAL kurucusu · Pratik tarifler, akıllı sepetler ve sosyal mutfak deneyimi.',
      location: 'İstanbul',
      followers: 1840,
      following: 86,
      recipeCount: 4,
      totalLikes: 24800,
      averageRating: 4.8,
      badges: ['Kurucu', 'Sepet Ustası', 'TarifAL Onaylı'],
      level: 'TarifAL Kurucusu',
      isVerified: true,
      expertiseAreas: ['Akıllı sepet', 'Pratik tarif', 'Ürün deneyimi'],
    }),
    [currentUser],
  );

  const usersById = useMemo(
    () =>
      [currentSocialUser, ...mockSocialUsers].reduce<Record<string, SocialUser>>((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {}),
    [currentSocialUser],
  );

  const feedPosts = useMemo<SocialFeedPost[]>(
    () => [...socialPosts.map(recipePostToFeedPost), ...mockSocialFeedExtras],
    [socialPosts],
  );
  const sortedPosts = useMemo(
    () => sortFeedPostsByTaste(feedPosts, scores, usersById),
    [feedPosts, scores, usersById],
  );
  const personalizedPosts = useMemo(() => {
    const primary = primaryInterest?.id ?? 'tatli';
    const matching = sortedPosts.filter((post) => getPostTasteCategories(post).includes(primary));

    return matching.length >= 3 ? matching : sortedPosts;
  }, [primaryInterest?.id, sortedPosts]);
  const visiblePosts = useMemo(
    () => {
      const tasteFiltered = activeTaste
        ? sortedPosts.filter((post) => getPostTasteCategories(post).includes(activeTaste))
        : sortedPosts;

      return tasteFiltered.filter((post) => matchesExploreFilter(post, exploreFilter));
    },
    [activeTaste, exploreFilter, sortedPosts],
  );
  const railPosts = useMemo(
    () => sortedPosts.filter((post) => post.recipeId && post.imageUrl),
    [sortedPosts],
  );
  const unreadCount = mockNotifications.filter(
    (notification) => !(readNotifications[notification.id] ?? notification.isRead),
  ).length;

  const openRecipe = (post: SocialFeedPost) => {
    recordPostInteraction(post, 'view');

    if (post.recipeId) {
      navigation.getParent()?.navigate('RecipeDetail', { recipeId: post.recipeId, socialPostId: post.id });
      return;
    }

    showToast('Bu sosyal gönderi tarif yerine topluluk bilgi kartı olarak çalışıyor.', 'info');
  };

  const openProfile = (userId: string) => {
    navigation.getParent()?.navigate('SocialProfile', { userId });
  };

  const addMarketBasket = (post: SocialFeedPost) => {
    const recipeId = post.recipeId ?? 'recipe-mercimek';
    addMissingIngredientsToCart(recipeId);
    showDemoModal({
      title: 'Sosyal gönderi sepete dönüştü',
      message: `${post.title} için eksik ürünler akıllı sepete eklendi. Bu akış sosyal etkileşimi market sepetine bağlar.`,
      primaryLabel: 'Sepete Git',
      secondaryLabel: 'Akıllı Siparişe Geç',
      onPrimary: () => navigation.navigate('Cart'),
      onSecondary: () => navigation.getParent()?.navigate('MarketCheckout'),
    });
  };

  const orderReadyMeal = (post: SocialFeedPost) => {
    navigation.getParent()?.navigate('RecipeDetail', {
      recipeId: post.recipeId ?? 'recipe-hunkar-begendi',
      purchaseMode: 'restaurant',
      socialPostId: post.id,
    });
  };

  const handleTriedSubmit = (rating: number, comment: string) => {
    addTriedRecipe({
      recipeId: triedPost?.recipeId ?? 'recipe-menemen',
      rating,
      comment,
      imageUrl: triedPost?.imageUrl,
    });
    showToast('Deneyimin paylaşıldı. TarifAL topluluğuna katkı sağladın.');
  };

  const chooseTaste = (category: TasteCategory) => {
    setActiveTaste((current) => (current === category ? undefined : category));
    recordCategoryInteraction(category);
    showToast(`${tasteCategoryLabels[category]} ilgine göre akış güncellendi.`, 'info');
  };

  const handleTag = (tag: string) => {
    const [category] = getPostTasteCategories({ title: tag, tags: [tag] });
    recordTagInteraction(tag);

    if (category) {
      setActiveTaste(category);
    }

    showToast(`#${tag} için sosyal akış güncellendi.`, 'info');
  };

  const renderPostCard = (post: SocialFeedPost) => {
    const author = usersById[post.authorId];

    if (!author) {
      return null;
    }

    const stats = socialPostStats[post.id] ?? {
      likes: post.likes,
      commentsCount: post.commentsCount,
      saves: post.saves,
    };

    return (
      <SocialPostCard
        key={post.id}
        post={post}
        author={author}
        stats={stats}
        liked={Boolean(socialLikes[post.id])}
        saved={Boolean(socialSaves[post.id])}
        following={Boolean(followedUsers[author.id])}
        selectedPollOptionId={socialPollVotes[post.id]}
        pollVotes={socialPollOptionVotes[post.id]}
        joinedChallenge={Boolean(joinedChallenges[post.id])}
        onOpenRecipe={() => openRecipe(post)}
        onOpenProfile={() => openProfile(author.id)}
        onToggleLike={() => {
          if (!socialLikes[post.id]) {
            recordPostInteraction(post, 'like');
          }
          toggleSocialLike(post.id);
          showToast(socialLikes[post.id] ? 'Beğeniden çıkarıldı.' : 'Gönderi beğenildi.');
        }}
        onToggleSave={() => {
          if (!socialSaves[post.id]) {
            recordPostInteraction(post, 'save');
          }
          toggleSocialSave(post.id);
          showToast(socialSaves[post.id] ? 'Kaydedilenlerden çıkarıldı.' : 'Gönderi kaydedildi.');
        }}
        onToggleFollow={() => {
          if (!followedUsers[author.id]) {
            recordChefFollow(author);
          }
          toggleFollowUser(author.id);
          showToast(followedUsers[author.id] ? 'Takip bırakıldı.' : `${author.name} takip ediliyor.`);
        }}
        onAddMarket={() => addMarketBasket(post)}
        onOrderReadyMeal={() => orderReadyMeal(post)}
        onComment={() => openRecipe(post)}
        onShare={() => setSharePost(post)}
        onTagPress={handleTag}
        onVotePoll={(optionId) => {
          voteSocialPoll(post.id, optionId);
          showToast('Oyun kaydedildi. Anket sonuçları güncellendi.', 'info');
        }}
        onToggleChallenge={() => {
          toggleChallengeJoin(post.id);
          showToast(joinedChallenges[post.id] ? 'Challenge katılımı kaldırıldı.' : 'Challenge’a katıldın.');
        }}
        onTried={() => setTriedPost(post)}
      />
    );
  };

  return (
    <View style={styles.root}>
      <Screen scroll contentStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>TarifAL keşif motoru</Text>
            <Text style={styles.title}>Enes, bugün bunları sevebilirsin</Text>
            <Text style={styles.subtitle}>Dolabına, bütçene ve topluluktaki trendlere göre seçildi.</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('Activity')}
            activeOpacity={0.86}
            accessibilityRole="button"
            accessibilityLabel="Aktivite Merkezi"
            style={styles.activityButton}
          >
            <Ionicons name="notifications-outline" size={21} color={theme.colors.primary} />
            {unreadCount > 0 ? (
              <View style={styles.activityBadge}>
                <Text style={styles.activityBadgeText}>{unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('Search')}
          activeOpacity={0.86}
          style={styles.searchBar}
        >
          <Ionicons name="search" size={19} color={theme.colors.subtle} />
          <Text style={styles.searchText}>Tarif, şef veya etiket ara</Text>
        </TouchableOpacity>

        <StoriesCarousel
          stories={mockStories}
          usersById={usersById}
          onOpenRecipe={(recipeId) => navigation.getParent()?.navigate('RecipeDetail', { recipeId })}
          onAddToCart={(recipeId) => {
            addMissingIngredientsToCart(recipeId);
            showToast('Hikayedeki tarifin eksikleri sepete eklendi.');
          }}
        />

        <View style={styles.returnWrap}>
          <DailyReturnCard
            streak={streak}
            completedToday={completedToday}
            onPress={() => {
              void completeDailyAction();
              setExploreFilter('practical');
              showToast('Bugünün hızlı tarifleri öne alındı.', 'info');
            }}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {exploreFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => {
                setExploreFilter(filter.id);
                showToast(`${filter.label} keşif filtresi uygulandı.`, 'info');
              }}
              activeOpacity={0.84}
              style={[styles.filterChip, exploreFilter === filter.id && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, exploreFilter === filter.id && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <PersonalizedDiscoverSection
          primaryInterest={primaryInterest?.id ?? 'tatli'}
          posts={personalizedPosts}
          onOpenPost={openRecipe}
        />

        {exploreFilter === 'all' ? (
          <>
            <DiscoverRecipeRail
              title="15 dakikada hazır"
              subtitle="Karar vermek için fazla düşünmeye gerek yok."
              posts={railPosts.filter((post) => (post.totalTime ?? 999) <= 15)}
              onOpenPost={openRecipe}
            />
            <DiscoverRecipeRail
              title="₺150 altı tarifler"
              subtitle="Bütçeyi koruyan, sepete dönüşmeye hazır seçimler."
              posts={railPosts.filter((post) => (post.marketBasketPrice ?? 999) <= 150)}
              accent="#12B76A"
              onOpenPost={openRecipe}
            />
            <DiscoverRecipeRail
              title="Usta işi hafta sonu"
              subtitle="Şeflerin kaydettiği daha iddialı sofralar."
              posts={railPosts.filter((post) => post.difficulty === 'Zor')}
              accent="#0B1020"
              onOpenPost={openRecipe}
            />
            <DiscoverRecipeRail
              title="Hazır sipariş alternatifi olanlar"
              subtitle="Evde yap veya sofrana gelsin."
              posts={railPosts.filter((post) => post.restaurantOrderAvailable)}
              onOpenPost={openRecipe}
            />
          </>
        ) : (
          <DiscoverRecipeRail
            title="Seçimine göre öne çıkanlar"
            subtitle={`${visiblePosts.length} tarif ve topluluk gönderisi bulundu.`}
            posts={visiblePosts}
            onOpenPost={openRecipe}
          />
        )}

        <View style={styles.collectionWrap}>
          <ProfileCollectionShowcase
            collections={enhancedSocialCollections.slice(0, 6)}
            onOpenCollection={(collectionId) => navigation.getParent()?.navigate('CollectionDetail', { collectionId })}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>İlgi alanların</Text>
          <Text style={styles.sectionAction}>Etkileşimlerine göre</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
          {rankedInterests.slice(0, 6).map((interest) => (
            <CategoryInterestChip
              key={interest.id}
              category={interest.id}
              label={interest.label}
              score={interest.score}
              active={activeTaste === interest.id}
              onPress={chooseTaste}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sosyal akış</Text>
          <Text style={styles.sectionAction}>{visiblePosts.length} gönderi</Text>
        </View>
        <View style={styles.feedList}>{visiblePosts.map(renderPostCard)}</View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Haftanın şefleri</Text>
          <Text style={styles.sectionAction}>Takip et</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
          {mockSocialUsers.slice(0, 8).map((chef) => (
            <UserProfileCard
              key={chef.id}
              user={chef}
              following={Boolean(followedUsers[chef.id])}
              onPress={() => openProfile(chef.id)}
              onToggleFollow={() => {
                if (!followedUsers[chef.id]) {
                  recordChefFollow(chef);
                }
                toggleFollowUser(chef.id);
                showToast(followedUsers[chef.id] ? 'Takip bırakıldı.' : `${chef.name} takip ediliyor.`);
              }}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trend etiketler</Text>
          <Text style={styles.sectionAction}>Bugün</Text>
        </View>
        <View style={styles.tagRow}>
          {trendTags.map((tag) => (
            <TouchableOpacity key={tag} onPress={() => handleTag(tag)} activeOpacity={0.82} style={styles.trendTag}>
              <Text style={styles.trendTagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Screen>

      <TarifALBotFab onPress={() => navigation.getParent()?.navigate('AiChefChat')} />
      <ShareRecipeModal
        visible={Boolean(sharePost)}
        title={sharePost?.title ?? 'Tarif paylaş'}
        onClose={() => setSharePost(null)}
        onAction={(message) => showToast(message, 'info')}
      />
      <TriedRecipeModal
        visible={Boolean(triedPost)}
        recipeTitle={triedPost?.title ?? 'Tarif'}
        onClose={() => setTriedPost(null)}
        onSubmit={handleTriedSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 7,
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  activityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  searchBar: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchText: {
    flex: 1,
    color: theme.colors.subtle,
    fontSize: 13,
    fontWeight: '800',
  },
  returnWrap: {
    marginTop: 14,
  },
  filterRow: {
    gap: 8,
    paddingTop: 16,
    paddingBottom: 2,
  },
  filterChip: {
    minHeight: 40,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    justifyContent: 'center',
  },
  filterChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  collectionWrap: {
    marginTop: 20,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  sectionAction: {
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '900',
  },
  horizontalRow: {
    gap: 9,
    paddingBottom: 2,
  },
  feedList: {
    gap: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  trendTag: {
    minHeight: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  trendTagText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});

function matchesExploreFilter(post: SocialFeedPost, filter: ExploreFilter) {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'practical') {
    return (post.totalTime ?? post.prepTime ?? 999) <= 30;
  }
  if (filter === 'economic') {
    return (post.marketBasketPrice ?? 999) <= 150 || post.tags.includes('ekonomik');
  }
  if (filter === 'fit') {
    return post.tags.some((tag) => ['fit', 'protein', 'saglikli'].includes(tag.toLocaleLowerCase('tr-TR')));
  }
  if (filter === 'master') {
    return post.difficulty === 'Zor' || post.tags.some((tag) => tag.toLocaleLowerCase('tr-TR').includes('ustaisi'));
  }
  return Boolean(post.restaurantOrderAvailable);
}
