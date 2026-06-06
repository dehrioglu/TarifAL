import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { useFeedback } from '../feedback/FeedbackProvider';
import { submitFeedback } from '../services/feedbackService';
import { trackEvent } from '../services/analyticsService';
import { useAppStore } from '../store/useAppStore';
import { FeedbackType } from '../types';
import { AppButton } from './AppButton';

type FeedbackPromptButtonProps = {
  screenName: string;
  compact?: boolean;
};

const feedbackOptions: Array<{ type: FeedbackType; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { type: 'liked', label: 'Beğendim', icon: 'heart-outline' },
  { type: 'confusing', label: 'Anlamadım', icon: 'help-circle-outline' },
  { type: 'bug', label: 'Hata gördüm', icon: 'bug-outline' },
  { type: 'missing_feature', label: 'Eksik özellik var', icon: 'construct-outline' },
  { type: 'idea', label: 'Fikir önerim var', icon: 'bulb-outline' },
];

export function FeedbackPromptButton({ screenName, compact = false }: FeedbackPromptButtonProps) {
  const user = useAppStore((store) => store.user);
  const profile = useAppStore((store) => store.profile);
  const accountMode = useAppStore((store) => store.accountMode);
  const { showToast } = useFeedback();
  const [visible, setVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType>('liked');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const isBetaTester = Boolean(profile?.isBetaTester || user?.isBetaTester);

  const selectedLabel = useMemo(
    () => feedbackOptions.find((option) => option.type === selectedType)?.label ?? 'Geri bildirim',
    [selectedType],
  );

  const close = () => {
    if (!submitting) {
      setVisible(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      await submitFeedback({
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
        screenName,
        feedbackType: selectedType,
        message,
        rating,
        isBetaTester,
        isDemoMode: accountMode === 'demo',
      });
      void trackEvent('feedback_submitted', {
        userId: user?.id,
        userEmail: user?.email,
        sourceScreen: screenName,
        isDemoMode: accountMode === 'demo',
        extraData: {
          feedbackType: selectedType,
          rating,
          isBetaTester,
        },
      });
      setVisible(false);
      setMessage('');
      setRating(5);
      setSelectedType('liked');
      showToast('Teşekkürler, geri bildirimin alındı.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Geri bildirimin gönderilemedi. Daha sonra tekrar deneyebilirsin.', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${screenName} için geri bildirim ver`}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.feedbackButton,
          compact && styles.compactButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={compact ? 16 : 18} color={theme.colors.primary} />
        <Text style={[styles.feedbackButtonText, compact && styles.compactText]}>Geri bildirim</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.modalCopy}>
                <Text style={styles.modalTitle}>Kısa geri bildirim</Text>
                <Text style={styles.modalSubtitle}>
                  Notun ürün ekibine ulaşır ve beta iyileştirmelerinde değerlendirilir.
                </Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Geri bildirim modalını kapat" onPress={close} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.optionGrid}>
              {feedbackOptions.map((option) => {
                const active = option.type === selectedType;
                return (
                  <Pressable
                    key={option.type}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    onPress={() => setSelectedType(option.type)}
                    style={[styles.optionChip, active && styles.activeOptionChip]}
                  >
                    <Ionicons name={option.icon} size={16} color={active ? '#FFFFFF' : theme.colors.primary} />
                    <Text style={[styles.optionText, active && styles.activeOptionText]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="İstersen kısa bir not yaz..."
              placeholderTextColor={theme.colors.subtle}
              multiline
              style={styles.textArea}
            />

            <View style={styles.ratingBlock}>
              <Text style={styles.ratingTitle}>Memnuniyet puanı</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityLabel={`${value} puan`}
                    onPress={() => setRating(value)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={value <= rating ? 'star' : 'star-outline'}
                      size={24}
                      color={value <= rating ? theme.colors.primary : theme.colors.subtle}
                    />
                  </Pressable>
                ))}
              </View>
              <Text style={styles.ratingHelper}>{selectedLabel} · {rating}/5</Text>
            </View>

            <AppButton
              title="Gönder"
              icon="send-outline"
              onPress={handleSubmit}
              loading={submitting}
              style={styles.submitButton}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  feedbackButton: {
    minHeight: 40,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    alignSelf: 'flex-start',
  },
  compactButton: {
    minHeight: 34,
    paddingHorizontal: 11,
  },
  pressed: {
    opacity: 0.72,
  },
  feedbackButtonText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  compactText: {
    fontSize: 11,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.42)',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 14,
    ...theme.shadow,
  },
  modalHeader: {
    flexDirection: 'row',
    gap: 10,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCopy: {
    flex: 1,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  modalSubtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    minHeight: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeOptionChip: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  activeOptionText: {
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 92,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: 13,
    textAlignVertical: 'top',
    fontSize: 13,
    fontWeight: '700',
  },
  ratingBlock: {
    borderRadius: 18,
    backgroundColor: '#FFF8F4',
    padding: 12,
    gap: 8,
  },
  ratingTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingHelper: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  submitButton: {
    minHeight: 50,
  },
});
