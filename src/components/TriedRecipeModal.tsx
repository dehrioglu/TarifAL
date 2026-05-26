import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type TriedRecipeModalProps = {
  visible: boolean;
  recipeTitle: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
};

export function TriedRecipeModal({ visible, recipeTitle, onClose, onSubmit }: TriedRecipeModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, comment.trim() || `${recipeTitle} tarifini denedim, sonuç çok iyi oldu.`);
    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.icon}>
              <Ionicons name="camera-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Bu tarifi denedin mi?</Text>
              <Text style={styles.subtitle}>{recipeTitle} deneyimini toplulukla paylaş.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.close}>
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)} style={styles.starButton}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={27}
                  color={theme.colors.primary}
                />
              </Pressable>
            ))}
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Kısa yorum yaz..."
            placeholderTextColor={theme.colors.subtle}
            multiline
            style={styles.input}
          />

          <View style={styles.photoPlaceholder}>
            <Ionicons name="image-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.photoText}>Fotoğraf ekleme alanı demo placeholder</Text>
          </View>

          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.86} style={styles.submit}>
            <Text style={styles.submitText}>Deneyimimi Paylaş</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.44)',
    padding: 22,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...theme.shadow,
    shadowOpacity: 0.16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stars: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  input: {
    marginTop: 14,
    minHeight: 92,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlignVertical: 'top',
  },
  photoPlaceholder: {
    marginTop: 12,
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FFD1B8',
    backgroundColor: '#FFF8F4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  submit: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
