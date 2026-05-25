import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { CollectionCard } from '../../components/CollectionCard';
import { FeedRecipeCard } from '../../components/FeedRecipeCard';
import { Screen } from '../../components/Screen';
import { UserProfileCard } from '../../components/UserProfileCard';
import { theme } from '../../constants/theme';
import {
  mockSocialActivities,
  mockSocialCollections,
  mockSocialUsers,
} from '../../data/mockSocial';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { useAppStore } from '../../store/useAppStore';
import { SocialUser } from '../../types';

const featureFilters = [
  'Trend Tarifler',
  'Haftanin Sefleri',
  'Ekonomik',
  'Fit',
  '15 Dakika',
  'Hazir Siparis',
  'Kampanyali Sepet',
];

export function SocialFeedScreen() {
  const navigation = useNavigation<any>();
  const socialLikes = useAppStore((store) => store.socialLikes);
  const socialSaves = useAppStore((store) => store.socialSaves);
  const socialPostStats = useAppStore((store) => store.socialPostStats);
  const socialPosts = useAppStore((store) => store.socialPosts);
  const followedUsers = useAppStore((store) => store.followedUsers);
  const currentUser = useAppStore((store) => store.user);
  const toggleSocialLike = useAppStore((store) => store.toggleSocialLike);
  const toggleSocialSave = useAppStore((store) => store.toggleSocialSave);
  const toggleFollowUser = useAppStore((store) => store.toggleFollowUser);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const { showToast, showDemoModal } = useFeedback();

  const usersById = useMemo(
    () => {
      const currentSocialUser: SocialUser = {
        id: currentUser?.id ?? 'demo-user',
        name: currentUser?.name ?? 'Enes',
        username: `@${(currentUser?.name ?? 'enes').toLocaleLowerCase('tr-TR').replace(/\s+/g, '')}`,
        avatarUrl:
          currentUser?.avatarUrl ??
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
        coverImageUrl:
          'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1200&auto=format&fit=crop',
        bio: 'TarifAL toplulugunda pratik ve sepetlenebilir tarifler paylasiyor.',
        location: 'Istanbul',
        followers: 128,
        following: 24,
        recipeCount: 1,
        totalLikes: 0,
        averageRating: 4.6,
        badges: ['Mutfak Ciragi', 'Ilk Tarif'],
        level: 'Mutfak Ciragi',
        expertiseAreas: ['Pratik yemek', 'Evde yap'],
      };

      return [currentSocialUser, ...mockSocialUsers].reduce<Record<string, SocialUser>>((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
    },
    [currentUser],
  );

  const trendingPosts = useMemo(
    () =>
      [...socialPosts].sort(
        (first, second) =>
          (socialPostStats[second.id]?.likes ?? second.likes) -
          (socialPostStats[first.id]?.likes ?? first.likes),
      ),
    [socialPostStats, socialPosts],
  );

  const openRecipe = (postId: string, recipeId: string) => {
    navigation.getParent()?.navigate('RecipeDetail', { recipeId, socialPostId: postId });
  };

  const openProfile = (userId: string) => {
    navigation.getParent()?.navigate('SocialProfile', { userId });
  };

  const addMarketBasket = (postId: string, recipeId: string) => {
    const post = socialPosts.find((item) => item.id === postId);
    addMissingIngredientsToCart(recipeId);
    showDemoModal({
      title: 'Sosyal tarif sepete donustu',
      message: `${post?.title ?? 'Tarif'} icin eksik urunler akilli sepete eklendi. TarifAL burada sosyal etkilesimi market sepetine baglar.`,
      primaryLabel: 'Sepete Git',
      secondaryLabel: 'Akilli Siparise Gec',
      onPrimary: () => navigation.navigate('Cart'),
      onSecondary: () => navigation.getParent()?.navigate('MarketCheckout'),
    });
  };

  const orderReadyMeal = (recipeId: string) => {
    navigation.getParent()?.navigate('RecipeDetail', {
      recipeId,
      purchaseMode: 'restaurant',
    });
  };

  const sharePost = () => {
    showToast('Paylasim linki demo modunda hazirlandi.', 'info');
  };

  const openActivity = () => {
    navigation.getParent()?.navigate('Activity');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>TarifAL Sosyal</Text>
          <Text style={styles.title}>Bugun mutfakta neler trend?</Text>
          <Text style={styles.subtitle}>
            Tarif paylas, sefleri takip et, begendigin yemegi sepete veya hazir siparise donustur.
          </Text>
        </View>
        <TouchableOpacity onPress={openActivity} activeOpacity={0.86} style={styles.activityButton}>
          <Ionicons name="notifications-outline" size={21} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.socialHero}>
        <View style={styles.heroIcon}>
          <Ionicons name="people" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Ister yap, ister al, ister sofrana gelsin.</Text>
          <Text style={styles.heroText}>
            Sosyal tarif akisi artik market ve restoran aksiyonlariyla ayni yerde.
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {featureFilters.map((filter, index) => (
          <TouchableOpacity
            key={filter}
            onPress={() => showToast(`${filter} filtresi demo olarak uygulandi.`, 'info')}
            activeOpacity={0.86}
            style={[styles.filterChip, index === 0 && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Haftanin Sefleri</Text>
        <Text style={styles.sectionAction}>Canli demo</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {mockSocialUsers.slice(0, 5).map((user) => (
          <UserProfileCard
            key={user.id}
            user={user}
            following={Boolean(followedUsers[user.id])}
            onPress={() => openProfile(user.id)}
            onToggleFollow={() => {
              toggleFollowUser(user.id);
              showToast(followedUsers[user.id] ? 'Takip birakildi.' : `${user.name} takip ediliyor.`);
            }}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Koleksiyonlar</Text>
        <Text style={styles.sectionAction}>Kaydet ve planla</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {mockSocialCollections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onPress={() => showToast(`${collection.title} koleksiyonu acildi.`, 'info')}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sosyal Tarif Akisi</Text>
        <Text style={styles.sectionAction}>{trendingPosts.length} gonderi</Text>
      </View>

      <View style={styles.feedList}>
        {trendingPosts.map((post) => {
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
            <FeedRecipeCard
              key={post.id}
              post={post}
              author={author}
              stats={stats}
              liked={Boolean(socialLikes[post.id])}
              saved={Boolean(socialSaves[post.id])}
              following={Boolean(followedUsers[author.id])}
              onOpenRecipe={() => openRecipe(post.id, post.recipeId)}
              onOpenProfile={() => openProfile(author.id)}
              onToggleLike={() => {
                toggleSocialLike(post.id);
                showToast(socialLikes[post.id] ? 'Begeniden cikarildi.' : 'Tarif begenildi.');
              }}
              onToggleSave={() => {
                toggleSocialSave(post.id);
                showToast(socialSaves[post.id] ? 'Kaydedilenlerden cikarildi.' : 'Tarif kaydedildi.');
              }}
              onToggleFollow={() => {
                toggleFollowUser(author.id);
                showToast(followedUsers[author.id] ? 'Takip birakildi.' : `${author.name} takip ediliyor.`);
              }}
              onAddMarket={() => addMarketBasket(post.id, post.recipeId)}
              onOrderReadyMeal={() => orderReadyMeal(post.recipeId)}
              onComment={() => openRecipe(post.id, post.recipeId)}
              onShare={sharePost}
            />
          );
        })}
      </View>

      <View style={styles.activityPreview}>
        <View style={styles.sectionHeaderCompact}>
          <Text style={styles.sectionTitle}>Aktivite Merkezi</Text>
          <TouchableOpacity onPress={openActivity}>
            <Text style={styles.linkText}>Tumunu gor</Text>
          </TouchableOpacity>
        </View>
        {mockSocialActivities.slice(0, 3).map((activity) => (
          <View key={activity.id} style={styles.activityRow}>
            <View style={styles.activityDot} />
            <View style={styles.activityCopy}>
              <Text style={styles.activityText}>{activity.text}</Text>
              <Text style={styles.activityTime}>{activity.createdAt}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('AddRecipe')}
        activeOpacity={0.86}
        style={styles.shareCta}
      >
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600&auto=format&fit=crop' }}
          style={styles.shareImage}
        />
        <View style={styles.shareCopy}>
          <Text style={styles.shareTitle}>Kendi tarifini paylas</Text>
          <Text style={styles.shareText}>
            Tarifini topluluga ekle; market sepeti ve hazir siparis etiketleriyle demo platformu canlandir.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 27,
    lineHeight: 32,
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
  socialHero: {
    marginTop: 16,
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
  sectionHeaderCompact: {
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
  horizontalList: {
    gap: 10,
    paddingBottom: 2,
  },
  feedList: {
    gap: 16,
  },
  activityPreview: {
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  activityDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginTop: 5,
    backgroundColor: theme.colors.primary,
  },
  activityCopy: {
    flex: 1,
  },
  activityText: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  activityTime: {
    marginTop: 3,
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '800',
  },
  shareCta: {
    marginTop: 18,
    minHeight: 96,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareImage: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
  },
  shareCopy: {
    flex: 1,
  },
  shareTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  shareText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
});
