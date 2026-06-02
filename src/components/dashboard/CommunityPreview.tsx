import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { SocialRecipePost, SocialUser } from '../../types';
import { UserAvatar } from '../UserAvatar';

type CommunityPreviewItem = {
  post: SocialRecipePost;
  author: SocialUser;
};

type CommunityPreviewProps = {
  items: CommunityPreviewItem[];
  onOpenPost: (post: SocialRecipePost) => void;
  onOpenExplore: () => void;
};

export function CommunityPreview({
  items,
  onOpenPost,
  onOpenExplore,
}: CommunityPreviewProps) {
  return (
    <View>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.title}>Toplulukta bugün</Text>
          <Text style={styles.subtitle}>Şeflerden ve TarifAL Bot’tan yeni fikirler.</Text>
        </View>
        <TouchableOpacity onPress={onOpenExplore} activeOpacity={0.82} style={styles.seeAll}>
          <Text style={styles.seeAllText}>Tümünü gör</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map(({ post, author }) => (
          <TouchableOpacity
            key={post.id}
            onPress={() => onOpenPost(post)}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`${author.name}: ${post.title}`}
            style={styles.card}
          >
            <Image source={{ uri: post.imageUrl }} style={styles.image} />
            <View style={styles.copy}>
              <View style={styles.authorRow}>
                <UserAvatar uri={author.avatarUrl} name={author.name} size={27} />
                <View style={styles.authorCopy}>
                  <Text style={styles.author} numberOfLines={1}>{author.name}</Text>
                  <Text style={styles.level} numberOfLines={1}>{author.level}</Text>
                </View>
                {author.isVerified ? (
                  <Ionicons name="checkmark-circle" size={15} color={theme.colors.primary} />
                ) : null}
              </View>
              <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="heart-outline" size={13} color={theme.colors.primary} />
                <Text style={styles.meta}>{post.likes}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.meta}>{post.totalTime} dk</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  row: {
    gap: 11,
    paddingTop: 12,
    paddingRight: 4,
  },
  card: {
    width: 212,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 108,
  },
  copy: {
    padding: 11,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  authorCopy: {
    flex: 1,
  },
  author: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  level: {
    marginTop: 2,
    color: theme.colors.muted,
    fontSize: 9,
    fontWeight: '700',
  },
  postTitle: {
    marginTop: 9,
    minHeight: 34,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  metaDot: {
    color: theme.colors.subtle,
    fontSize: 10,
  },
});
