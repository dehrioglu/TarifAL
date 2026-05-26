import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { SocialCollection } from '../types';
import { CollectionCard } from './CollectionCard';

type CollectionGridProps = {
  collections: SocialCollection[];
  savedIds: Record<string, boolean>;
  onOpen: (collectionId: string) => void;
  onToggleSave: (collectionId: string) => void;
};

export function CollectionGrid({ collections, savedIds, onOpen, onToggleSave }: CollectionGridProps) {
  return (
    <View style={styles.grid}>
      {collections.map((collection) => (
        <View key={collection.id} style={styles.item}>
          <CollectionCard collection={collection} onPress={() => onOpen(collection.id)} />
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {collection.recipeIds.length} tarif • {(collection.saves ?? 0).toLocaleString('tr-TR')} kaydetme
            </Text>
            <TouchableOpacity
              onPress={() => onToggleSave(collection.id)}
              activeOpacity={0.84}
              style={[styles.saveButton, savedIds[collection.id] && styles.savedButton]}
            >
              <Text style={[styles.saveText, savedIds[collection.id] && styles.savedText]}>
                {savedIds[collection.id] ? 'Kaydedildi' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 14,
  },
  item: {
    width: '100%',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  saveButton: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  savedButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  saveText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  savedText: {
    color: '#FFFFFF',
  },
});
