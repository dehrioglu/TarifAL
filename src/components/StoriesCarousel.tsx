import { useState } from 'react';
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { SocialStory, SocialUser } from '../types';
import { UserAvatar } from './UserAvatar';

type StoriesCarouselProps = {
  stories: SocialStory[];
  usersById: Record<string, SocialUser>;
  onOpenRecipe: (recipeId: string) => void;
  onAddToCart: (recipeId: string) => void;
};

export function StoriesCarousel({
  stories,
  usersById,
  onOpenRecipe,
  onAddToCart,
}: StoriesCarouselProps) {
  const [selectedStory, setSelectedStory] = useState<SocialStory | null>(null);
  const selectedUser = selectedStory ? usersById[selectedStory.authorId] : undefined;

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {stories.map((story) => {
          const user = usersById[story.authorId];

          if (!user) {
            return null;
          }

          return (
            <TouchableOpacity
              key={story.id}
              onPress={() => setSelectedStory(story)}
              activeOpacity={0.84}
              style={styles.storyItem}
            >
              <View style={styles.ring}>
                <UserAvatar uri={user.avatarUrl} name={user.name} size={58} />
              </View>
              <Text style={styles.storyName} numberOfLines={1}>
                {user.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={Boolean(selectedStory)} transparent animationType="fade" onRequestClose={() => setSelectedStory(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedStory && selectedUser ? (
              <ImageBackground
                source={{ uri: selectedStory.imageUrl }}
                style={styles.storyPreview}
                imageStyle={styles.storyImage}
              >
                <View style={styles.storyOverlay} />
                <View style={styles.modalHeader}>
                  <View style={styles.modalUser}>
                    <UserAvatar uri={selectedUser.avatarUrl} name={selectedUser.name} size={38} />
                    <View style={styles.modalUserCopy}>
                      <Text style={styles.modalName}>{selectedUser.name}</Text>
                      <Text style={styles.modalTime}>{selectedStory.createdAt}</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => setSelectedStory(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Kapat"
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={20} color={theme.colors.text} />
                  </Pressable>
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>TarifAL Hikaye</Text>
                  <Text style={styles.modalText}>{selectedStory.text}</Text>
                </View>
              </ImageBackground>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  if (selectedStory?.recipeId) {
                    onOpenRecipe(selectedStory.recipeId);
                  }
                  setSelectedStory(null);
                }}
                activeOpacity={0.86}
                style={styles.primaryAction}
              >
                <Text style={styles.primaryActionText}>Tarifi Gör</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (selectedStory?.recipeId) {
                    onAddToCart(selectedStory.recipeId);
                  }
                  setSelectedStory(null);
                }}
                activeOpacity={0.86}
                style={styles.softAction}
              >
                <Text style={styles.softActionText}>Sepete Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
    paddingVertical: 12,
  },
  storyItem: {
    width: 74,
    alignItems: 'center',
    gap: 6,
  },
  ring: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyName: {
    width: '100%',
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.58)',
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...theme.shadow,
    shadowOpacity: 0.18,
  },
  storyPreview: {
    minHeight: 430,
    justifyContent: 'space-between',
  },
  storyImage: {
    resizeMode: 'cover',
  },
  storyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.28)',
  },
  modalHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalUserCopy: {
    flex: 1,
  },
  modalName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  modalTime: {
    marginTop: 2,
    color: '#F2F4F7',
    fontSize: 11,
    fontWeight: '800',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 18,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  modalText: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
  },
  modalActions: {
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  softAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  softActionText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
});
