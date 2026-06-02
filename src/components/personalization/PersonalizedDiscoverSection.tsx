import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { TasteCategory, tasteCategoryLabels } from '../../personalization/tasteProfileStore';
import { SocialFeedPost } from '../../types';
import { RecommendedRecipeCard } from './RecommendedRecipeCard';

type PersonalizedDiscoverSectionProps = {
  primaryInterest: TasteCategory;
  posts: SocialFeedPost[];
  onOpenPost: (post: SocialFeedPost) => void;
};

const subtitleByTaste: Partial<Record<TasteCategory, string>> = {
  tatli: 'Son etkileşimlerine göre tatlı tarifleri ilgini çekiyor.',
  fit: 'Kaydettiğin ve beğendiğin tariflere göre sağlıklı seçenekler öne çıktı.',
  ekonomik: 'Bütçe dostu tariflere ilgin arttığı için uygun sepetleri öne aldık.',
  geleneksel: 'Usta işi ve ev yemeği tariflerini daha sık incelediğini fark ettik.',
};

export function PersonalizedDiscoverSection({
  primaryInterest,
  posts,
  onOpenPost,
}: PersonalizedDiscoverSectionProps) {
  const label = tasteCategoryLabels[primaryInterest];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="sparkles" size={19} color={theme.colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>TarifAL Bot seçti</Text>
          <Text style={styles.title}>Sana Özel {label} Tarifleri</Text>
          <Text style={styles.subtitle}>
            {subtitleByTaste[primaryInterest] ?? 'Son etkileşimlerine göre sana daha yakın tarifleri öne aldık.'}
          </Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {posts.slice(0, 5).map((post) => (
          <RecommendedRecipeCard key={post.id} post={post} onPress={() => onOpenPost(post)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    paddingVertical: 15,
    gap: 13,
  },
  header: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  row: {
    gap: 10,
    paddingHorizontal: 15,
  },
});
