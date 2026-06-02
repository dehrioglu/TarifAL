import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { formatFollowerCount } from '../data/mockSocial';
import { SocialFeedPost, SocialPostStats, SocialUser } from '../types';
import { FollowButton } from './FollowButton';
import { LikeButton, SaveButton, ShareButton } from './SocialActionButtons';
import { UserAvatar } from './UserAvatar';

type SocialPostCardProps = {
  post: SocialFeedPost;
  author: SocialUser;
  stats: SocialPostStats;
  liked: boolean;
  saved: boolean;
  following: boolean;
  selectedPollOptionId?: string;
  pollVotes?: Record<string, number>;
  joinedChallenge?: boolean;
  onOpenRecipe: () => void;
  onOpenProfile: () => void;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onToggleFollow: () => void;
  onAddMarket: () => void;
  onOrderReadyMeal: () => void;
  onComment: () => void;
  onShare: () => void;
  onTagPress?: (tag: string) => void;
  onVotePoll: (optionId: string) => void;
  onToggleChallenge: () => void;
  onTried: () => void;
};

const postTypeLabels: Record<SocialFeedPost['type'], string> = {
  recipe: 'Tarif Postu',
  note: 'Usta Notu',
  basket: 'Sepet Tavsiyesi',
  restaurant: 'Restoran Önerisi',
  poll: 'Anket',
  challenge: 'Challenge',
  tried: 'Tarifi Denedim',
};

export function SocialPostCard({
  post,
  author,
  stats,
  liked,
  saved,
  following,
  selectedPollOptionId,
  pollVotes,
  joinedChallenge,
  onOpenRecipe,
  onOpenProfile,
  onToggleLike,
  onToggleSave,
  onToggleFollow,
  onAddMarket,
  onOrderReadyMeal,
  onComment,
  onShare,
  onTagPress,
  onVotePoll,
  onToggleChallenge,
  onTried,
}: SocialPostCardProps) {
  const totalPollVotes = post.pollOptions?.reduce(
    (sum, option) => sum + (pollVotes?.[option.id] ?? option.votes),
    0,
  ) ?? 0;

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
              {author.level} · {formatFollowerCount(author.followers)} takipçi · {post.createdAt}
            </Text>
          </View>
        </Pressable>
        <FollowButton following={following} onPress={onToggleFollow} compact />
      </View>

      <View style={styles.typeRow}>
        <View style={styles.typeBadge}>
          <Ionicons name={post.type === 'recipe' ? 'restaurant-outline' : 'sparkles-outline'} size={13} color={theme.colors.primary} />
          <Text style={styles.typeText}>{postTypeLabels[post.type]}</Text>
        </View>
        {post.commercialBadges?.slice(0, 2).map((badge) => (
          <View key={badge} style={styles.commercialBadge}>
            <Text style={styles.commercialBadgeText}>{badge}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={post.recipeId ? onOpenRecipe : onComment}
        style={({ pressed }) => [styles.imageWrap, pressed && styles.pressed]}
      >
        {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.image} /> : null}
        <View style={styles.imageShade} />
        <View style={styles.imageCopy}>
          <Text style={styles.imageTitle} numberOfLines={2}>{post.title}</Text>
          <Text style={styles.imageText} numberOfLines={3}>{post.text}</Text>
        </View>
      </Pressable>

      <View style={styles.body}>
        <View style={styles.tags}>
          {post.tags.slice(0, 4).map((tag) => (
            <TouchableOpacity key={tag} onPress={() => onTagPress?.(tag)} activeOpacity={0.8}>
              <Text style={styles.tag}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {post.type === 'poll' && post.pollOptions ? (
          <View style={styles.pollBox}>
            {post.pollOptions.map((option) => {
              const votes = pollVotes?.[option.id] ?? option.votes;
              const percent = totalPollVotes > 0 ? Math.round((votes / totalPollVotes) * 100) : 0;
              const selected = selectedPollOptionId === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => onVotePoll(option.id)}
                  activeOpacity={0.86}
                  style={[styles.pollOption, selected && styles.pollOptionSelected]}
                >
                  <View style={[styles.pollFill, { width: `${percent}%` }]} />
                  <Text style={[styles.pollLabel, selected && styles.pollLabelSelected]}>{option.label}</Text>
                  <Text style={[styles.pollPercent, selected && styles.pollLabelSelected]}>%{percent}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {post.type === 'challenge' && post.challengeData ? (
          <View style={styles.challengeBox}>
            <Text style={styles.challengeTitle}>{post.challengeData.title}</Text>
            <Text style={styles.challengeText}>{post.challengeData.description}</Text>
            <View style={styles.challengeMeta}>
              <Text style={styles.challengeMetaText}>
                {post.challengeData.participants.toLocaleString('tr-TR')} katılımcı
              </Text>
              <Text style={styles.challengeMetaText}>{post.challengeData.reward}</Text>
            </View>
            <TouchableOpacity
              onPress={onToggleChallenge}
              activeOpacity={0.86}
              style={[styles.challengeButton, joinedChallenge && styles.challengeJoined]}
            >
              <Text style={[styles.challengeButtonText, joinedChallenge && styles.challengeJoinedText]}>
                {joinedChallenge ? 'Katıldın' : 'Katıl'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.metaGrid}>
          {post.totalTime ? <Meta icon="time-outline" label={`${post.totalTime} dk`} /> : null}
          {post.difficulty ? <Meta icon="speedometer-outline" label={post.difficulty} /> : null}
          {post.servings ? <Meta icon="people-outline" label={`${post.servings} kişilik`} /> : null}
          {post.marketBasketPrice ? <Meta icon="bag-outline" label={`Sepet ₺${post.marketBasketPrice}`} /> : null}
          {post.restaurantStartPrice ? <Meta icon="restaurant-outline" label={`Hazır ₺${post.restaurantStartPrice}+`} /> : null}
        </View>

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
            <Text style={styles.secondaryActionText}>Hazır Sipariş Et</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onTried} activeOpacity={0.86} style={styles.triedButton}>
          <Ionicons name="camera-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.triedText}>Denedim</Text>
        </TouchableOpacity>
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
  typeRow: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  typeBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  commercialBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  commercialBadgeText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  imageWrap: {
    height: 264,
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.16)',
  },
  imageCopy: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
  },
  imageTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
  },
  imageText: {
    marginTop: 7,
    color: '#F8FAFC',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  body: {
    padding: 14,
    gap: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  tag: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  pollBox: {
    gap: 8,
  },
  pollOption: {
    minHeight: 42,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pollOptionSelected: {
    borderColor: theme.colors.primary,
  },
  pollFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFE0CF',
  },
  pollLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  pollPercent: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  pollLabelSelected: {
    color: theme.colors.primary,
  },
  challengeBox: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 13,
    gap: 8,
  },
  challengeTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  challengeText: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  challengeMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  challengeMetaText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  challengeButton: {
    minHeight: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeJoined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  challengeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  challengeJoinedText: {
    color: theme.colors.primary,
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
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  triedButton: {
    minHeight: 42,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  triedText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.84,
  },
});
