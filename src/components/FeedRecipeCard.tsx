import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { formatFollowerCount } from '../data/mockSocial';
import { SocialPostStats, SocialRecipePost, SocialUser } from '../types';
import { FollowButton } from './FollowButton';
import { LikeButton, SaveButton, ShareButton } from './SocialActionButtons';
import { UserAvatar } from './UserAvatar';

type FeedRecipeCardProps = {
  post: SocialRecipePost;
  author: SocialUser;
  stats: SocialPostStats;
  liked: boolean;
  saved: boolean;
  following: boolean;
  onOpenRecipe: () => void;
  onOpenProfile: () => void;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onToggleFollow: () => void;
  onAddMarket: () => void;
  onOrderReadyMeal: () => void;
  onComment: () => void;
  onShare: () => void;
};

export function FeedRecipeCard({
  post,
  author,
  stats,
  liked,
  saved,
  following,
  onOpenRecipe,
  onOpenProfile,
  onToggleLike,
  onToggleSave,
  onToggleFollow,
  onAddMarket,
  onOrderReadyMeal,
  onComment,
  onShare,
}: FeedRecipeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.authorRow}>
        <Pressable onPress={onOpenProfile} style={styles.authorInfo}>
          <UserAvatar uri={author.avatarUrl} name={author.name} size={44} />
          <View style={styles.authorCopy}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName} numberOfLines={1}>{author.name}</Text>
              {author.isVerified ? <Ionicons name="checkmark-circle" size={15} color={theme.colors.primary} /> : null}
            </View>
            <Text style={styles.authorMeta} numberOfLines={1}>
              {author.level} · {formatFollowerCount(author.followers)} takipci
            </Text>
          </View>
        </Pressable>
        <FollowButton following={following} onPress={onToggleFollow} compact />
      </View>

      <Pressable onPress={onOpenRecipe} style={({ pressed }) => [styles.imageWrap, pressed && styles.pressed]}>
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
        <View style={styles.imageOverlay}>
          {post.commercialBadges.slice(0, 2).map((badge) => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
      </Pressable>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{post.description}</Text>

        <View style={styles.metaGrid}>
          <Meta icon="time-outline" label={`${post.totalTime} dk`} />
          <Meta icon="speedometer-outline" label={post.difficulty} />
          <Meta icon="people-outline" label={`${post.servings} kisilik`} />
          <Meta icon="bag-outline" label={`Market ₺${post.marketBasketPrice}`} />
        </View>

        {post.restaurantOrderAvailable ? (
          <View style={styles.restaurantLine}>
            <Ionicons name="restaurant-outline" size={15} color={theme.colors.primary} />
            <Text style={styles.restaurantText}>
              Hazir yemek: ₺{post.restaurantStartPrice ?? post.marketBasketPrice + 40}'den baslayan
            </Text>
          </View>
        ) : null}

        <View style={styles.socialRow}>
          <LikeButton count={stats.likes} active={liked} onPress={onToggleLike} />
          <TouchableOpacity onPress={onComment} activeOpacity={0.78} style={styles.commentButton}>
            <Ionicons name="chatbubble-outline" size={19} color={theme.colors.muted} />
            <Text style={styles.commentText}>{stats.commentsCount.toLocaleString('tr-TR')}</Text>
          </TouchableOpacity>
          <SaveButton count={stats.saves} active={saved} onPress={onToggleSave} />
          <ShareButton onPress={onShare} />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={onAddMarket} activeOpacity={0.86} style={styles.primaryAction}>
            <Ionicons name="basket-outline" size={17} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Malzemeleri Al</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOrderReadyMeal} activeOpacity={0.86} style={styles.secondaryAction}>
            <Ionicons name="restaurant-outline" size={17} color={theme.colors.primary} />
            <Text style={styles.secondaryActionText}>Hazir Siparis Et</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={theme.colors.primary} />
      <Text style={styles.metaText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  authorRow: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  authorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorCopy: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  authorMeta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  imageWrap: {
    height: 244,
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255, 90, 0, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  body: {
    padding: 14,
    gap: 10,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    minHeight: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  restaurantLine: {
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  restaurantText: {
    flex: 1,
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentButton: {
    minHeight: 38,
    minWidth: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  commentText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 9,
  },
  primaryAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 10,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: theme.colors.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 10,
  },
  secondaryActionText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.84,
  },
});
