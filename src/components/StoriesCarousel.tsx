import { useMemo, useState } from 'react';
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
  const selectedIndex = useMemo(
    () => stories.findIndex((story) => story.id === selectedStory?.id),
    [selectedStory?.id, stories],
  );

  return (
    <>
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={styles.panelCopy}>
            <Text style={styles.panelTitle}>Şeflerden hikayeler</Text>
            <Text style={styles.panelSubtitle}>Kısa öneriler, püf noktaları ve sepet fikirleri.</Text>
          </View>
          <View style={styles.liveBadge}>
            <Ionicons name="sparkles" size={13} color={theme.colors.primary} />
            <Text style={styles.liveBadgeText}>{stories.length} yeni</Text>
          </View>
        </View>

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
                accessibilityRole="button"
                accessibilityLabel={`${user.name} hikayesini aç`}
              >
                <View style={styles.ring}>
                  <View style={styles.avatarShell}>
                    <UserAvatar uri={user.avatarUrl} name={user.name} size={56} />
                  </View>
                  {user.isVerified ? (
                    <View style={styles.verifiedDot}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  ) : null}
                </View>
                <Text style={styles.storyName} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={styles.storyLevel} numberOfLines={1}>
                  {user.level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Modal visible={Boolean(selectedStory)} transparent animationType="fade" onRequestClose={() => setSelectedStory(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedStory && selectedUser ? (
              <ImageBackground source={{ uri: selectedStory.imageUrl }} style={styles.storyPreview} imageStyle={styles.storyImage}>
                <View style={styles.storyOverlay} />
                <View style={styles.progressRow}>
                  {stories.slice(0, 6).map((story, index) => (
                    <View
                      key={story.id}
                      style={[styles.progressTrack, index <= selectedIndex && styles.progressTrackActive]}
                    />
                  ))}
                </View>

                <View style={styles.modalHeader}>
                  <View style={styles.modalUser}>
                    <UserAvatar uri={selectedUser.avatarUrl} name={selectedUser.name} size={38} />
                    <View style={styles.modalUserCopy}>
                      <View style={styles.modalNameRow}>
                        <Text style={styles.modalName}>{selectedUser.name}</Text>
                        {selectedUser.isVerified ? <Ionicons name="checkmark-circle" size={15} color="#FFFFFF" /> : null}
                      </View>
                      <Text style={styles.modalTime}>
                        {selectedUser.level} • {selectedStory.createdAt}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => setSelectedStory(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Kapat"
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={22} color={theme.colors.text} />
                  </Pressable>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalBadge}>
                    <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
                    <Text style={styles.modalBadgeText}>Topluluk önerisi</Text>
                  </View>
                  <Text style={styles.modalTitle}>{getStoryTitle(selectedUser)}</Text>
                  <Text style={styles.modalText}>{selectedStory.text}</Text>
                  <View style={styles.insightRow}>
                    <View style={styles.insightPill}>
                      <Ionicons name="time-outline" size={15} color="#FFFFFF" />
                      <Text style={styles.insightText}>Hızlı fikir</Text>
                    </View>
                    <View style={styles.insightPill}>
                      <Ionicons name="basket-outline" size={15} color="#FFFFFF" />
                      <Text style={styles.insightText}>Sepete uygun</Text>
                    </View>
                  </View>
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
                <Ionicons name="restaurant-outline" size={17} color="#FFFFFF" />
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
                <Ionicons name="basket-outline" size={17} color={theme.colors.primary} />
                <Text style={styles.softActionText}>Sepete Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function getStoryTitle(user: SocialUser) {
  return user.level ? `${user.level} önerisi` : 'TarifAL hikayesi';
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 16,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  panelCopy: {
    flex: 1,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  panelSubtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  liveBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  row: {
    gap: 14,
    paddingTop: 14,
    paddingBottom: 2,
  },
  storyItem: {
    width: 76,
    alignItems: 'center',
    gap: 5,
  },
  ring: {
    width: 68,
    height: 68,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: '#FFF3EC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarShell: {
    width: 60,
    height: 60,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  verifiedDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: theme.colors.primary,
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
  storyLevel: {
    width: '100%',
    color: theme.colors.subtle,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.62)',
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
    minHeight: 500,
    justifyContent: 'space-between',
  },
  storyImage: {
    resizeMode: 'cover',
  },
  storyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.32)',
  },
  progressRow: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 5,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  progressTrackActive: {
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 14,
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
  modalNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 18,
  },
  modalBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  modalTitle: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
  },
  modalText: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
  },
  insightRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  insightPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  modalActions: {
    padding: 16,
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  softActionText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
});
