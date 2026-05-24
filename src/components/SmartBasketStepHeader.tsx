import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type SmartBasketStepHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  onClose?: () => void;
};

export function SmartBasketStepHeader({
  eyebrow,
  title,
  description,
  step,
  totalSteps,
  onBack,
  onClose,
}: SmartBasketStepHeaderProps) {
  const progress = `${Math.round((step / totalSteps) * 100)}%` as `${number}%`;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onBack ?? onClose}
          activeOpacity={0.85}
          style={[styles.iconButton, !onBack && !onClose && styles.hiddenButton]}
          disabled={!onBack && !onClose}
        >
          <Ionicons name={onBack ? 'chevron-back' : 'close'} size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.stepPill}>
          <Text style={styles.stepText}>{step}/{totalSteps}</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.85}
          style={[styles.iconButton, !onClose && styles.hiddenButton]}
          disabled={!onClose}
        >
          <Ionicons name="close" size={21} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progress }]} />
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenButton: {
    opacity: 0,
  },
  stepPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stepText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  progressTrack: {
    height: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFE6D8',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  eyebrow: {
    marginTop: 4,
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    color: theme.colors.text,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
});
