import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { CategoryInterestChip } from '../../components/personalization/CategoryInterestChip';
import { CommentInput } from '../../components/CommentInput';
import { CommentList } from '../../components/CommentList';
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
import { SocialFeedPost, SocialUser, SponsoredCollection } from '../../types';
import {
  getSponsoredCollectionsForDiscover,
  trackSponsoredCollectionOpened,
} from '../../services/sponsoredPlacementService';
import { buildCurrentSocialUser } from '../../utils/profileIdentity';

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
  const [commentPost, setCommentPost] = useState<SocialFeedPost | null>(null);
  const [sponsoredSheetCollection, setSponsoredSheetCollection] = useState<SponsoredCollection | null>(null);
  const sponsoredSheetAnim = useRef(new Animated.Value(0)).current;
  const socialLikes = useAppStore((store) => store.socialLikes);
  const socialSaves = useAppStore((store) => store.socialSaves);
  const socialComments = useAppStore((store) => store.socialComments);
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
  const addSocialComment = useAppStore((store) => store.addSocialComment);
  const toggleCommentLike = useAppStore((store) => store.toggleCommentLike);
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

  const currentSocialUser: SocialUser = useMemo(() => buildCurrentSocialUser(currentUser), [currentUser]);

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
  const fastRailPosts = useMemo(
    () => fillRailPosts(railPosts.filter((post) => (post.totalTime ?? post.prepTime ?? 999) <= 30), railPosts),
    [railPosts],
  );
  const budgetRailPosts = useMemo(
    () =>
      fillRailPosts(
        railPosts.filter(
          (post) => (post.marketBasketPrice ?? 999) <= 220 || post.tags.includes('ekonomik'),
        ),
        railPosts,
      ),
    [railPosts],
  );
  const masterRailPosts = useMemo(
    () => fillRailPosts(railPosts.filter((post) => post.difficulty === 'Zor'), railPosts),
    [railPosts],
  );
  const readyRailPosts = useMemo(
    () => fillRailPosts(railPosts.filter((post) => post.restaurantOrderAvailable), railPosts),
    [railPosts],
  );
  const filteredRailPosts = useMemo(
    () => fillRailPosts(visiblePosts.filter((post) => post.recipeId && post.imageUrl), railPosts),
    [railPosts, visiblePosts],
  );
  const unreadCount = mockNotifications.filter(
    (notification) => !(readNotifications[notification.id] ?? notification.isRead),
  ).length;
  const sponsoredCollections = useMemo(() => getSponsoredCollectionsForDiscover(3), []);
  const sponsoredCollectionPostsById = useMemo(
    () =>
      sponsoredCollections.reduce<Record<string, SocialFeedPost[]>>((acc, collection) => {
        acc[collection.id] = railPosts
          .filter((post) => post.recipeId && collection.recipeIds.includes(post.recipeId))
          .slice(0, 4);
        return acc;
      }, {}),
    [railPosts, sponsoredCollections],
  );
  const sponsoredSheetPosts = sponsoredSheetCollection
    ? sponsoredCollectionPostsById[sponsoredSheetCollection.id] ?? []
    : [];
  const sponsoredSheetHeroImage = sponsoredSheetPosts[0]?.imageUrl;

  useEffect(() => {
    sponsoredCollections.forEach((collection) => {
      trackSponsoredCollectionOpened(collection, {
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        sourceScreen: 'Discover',
        isDemoMode: currentUser?.isDemo,
      });
    });
  }, [currentUser?.email, currentUser?.id, currentUser?.isDemo, sponsoredCollections]);

  useEffect(() => {
    if (!sponsoredSheetCollection) {
      return;
    }

    sponsoredSheetAnim.setValue(0);
    Animated.timing(sponsoredSheetAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [sponsoredSheetAnim, sponsoredSheetCollection]);

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
        onComment={() => setCommentPost(post)}
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

        {sponsoredCollections.map((collection) => {
          const posts = sponsoredCollectionPostsById[collection.id] ?? [];
          if (posts.length === 0) {
            return null;
          }

          return (
            <SponsoredDiscoverCollection
              key={collection.id}
              collection={collection}
              posts={posts}
              onOpenCollection={() => {
                trackSponsoredCollectionOpened(collection, {
                  userId: currentUser?.id,
                  userEmail: currentUser?.email,
                  sourceScreen: 'Discover',
                  isDemoMode: currentUser?.isDemo,
                });
                setSponsoredSheetCollection(collection);
              }}
              onOpenPost={(post) => {
                trackSponsoredCollectionOpened(collection, {
                  userId: currentUser?.id,
                  userEmail: currentUser?.email,
                  sourceScreen: 'DiscoverRecipe',
                  isDemoMode: currentUser?.isDemo,
                });
                openRecipe(post);
              }}
            />
          );
        })}

        {exploreFilter === 'all' ? (
          <>
            <DiscoverRecipeRail
              title="Pratik hızlı seçimler"
              subtitle="15-30 dakikada sofraya gelen, mantıklı ve uygulanabilir öneriler."
              posts={fastRailPosts}
              onOpenPost={openRecipe}
            />
            <DiscoverRecipeRail
              title="Akıllı bütçe seçkisi"
              subtitle="Kaliteden ödün vermeden fiyatı kontrollü, sepete dönüşmeye hazır öneriler."
              posts={budgetRailPosts}
              accent="#12B76A"
              onOpenPost={openRecipe}
            />
            <DiscoverRecipeRail
              title="Usta işi hafta sonu"
              subtitle="Şeflerin kaydettiği daha iddialı sofralar."
              posts={masterRailPosts}
              accent="#0B1020"
              onOpenPost={openRecipe}
            />
            <DiscoverRecipeRail
              title="Hazır sipariş alternatifi olanlar"
              subtitle="Evde yap veya sofrana gelsin."
              posts={readyRailPosts}
              onOpenPost={openRecipe}
            />
          </>
        ) : (
          <DiscoverRecipeRail
            title="Seçimine göre öne çıkanlar"
            subtitle={`${visiblePosts.length} tarif ve topluluk gönderisi bulundu.`}
            posts={filteredRailPosts}
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
      <Modal visible={Boolean(commentPost)} transparent animationType="fade" onRequestClose={() => setCommentPost(null)}>
        <View style={styles.commentBackdrop}>
          <View style={styles.commentSheet}>
            <View style={styles.commentHeader}>
              <View style={styles.commentHeaderCopy}>
                <Text style={styles.commentEyebrow}>Topluluk yorumları</Text>
                <Text style={styles.commentTitle} numberOfLines={2}>
                  {commentPost?.title ?? 'Tarif yorumları'}
                </Text>
              </View>
              <Pressable
                onPress={() => setCommentPost(null)}
                accessibilityRole="button"
                accessibilityLabel="Yorumları kapat"
                style={styles.commentCloseButton}
              >
                <Ionicons name="close" size={21} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.commentListArea} contentContainerStyle={styles.commentListContent}>
              <CommentList
                comments={commentPost ? socialComments[commentPost.id] ?? [] : []}
                usersById={usersById}
                currentUserName={currentSocialUser.name}
                onToggleLike={toggleCommentLike}
              />
            </ScrollView>

            <CommentInput
              onSubmit={(text) => {
                if (!commentPost) {
                  return;
                }

                addSocialComment(commentPost.id, text);
                showToast('Yorumun eklendi.', 'success');
              }}
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={Boolean(sponsoredSheetCollection)}
        transparent
        animationType="fade"
        onRequestClose={() => setSponsoredSheetCollection(null)}
      >
        <View style={styles.sponsoredSheetBackdrop}>
          <Animated.View
            style={[
              styles.sponsoredSheet,
              {
                opacity: sponsoredSheetAnim,
                transform: [
                  {
                    translateY: sponsoredSheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                  {
                    scale: sponsoredSheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.98, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sponsoredSheetHeader}>
              {sponsoredSheetCollection ? (
                <BrandLogoBadge collection={sponsoredSheetCollection} size="large" />
              ) : null}
              <View style={styles.sponsoredSheetCopy}>
                <Text style={styles.sponsoredSheetEyebrow}>Sponsorlu marka vitrini</Text>
                <Text style={styles.sponsoredSheetTitle}>{sponsoredSheetCollection?.title ?? 'TarifAL vitrini'}</Text>
                <Text style={styles.sponsoredSheetText}>
                  {sponsoredSheetCollection?.subtitle ?? 'Tarif ve ürün eşleşmelerini incele.'}
                </Text>
              </View>
              <Pressable
                onPress={() => setSponsoredSheetCollection(null)}
                accessibilityRole="button"
                accessibilityLabel="Sponsorlu vitrini kapat"
                style={styles.commentCloseButton}
              >
                <Ionicons name="close" size={21} color={theme.colors.text} />
              </Pressable>
            </View>

            {sponsoredSheetHeroImage ? (
              <ImageBackground
                source={{ uri: sponsoredSheetHeroImage }}
                style={styles.sponsoredSheetHero}
                imageStyle={styles.sponsoredSheetHeroImage}
              >
                <View style={styles.sponsoredSheetHeroOverlay} />
                <View style={styles.sponsoredSheetHeroContent}>
                  <View style={styles.sponsoredSheetHeroBrand}>
                    {sponsoredSheetCollection ? (
                      <BrandLogoBadge collection={sponsoredSheetCollection} size="small" variant="flat" />
                    ) : null}
                  </View>
                  <View style={styles.sponsoredSheetHeroCopy}>
                    <Text style={styles.sponsoredSheetHeroEyebrow}>
                      {sponsoredSheetCollection?.brandName ?? 'TarifAL'} partner vitrini
                    </Text>
                    <Text style={styles.sponsoredSheetHeroTitle}>
                      Tarif ihtiyacına bağlı ürün eşleşmesi
                    </Text>
                  </View>
                </View>
              </ImageBackground>
            ) : null}

            <View style={styles.sponsoredSheetStats}>
              <View style={styles.sponsoredSheetStat}>
                <Text style={styles.sponsoredSheetStatValue}>{sponsoredSheetPosts.length}</Text>
                <Text style={styles.sponsoredSheetStatLabel}>tarif eşleşmesi</Text>
              </View>
              <View style={styles.sponsoredSheetStat}>
                <Text style={styles.sponsoredSheetStatValue}>
                  {sponsoredSheetCollection?.productIds.length ?? 0}
                </Text>
                <Text style={styles.sponsoredSheetStatLabel}>ürün önerisi</Text>
              </View>
              <View style={styles.sponsoredSheetStat}>
                <Text style={styles.sponsoredSheetStatValue}>Demo</Text>
                <Text style={styles.sponsoredSheetStatLabel}>gelir vitrini</Text>
              </View>
            </View>

            <ScrollView style={styles.sponsoredSheetList} contentContainerStyle={styles.sponsoredSheetListContent}>
              {sponsoredSheetPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  onPress={() => {
                    const activeCollection = sponsoredSheetCollection;
                    setSponsoredSheetCollection(null);
                    if (activeCollection) {
                      trackSponsoredCollectionOpened(activeCollection, {
                        userId: currentUser?.id,
                        userEmail: currentUser?.email,
                        sourceScreen: 'SponsoredCollectionSheet',
                        isDemoMode: currentUser?.isDemo,
                      });
                    }
                    openRecipe(post);
                  }}
                  activeOpacity={0.84}
                  style={styles.sponsoredSheetRecipe}
                  accessibilityRole="button"
                  accessibilityLabel={`${post.title} sponsorlu tarifini aç`}
                >
                  <ImageBackground
                    source={{ uri: post.imageUrl }}
                    style={styles.sponsoredSheetRecipeImage}
                    imageStyle={styles.sponsoredSheetRecipeImageStyle}
                  >
                    <View style={styles.sponsoredSheetRecipeImageBadge}>
                      <Ionicons name="restaurant-outline" size={14} color="#FFFFFF" />
                    </View>
                  </ImageBackground>
                  <View style={styles.sponsoredSheetRecipeCopy}>
                    <Text style={styles.sponsoredSheetRecipeTitle} numberOfLines={2}>
                      {post.title}
                    </Text>
                    <Text style={styles.sponsoredSheetRecipeMeta}>
                      {post.totalTime ?? post.prepTime ?? 0} dk · ₺{post.marketBasketPrice ?? 0} sepet
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sponsoredSheetInsight}>
              <Ionicons name="sparkles-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.sponsoredSheetInsightText}>
                Bu alan reklam panosu değil; tarif ihtiyacına bağlı ürün ve marka eşleşmesi demosudur.
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
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

function SponsoredDiscoverCollection({
  collection,
  posts,
  onOpenCollection,
  onOpenPost,
}: {
  collection: SponsoredCollection;
  posts: SocialFeedPost[];
  onOpenCollection: () => void;
  onOpenPost: (post: SocialFeedPost) => void;
}) {
  return (
    <View style={styles.sponsoredCollectionCard}>
      <View style={styles.sponsoredCollectionTop}>
        <BrandLogoBadge collection={collection} size="medium" />
        <View style={styles.sponsoredCollectionCopy}>
          <Text style={styles.sponsoredCollectionLabel}>{collection.sponsorLabel}</Text>
          <Text style={styles.sponsoredCollectionTitle}>{collection.title}</Text>
          <Text style={styles.sponsoredCollectionSubtitle}>{collection.subtitle}</Text>
        </View>
        <TouchableOpacity
          onPress={onOpenCollection}
          activeOpacity={0.84}
          style={styles.sponsoredCollectionCta}
          accessibilityRole="button"
          accessibilityLabel={`${collection.title} marka vitrinini incele`}
        >
          <Text style={styles.sponsoredCollectionCtaText}>{collection.ctaLabel}</Text>
          <Ionicons name="arrow-forward" size={15} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.sponsoredMetricRow}>
        <View style={styles.sponsoredMetricPill}>
          <Ionicons name="storefront-outline" size={13} color={theme.colors.primary} />
          <Text style={styles.sponsoredMetricText}>{posts.length} tarif eşleşmesi</Text>
        </View>
        <View style={styles.sponsoredMetricPill}>
          <Ionicons name="basket-outline" size={13} color={theme.colors.primary} />
          <Text style={styles.sponsoredMetricText}>Sepete doğal geçiş</Text>
        </View>
      </View>
      <View style={styles.sponsoredRecipeRow}>
        {posts.slice(0, 3).map((post) => (
          <TouchableOpacity
            key={post.id}
            onPress={() => onOpenPost(post)}
            activeOpacity={0.84}
            style={styles.sponsoredRecipePill}
            accessibilityRole="button"
            accessibilityLabel={`${post.title} tarifini aç`}
          >
            <Text style={styles.sponsoredRecipeText} numberOfLines={1}>{post.title}</Text>
            <Text style={styles.sponsoredRecipeMeta} numberOfLines={1}>
              {post.totalTime ?? post.prepTime ?? 0} dk · ₺{post.marketBasketPrice ?? 0}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function BrandLogoBadge({
  collection,
  size,
  variant = 'soft',
}: {
  collection: SponsoredCollection;
  size: 'small' | 'medium' | 'large';
  variant?: 'soft' | 'flat';
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const logoSize = size === 'large' ? 58 : size === 'medium' ? 52 : 34;
  const imageSize = size === 'large' ? 40 : size === 'medium' ? 36 : 24;
  const initials = collection.brandName.slice(0, 2).toLocaleUpperCase('tr-TR');

  return (
    <View
      style={[
        styles.brandLogoBadge,
        {
          width: logoSize,
          height: logoSize,
          borderRadius: size === 'small' ? 13 : 18,
          backgroundColor: variant === 'flat' ? '#FFFFFF' : '#FFF1EA',
        },
      ]}
    >
      {collection.brandLogoUrl && !logoFailed ? (
        <Image
          source={{ uri: collection.brandLogoUrl }}
          style={{ width: imageSize, height: imageSize }}
          resizeMode="contain"
          onError={() => setLogoFailed(true)}
          accessibilityLabel={`${collection.brandName} logosu`}
        />
      ) : (
        <Text style={[styles.brandLogoFallback, size === 'small' && styles.brandLogoFallbackSmall]}>
          {initials}
        </Text>
      )}
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
  sponsoredCollectionCard: {
    marginTop: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 14,
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  sponsoredCollectionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sponsoredCollectionCopy: {
    flex: 1,
  },
  sponsoredCollectionLabel: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sponsoredCollectionTitle: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sponsoredCollectionSubtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  sponsoredCollectionCta: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sponsoredCollectionCtaText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  sponsoredMetricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  sponsoredMetricPill: {
    minHeight: 30,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sponsoredMetricText: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  sponsoredRecipeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  sponsoredRecipePill: {
    flexGrow: 1,
    flexBasis: 180,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FFE0CF',
  },
  sponsoredRecipeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  sponsoredRecipeMeta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 9,
    fontWeight: '800',
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
  brandLogoBadge: {
    borderWidth: 1,
    borderColor: '#FFE0CF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogoFallback: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandLogoFallbackSmall: {
    fontSize: 10,
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
  commentBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.5)',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '86%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...theme.shadow,
    shadowOpacity: 0.16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  commentHeaderCopy: {
    flex: 1,
  },
  commentEyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  commentTitle: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  commentCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentListArea: {
    maxHeight: 390,
  },
  commentListContent: {
    paddingBottom: 12,
  },
  sponsoredSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.52)',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsoredSheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '88%',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 14,
    ...theme.shadow,
    shadowOpacity: 0.18,
  },
  sponsoredSheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sponsoredSheetCopy: {
    flex: 1,
  },
  sponsoredSheetEyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sponsoredSheetTitle: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
  },
  sponsoredSheetText: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  sponsoredSheetHero: {
    height: 136,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 14,
    backgroundColor: theme.colors.text,
  },
  sponsoredSheetHeroImage: {
    borderRadius: 24,
  },
  sponsoredSheetHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.42)',
  },
  sponsoredSheetHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sponsoredSheetHeroBrand: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsoredSheetHeroCopy: {
    flex: 1,
  },
  sponsoredSheetHeroEyebrow: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sponsoredSheetHeroTitle: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  sponsoredSheetStats: {
    flexDirection: 'row',
    gap: 8,
  },
  sponsoredSheetStat: {
    flex: 1,
    minHeight: 62,
    borderRadius: 20,
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#FFE0CF',
    padding: 10,
    justifyContent: 'center',
  },
  sponsoredSheetStatValue: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  sponsoredSheetStatLabel: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
  },
  sponsoredSheetList: {
    maxHeight: 310,
  },
  sponsoredSheetListContent: {
    gap: 9,
    paddingBottom: 2,
  },
  sponsoredSheetRecipe: {
    minHeight: 74,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sponsoredSheetRecipeImage: {
    width: 58,
    height: 58,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 6,
    backgroundColor: '#FFFFFF',
  },
  sponsoredSheetRecipeImageStyle: {
    borderRadius: 18,
  },
  sponsoredSheetRecipeImageBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsoredSheetRecipeCopy: {
    flex: 1,
  },
  sponsoredSheetRecipeTitle: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  sponsoredSheetRecipeMeta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  sponsoredSheetInsight: {
    borderRadius: 20,
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#FFE0CF',
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sponsoredSheetInsightText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
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
    return (post.marketBasketPrice ?? 999) <= 220 || post.tags.includes('ekonomik');
  }
  if (filter === 'fit') {
    return post.tags.some((tag) => ['fit', 'protein', 'saglikli'].includes(tag.toLocaleLowerCase('tr-TR')));
  }
  if (filter === 'master') {
    return post.difficulty === 'Zor' || post.tags.some((tag) => tag.toLocaleLowerCase('tr-TR').includes('ustaisi'));
  }
  return Boolean(post.restaurantOrderAvailable);
}

function fillRailPosts(primaryPosts: SocialFeedPost[], fallbackPosts: SocialFeedPost[], limit = 6) {
  const seen = new Set<string>();

  return [...primaryPosts, ...fallbackPosts]
    .filter((post) => {
      if (!post.recipeId || !post.imageUrl || seen.has(post.id)) {
        return false;
      }

      seen.add(post.id);
      return true;
    })
    .slice(0, limit);
}
