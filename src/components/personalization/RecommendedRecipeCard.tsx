import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { SocialFeedPost } from '../../types';

type RecommendedRecipeCardProps = {
  post: SocialFeedPost;
  onPress: () => void;
};

export function RecommendedRecipeCard({ post, onPress }: RecommendedRecipeCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.86} style={styles.card}>
      {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.image} /> : null}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
        <View style={styles.meta}>
          <Ionicons name="heart" size={13} color={theme.colors.primary} />
          <Text style={styles.metaText}>{post.likes.toLocaleString('tr-TR')}</Text>
          {post.totalTime ? <Text style={styles.metaText}>· {post.totalTime} dk</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 178,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 108,
  },
  body: {
    padding: 11,
    gap: 8,
  },
  title: {
    minHeight: 36,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
});
