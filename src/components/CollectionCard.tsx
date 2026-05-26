import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { SocialCollection } from '../types';

type CollectionCardProps = {
  collection: SocialCollection;
  onPress?: () => void;
};

export function CollectionCard({ collection, onPress }: CollectionCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <ImageBackground
        source={{ uri: collection.coverImageUrl }}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Ionicons name="albums-outline" size={19} color="#FFFFFF" />
          <Text style={styles.title}>{collection.title}</Text>
          <Text style={styles.text} numberOfLines={2}>{collection.description}</Text>
          <Text style={styles.count}>
            {collection.recipeIds.length} tarif • {(collection.saves ?? 0).toLocaleString('tr-TR')} kaydetme
          </Text>
          <View style={styles.openButton}>
            <Text style={styles.openButtonText}>Koleksiyonu Aç</Text>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 210,
    height: 150,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 22,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.36)',
  },
  content: {
    padding: 14,
    gap: 5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  text: {
    color: '#F2F4F7',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  count: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  openButton: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  openButtonText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.8,
  },
});
