import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CollectionCard } from '../CollectionCard';
import { theme } from '../../constants/theme';
import { SocialCollection } from '../../types';

type ProfileCollectionShowcaseProps = {
  collections: SocialCollection[];
  savedIds?: Record<string, boolean>;
  onOpenCollection: (collectionId: string) => void;
  onOpenAll?: () => void;
};

export function ProfileCollectionShowcase({
  collections,
  savedIds,
  onOpenCollection,
  onOpenAll,
}: ProfileCollectionShowcaseProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Koleksiyon vitrini</Text>
          <Text style={styles.subtitle}>Kaydettiğin tarifleri sofrana göre düzenle.</Text>
        </View>
        {onOpenAll ? (
          <TouchableOpacity onPress={onOpenAll} activeOpacity={0.84} style={styles.allButton}>
            <Text style={styles.allText}>Tümü</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {collections.map((collection) => (
          <View key={collection.id}>
            <CollectionCard
              collection={collection}
              onPress={() => onOpenCollection(collection.id)}
            />
            {savedIds?.[collection.id] ? (
              <View style={styles.savedBadge}>
                <Ionicons name="bookmark" size={11} color={theme.colors.primary} />
                <Text style={styles.savedText}>Kaydedildi</Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 11,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  allButton: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  allText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  row: {
    gap: 10,
    paddingBottom: 2,
  },
  savedBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    minHeight: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
});
