import { useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollectionCard } from '../../components/CollectionCard';
import { CommentList } from '../../components/CommentList';
import { FeedRecipeCard } from '../../components/FeedRecipeCard';
import { FollowButton } from '../../components/FollowButton';
import { UserAvatar } from '../../components/UserAvatar';
import { theme } from '../../constants/theme';
import {
  formatFollowerCount,
  mockSocialCollections,
  mockSocialComments,
  mockSocialUsers,
} from '../../data/mockSocial';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { SocialRecipePost, SocialUser } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SocialProfile'>;
type ProfileTab = 'recipes' | 'saved' | 'collections' | 'comments' | 'about';

const tabs: Array<{ id: ProfileTab; label: string }> = [
  { id: 'recipes', label: 'Tarifler' },
  { id: 'saved', label: 'Kaydedilenler' },
  { id: 'collections', label: 'Koleksiyonlar' },
  { id: 'comments', label: 'Yorumlar' },
  { id: 'about', label: 'Hakkinda' },
];

export function SocialProfileScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ProfileTab>('recipes');
  const socialLikes = useAppStore((store) => store.socialLikes);
  const socialSaves = useAppStore((store) => store.socialSaves);
  const socialPostStats = useAppStore((store) => store.socialPostStats);
  const socialPosts = useAppStore((store) => store.socialPosts);
  const followedUsers = useAppStore((store) => store.followedUsers);
  const socialComments = useAppStore((store) => store.socialComments);
  const currentUser = useAppStore((store) => store.user);
  const toggleSocialLike = useAppStore((store) => store.toggleSocialLike);
  const toggleSocialSave = useAppStore((store) => store.toggleSocialSave);
  const toggleFollowUser = useAppStore((store) => store.toggleFollowUser);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const { showToast, showDemoModal } = useFeedback();

  const currentSocialUser: SocialUser = useMemo(
    () => ({
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
      recipeCount: socialPosts.filter((post) => post.authorId === (currentUser?.id ?? 'demo-user')).length,
      totalLikes: 0,
      averageRating: 4.6,
      badges: ['Mutfak Ciragi', 'Ilk Tarif'],
      level: 'Mutfak Ciragi',
      expertiseAreas: ['Pratik yemek', 'Evde yap'],
    }),
    [currentUser, socialPosts],
  );
  const allUsers = useMemo(() => [currentSocialUser, ...mockSocialUsers], [currentSocialUser]);
  const user = allUsers.find((item) => item.id === route.params.userId) ?? allUsers[0];
  const usersById = useMemo(
    () =>
      allUsers.reduce<Record<string, SocialUser>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [allUsers],
  );
  const posts = socialPosts.filter((post) => post.authorId === user.id);
  const savedPosts = socialPosts.filter((post) => socialSaves[post.id]);
  const comments = Object.values(socialComments).flat().filter((comment) => comment.userId === user.id);
  const fallbackComments = Object.values(mockSocialComments).flat().filter((comment) => comment.userId === user.id);
  const visibleComments = comments.length > 0 ? comments : fallbackComments;

  const openRecipe = (postId: string, recipeId: string) => {
    navigation.navigate('RecipeDetail', { recipeId, socialPostId: postId });
  };

  const addMarketBasket = (postId: string, recipeId: string) => {
    const post = socialPosts.find((item) => item.id === postId);
    addMissingIngredientsToCart(recipeId);
    showDemoModal({
      title: 'Sef tarifinden sepete',
      message: `${post?.title ?? 'Tarif'} icin eksik malzemeler akilli sepete eklendi. Bu sosyal-ticari donusum demo modunda simule edildi.`,
      primaryLabel: 'Sepete Git',
      secondaryLabel: 'Akilli Siparise Gec',
      onPrimary: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
      onSecondary: () => navigation.navigate('MarketCheckout'),
    });
  };

  const renderPosts = (items: SocialRecipePost[]) => (
    <View style={styles.feedList}>
      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="albums-outline" size={24} color={theme.colors.subtle} />
          <Text style={styles.emptyTitle}>Burada henuz tarif yok</Text>
          <Text style={styles.emptyText}>Kaydedilen veya paylasilan tarifler burada gorunur.</Text>
        </View>
      ) : (
        items.map((post) => (
          <FeedRecipeCard
            key={post.id}
            post={post}
            author={usersById[post.authorId] ?? user}
            stats={socialPostStats[post.id] ?? {
              likes: post.likes,
              commentsCount: post.commentsCount,
              saves: post.saves,
            }}
            liked={Boolean(socialLikes[post.id])}
            saved={Boolean(socialSaves[post.id])}
            following={Boolean(followedUsers[post.authorId])}
            onOpenRecipe={() => openRecipe(post.id, post.recipeId)}
            onOpenProfile={() => undefined}
            onToggleLike={() => {
              toggleSocialLike(post.id);
              showToast(socialLikes[post.id] ? 'Begeniden cikarildi.' : 'Tarif begenildi.');
            }}
            onToggleSave={() => {
              toggleSocialSave(post.id);
              showToast(socialSaves[post.id] ? 'Kaydedilenlerden cikarildi.' : 'Tarif kaydedildi.');
            }}
            onToggleFollow={() => {
              toggleFollowUser(post.authorId);
              showToast(followedUsers[post.authorId] ? 'Takip birakildi.' : 'Takip ediliyor.');
            }}
            onAddMarket={() => addMarketBasket(post.id, post.recipeId)}
            onOrderReadyMeal={() => navigation.navigate('RecipeDetail', { recipeId: post.recipeId, purchaseMode: 'restaurant' })}
            onComment={() => openRecipe(post.id, post.recipeId)}
            onShare={() => showToast('Profil tarifi demo olarak paylasildi.', 'info')}
          />
        ))
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ImageBackground
          source={{ uri: user.coverImageUrl }}
          style={styles.cover}
          imageStyle={styles.coverImage}
        >
          <View style={styles.coverOverlay} />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.86}
            style={[styles.backButton, { top: insets.top + 10 }]}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </ImageBackground>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <UserAvatar uri={user.avatarUrl} name={user.name} size={92} />
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {user.isVerified ? <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} /> : null}
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.bio}>{user.bio}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color={theme.colors.muted} />
            <Text style={styles.location}>{user.location}</Text>
          </View>

          <View style={styles.stats}>
            <Stat value={formatFollowerCount(user.followers)} label="Takipci" />
            <Stat value={formatFollowerCount(user.following)} label="Takip" />
            <Stat value={String(user.recipeCount)} label="Tarif" />
            <Stat value={`${user.averageRating}`} label="Puan" />
          </View>

          <View style={styles.actionRow}>
            <FollowButton
              following={Boolean(followedUsers[user.id])}
              onPress={() => {
                toggleFollowUser(user.id);
                showToast(followedUsers[user.id] ? 'Takip birakildi.' : `${user.name} takip ediliyor.`);
              }}
            />
            <TouchableOpacity
              onPress={() => showToast('Mesajlasma MVP sonrasi aktif olacak.', 'info')}
              activeOpacity={0.86}
              style={styles.messageButton}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={17} color={theme.colors.primary} />
              <Text style={styles.messageText}>Mesaj Gonder</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.badges}>
            {user.badges.map((badge) => (
              <View key={badge} style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.86}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === 'recipes' ? renderPosts(posts) : null}
        {activeTab === 'saved' ? renderPosts(savedPosts) : null}
        {activeTab === 'collections' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionRow}>
            {mockSocialCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onPress={() => showToast(`${collection.title} koleksiyonu acildi.`, 'info')}
              />
            ))}
          </ScrollView>
        ) : null}
        {activeTab === 'comments' ? (
          <View style={styles.commentsCard}>
            <Text style={styles.sectionTitle}>Son yorumlar</Text>
            <CommentList comments={visibleComments} usersById={usersById} />
          </View>
        ) : null}
        {activeTab === 'about' ? (
          <View style={styles.aboutCard}>
            <Text style={styles.sectionTitle}>Uzmanlik alanlari</Text>
            <View style={styles.badges}>
              {user.expertiseAreas.map((area) => (
                <View key={area} style={styles.softBadge}>
                  <Text style={styles.softBadgeText}>{area}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.aboutText}>
              Bu profil demo sosyal agini canli gostermek icin mock veriyle calisir. Ileride takip,
              mesaj ve tarif yayinlama aksiyonlari Firebase veya gercek API ile baglanabilir.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 110,
  },
  cover: {
    height: 210,
  },
  coverImage: {
    resizeMode: 'cover',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.22)',
  },
  backButton: {
    position: 'absolute',
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    marginTop: -34,
    marginHorizontal: theme.screen.padding,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    ...theme.shadow,
    shadowOpacity: 0.06,
  },
  avatarWrap: {
    marginTop: -62,
    borderRadius: 52,
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },
  nameRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    color: theme.colors.text,
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  username: {
    marginTop: 3,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  bio: {
    marginTop: 9,
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  locationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  stats: {
    width: '100%',
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  actionRow: {
    width: '100%',
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  messageButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  messageText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  badges: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
  },
  badge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  tabRow: {
    gap: 8,
    paddingHorizontal: theme.screen.padding,
    paddingTop: 18,
    paddingBottom: 12,
  },
  tab: {
    minHeight: 40,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  activeTab: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  feedList: {
    paddingHorizontal: theme.screen.padding,
    gap: 14,
  },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 22,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  collectionRow: {
    gap: 10,
    paddingHorizontal: theme.screen.padding,
  },
  commentsCard: {
    marginHorizontal: theme.screen.padding,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  aboutCard: {
    marginHorizontal: theme.screen.padding,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  softBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  softBadgeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  aboutText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
});
