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
  if (posts.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {posts.slice(0, 6).map((post) => (
          <TouchableOpacity
            key={post.id}
            onPress={() => onOpenPost(post)}
            activeOpacity={0.84}
            style={styles.card}
          >
            <ImageBackground
              source={{ uri: post.imageUrl }}
              style={styles.image}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay} />
              <View style={[styles.badge, accent ? { backgroundColor: accent } : undefined]}>
                <Text style={styles.badgeText}>
                  {post.restaurantOrderAvailable ? 'Hazır sipariş' : post.tags[0] ?? 'TarifAL seçimi'}
                </Text>
              </View>
            </ImageBackground>
            <View style={styles.body}>
              <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{post.totalTime ?? post.prepTime ?? 0} dk</Text>
                <Text style={styles.meta}>•</Text>
                <Text style={styles.price}>₺{post.marketBasketPrice ?? 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  row: {
    gap: 10,
    paddingBottom: 2,
  },
  card: {
    width: 174,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  image: {
    height: 114,
    padding: 9,
    justifyContent: 'flex-start',
  },
  imageStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.08)',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  body: {
    minHeight: 78,
    padding: 10,
    justifyContent: 'space-between',
    gap: 7,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  price: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
});
