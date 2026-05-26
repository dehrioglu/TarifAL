import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { BotSuggestionCard } from '../../components/BotSuggestionCard';
import { CollectionCard } from '../../components/CollectionCard';
import { Screen } from '../../components/Screen';
import { ShareRecipeModal } from '../../components/ShareRecipeModal';
import { SocialPostCard } from '../../components/SocialPostCard';
import { StoriesCarousel } from '../../components/StoriesCarousel';
import { TarifALBotFab } from '../../components/TarifALBotFab';
import { TriedRecipeModal } from '../../components/TriedRecipeModal';
import { UserProfileCard } from '../../components/UserProfileCard';
import { theme } from '../../constants/theme';
import { enhancedSocialCollections } from '../../data/mockCollections';
import { mockSocialUsers } from '../../data/mockSocial';
import { mockSocialFeedExtras, recipePostToFeedPost } from '../../data/mockSocialPosts';
import { mockStories } from '../../data/mockStories';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { getSocialBotSuggestions } from '../../services/botService';
import { useAppStore } from '../../store/useAppStore';
import { SocialFeedPost, SocialUser } from '../../types';

const filters = [
  'Tümü',
  'Ev Yemeği',
  'Fit',
  'Ekonomik',
  'Usta İşi',
  'Tatlı',
  'Hazır Sipariş',
  'Sepete Uygun',
];

