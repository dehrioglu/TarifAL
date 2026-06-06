import { useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { SocialFeedPost } from '../../types';

type DiscoverRecipeRailProps = {
  title: string;
  subtitle: string;
  posts: SocialFeedPost[];
  accent?: string;
  onOpenPost: (post: SocialFeedPost) => void;
};

export function DiscoverRecipeRail({
  title,
  subtitle,
  posts,
  accent,
  onOpenPost,
}: DiscoverRecipeRailProps) {
  const [startIndex, setStartIndex] = useState(0);
  const postCycleCount = Math.min(posts.length, 8);
  const visiblePosts = useMemo(() => {
    const uniquePosts = posts.slice(0, 8);

    return [...uniquePosts.slice(startIndex), ...uniquePosts.slice(0, startIndex)].slice(0, 4);
  }, [posts, startIndex]);

  const showNextPosts = () => {
    setStartIndex((current) => (postCycleCount > 0 ? (current + 1) % postCycleCount : 0));
  };

  if (posts.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity
          onPress={showNextPosts}
          activeOpacity={0.82}
          style={styles.headerAction}
          accessibilityRole="button"
          accessibilityLabel={`${title} vitrininin sonraki tariflerini göster`}
        >
          <Text style={styles.headerActionText}>Sonraki</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {visiblePosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            onPress={() => onOpenPost(post)}
            activeOpacity={0.84}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel={`${post.title} tarifini aç`}
          >
            <ImageBackground source={{ uri: post.imageUrl }} style={styles.image} imageStyle={styles.imageStyle}>
              <View style={styles.overlay} />
              <View style={[styles.badge, accent ? { backgroundColor: accent } : undefined]}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {getBadgeLabel(post)}
                </Text>
              </View>
            </ImageBackground>
            <View style={styles.body}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {post.title}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Ionicons name="time-outline" size={12} color={theme.colors.muted} />
                  <Text style={styles.meta}>{post.totalTime ?? post.prepTime ?? 0} dk</Text>
                </View>
                <View style={styles.metaPill}>
                  <Ionicons name="basket-outline" size={12} color={theme.colors.primary} />
                  <Text style={styles.price}>₺{post.marketBasketPrice ?? 0}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function getBadgeLabel(post: SocialFeedPost) {
  if (post.restaurantOrderAvailable) {
    return 'Hazır sipariş';
  }

  return post.tags[0] ?? 'TarifAL seçimi';
}

const styles = StyleSheet.create({
  section: {
    marginTop: 22,
    gap: 11,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  headerAction: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerActionText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  row: {
    gap: 10,
    paddingBottom: 4,
    paddingRight: 2,
  },
  card: {
    width: 178,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...theme.shadow,
    shadowOpacity: 0.06,
  },
  image: {
    height: 116,
    padding: 10,
    justifyContent: 'flex-start',
  },
  imageStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.1)',
  },
  badge: {
    maxWidth: '92%',
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  body: {
    minHeight: 88,
    padding: 11,
    justifyContent: 'space-between',
    gap: 9,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaPill: {
    minHeight: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  price: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
});