export function SocialFeedScreen() {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState('Tümü');
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
  const toggleSocialLike = useAppStore((store) => store.toggleSocialLike);
  const toggleSocialSave = useAppStore((store) => store.toggleSocialSave);
  const toggleFollowUser = useAppStore((store) => store.toggleFollowUser);
  const voteSocialPoll = useAppStore((store) => store.voteSocialPoll);
  const toggleChallengeJoin = useAppStore((store) => store.toggleChallengeJoin);
  const addTriedRecipe = useAppStore((store) => store.addTriedRecipe);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const { showToast, showDemoModal } = useFeedback();

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

  const botSuggestions = useMemo(() => getSocialBotSuggestions(), []);
  const feedPosts = useMemo<SocialFeedPost[]>(
    () => [...socialPosts.map(recipePostToFeedPost), ...mockSocialFeedExtras],
    [socialPosts],
  );

  const filteredPosts = useMemo(
    () =>
      feedPosts.filter((post) => {
        const searchable = `${post.title} ${post.text} ${post.tags.join(' ')} ${post.commercialBadges?.join(' ') ?? ''}`.toLocaleLowerCase('tr-TR');

        if (activeFilter === 'Tümü') {
          return true;
        }
        if (activeFilter === 'Ev Yemeği') {
          return searchable.includes('ev') || searchable.includes('geleneksel');
        }
        if (activeFilter === 'Fit') {
          return searchable.includes('fit') || searchable.includes('protein');
        }
        if (activeFilter === 'Ekonomik') {
          return searchable.includes('ekonomik') || searchable.includes('öğrenci') || searchable.includes('kampanyalı');
        }
        if (activeFilter === 'Usta İşi') {
          return searchable.includes('usta') || post.difficulty === 'Zor';
        }
        if (activeFilter === 'Tatlı') {
          return searchable.includes('tatlı') || searchable.includes('baklava') || searchable.includes('sütlaç');
        }
        if (activeFilter === 'Hazır Sipariş') {
          return Boolean(post.restaurantOrderAvailable);
        }
        if (activeFilter === 'Sepete Uygun') {
          return Boolean(post.marketBasketPrice);
        }

        return true;
      }),
    [activeFilter, feedPosts],
  );

  const trendingPosts = useMemo(
    () =>
      [...feedPosts]
        .sort((first, second) => (socialPostStats[second.id]?.likes ?? second.likes) - (socialPostStats[first.id]?.likes ?? first.likes))
        .slice(0, 6),
    [feedPosts, socialPostStats],
  );

  const hardPosts = useMemo(
    () => feedPosts.filter((post) => post.difficulty === 'Zor' || post.tags.join(' ').includes('usta')).slice(0, 8),
    [feedPosts],
  );

  const openRecipe = (post: SocialFeedPost) => {
    if (post.recipeId) {
      navigation.getParent()?.navigate('RecipeDetail', { recipeId: post.recipeId, socialPostId: post.id });
      return;
    }

    showToast('Bu sosyal gönderi tarif detayı yerine demo bilgi kartı olarak çalışıyor.', 'info');
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
          toggleSocialLike(post.id);
          showToast(socialLikes[post.id] ? 'Beğeniden çıkarıldı.' : 'Gönderi beğenildi.');
        }}
        onToggleSave={() => {
          toggleSocialSave(post.id);
          showToast(socialSaves[post.id] ? 'Kaydedilenlerden çıkarıldı.' : 'Gönderi kaydedildi.');
        }}
        onToggleFollow={() => {
          toggleFollowUser(author.id);
          showToast(followedUsers[author.id] ? 'Takip bırakıldı.' : `${author.name} takip ediliyor.`);
        }}
        onAddMarket={() => addMarketBasket(post)}
        onOrderReadyMeal={() => orderReadyMeal(post)}
        onComment={() => openRecipe(post)}
        onShare={() => setSharePost(post)}
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
            <Text style={styles.eyebrow}>TarifAL Sosyal</Text>
            <Text style={styles.title}>Yaşayan yemek platformu</Text>
            <Text style={styles.subtitle}>
              Şefleri takip et, hikayeleri izle, tarifleri kaydet, eksikleri sepete veya hazır siparişe dönüştür.
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Activity')} activeOpacity={0.86} style={styles.activityButton}>
            <Ionicons name="notifications-outline" size={21} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('Search')}
          activeOpacity={0.86}
          style={styles.searchBar}
        >
          <Ionicons name="search" size={19} color={theme.colors.subtle} />
          <Text style={styles.searchText}>Tarif, şef, koleksiyon veya etiket ara...</Text>
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

        <View style={styles.socialHero}>
          <View style={styles.heroIcon}>
            <Ionicons name="people" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>İster yap, ister al, ister sofrana gelsin.</Text>
            <Text style={styles.heroText}>Sosyal tarif akışı market ve restoran aksiyonlarıyla aynı yerde.</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                setActiveFilter(filter);
                showToast(`${filter} filtresi uygulandı.`, 'info');
              }}
              activeOpacity={0.86}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trend Tarifler</Text>
          <Text style={styles.sectionAction}>{trendingPosts.length} gönderi</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniPostRow}>
          {trendingPosts.map((post) => (
            <TouchableOpacity key={post.id} onPress={() => openRecipe(post)} activeOpacity={0.86} style={styles.miniPostCard}>
              <Text style={styles.miniPostTitle} numberOfLines={2}>{post.title}</Text>
              <Text style={styles.miniPostMeta}>{post.likes.toLocaleString('tr-TR')} beğeni</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Haftanın Şefleri</Text>
          <Text style={styles.sectionAction}>Takip et</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {mockSocialUsers.slice(0, 8).map((user) => (
            <UserProfileCard
              key={user.id}
              user={user}
              following={Boolean(followedUsers[user.id])}
              onPress={() => openProfile(user.id)}
              onToggleFollow={() => {
                toggleFollowUser(user.id);
                showToast(followedUsers[user.id] ? 'Takip bırakıldı.' : `${user.name} takip ediliyor.`);
              }}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yeni Eklenen Zor Tarifler</Text>
          <Text style={styles.sectionAction}>Usta işi</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniPostRow}>
          {hardPosts.map((post) => (
            <TouchableOpacity key={post.id} onPress={() => openRecipe(post)} activeOpacity={0.86} style={styles.hardCard}>
              <Text style={styles.hardBadge}>Zor</Text>
              <Text style={styles.miniPostTitle} numberOfLines={2}>{post.title}</Text>
              <Text style={styles.miniPostMeta}>{post.totalTime ?? 60} dk • ₺{post.marketBasketPrice ?? 0}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Koleksiyonlar</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('CollectionDetail', { collectionId: 'collection-master' })}>
            <Text style={styles.linkText}>Usta işi aç</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {enhancedSocialCollections.slice(0, 8).map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onPress={() => navigation.getParent()?.navigate('CollectionDetail', { collectionId: collection.id })}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TarifAL Bot Önerileri</Text>
          <Text style={styles.sectionAction}>Mock AI</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {botSuggestions.map((suggestion) => (
            <BotSuggestionCard
              key={suggestion.prompt}
              title={suggestion.prompt}
              response={suggestion.response}
              onPress={() => {
                showDemoModal({
                  title: suggestion.prompt,
                  message: suggestion.response,
                  primaryLabel: 'Bot Chat’e Git',
                  secondaryLabel: 'Kapat',
                  onPrimary: () => navigation.getParent()?.navigate('AiChefChat'),
                });
              }}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sosyal Feed</Text>
          <Text style={styles.sectionAction}>{filteredPosts.length} gönderi</Text>
        </View>
        <View style={styles.feedList}>{filteredPosts.map(renderPostCard)}</View>
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
    fontSize: 28,
    lineHeight: 33,
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
  socialHero: {
    marginTop: 8,
    borderRadius: 26,
    backgroundColor: theme.colors.text,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  heroText: {
    marginTop: 5,
    color: '#D0D5DD',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  filterRow: {
    gap: 8,
    paddingTop: 15,
    paddingBottom: 4,
  },
  filterChip: {
    minHeight: 38,
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
  filterText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  filterTextActive: {
    color: '#FFFFFF',
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
    fontSize: 12,
    fontWeight: '900',
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  horizontalList: {
    gap: 10,
    paddingBottom: 2,
  },
  miniPostRow: {
    gap: 10,
  },
  miniPostCard: {
    width: 178,
    minHeight: 108,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 13,
    justifyContent: 'space-between',
  },
  hardCard: {
    width: 190,
    minHeight: 116,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 13,
    justifyContent: 'space-between',
  },
  hardBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 4,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
  },
  miniPostTitle: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },
  miniPostMeta: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  feedList: {
    gap: 16,
  },
});
