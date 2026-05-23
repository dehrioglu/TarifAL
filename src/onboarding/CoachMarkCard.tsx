import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { TourStep } from './types';

type CoachCardPosition = {
  left: number;
  top: number;
  width: number;
};

type CoachMarkCardProps = {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  position: CoachCardPosition;
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
};

export function CoachMarkCard({
  step,
  stepIndex,
  totalSteps,
  position,
  isFirst,
  isLast,
  onBack,
  onNext,
  onSkip,
}: CoachMarkCardProps) {
  const entry = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entry.setValue(0);
    Animated.timing(entry, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [entry, step.id]);

  const translateY = entry.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          left: position.left,
          top: position.top,
          width: position.width,
          opacity: entry,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.modeText}>TarifAL Keşif Modu</Text>
          <Text style={styles.stepText}>
            {stepIndex + 1}/{totalSteps}
          </Text>
        </View>
        <Pressable onPress={onSkip} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
          <Text style={styles.skipText}>Atla</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>{step.title}</Text>
      <Text style={styles.description}>{step.description}</Text>
      {isLast && step.finalMessage ? (
        <View style={styles.finalBox}>
          <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
          <Text style={styles.finalText}>{step.finalMessage}</Text>
        </View>
      ) : null}

      <View style={styles.progressRow}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={`tour-dot-${index}`}
            style={[
              styles.dot,
              index <= stepIndex && styles.activeDot,
              index === stepIndex && styles.currentDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onBack}
          disabled={isFirst}
          style={({ pressed }) => [
            styles.backButton,
            isFirst && styles.disabledButton,
            pressed && !isFirst && styles.pressed,
          ]}
        >
          <Ionicons name="chevron-back" size={17} color={isFirst ? theme.colors.subtle : theme.colors.text} />
          <Text style={[styles.backText, isFirst && styles.disabledText]}>Geri</Text>
        </Pressable>
        <Pressable onPress={onNext} style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}>
          <Text style={styles.nextText}>{isLast ? 'Tamamla' : 'İleri'}</Text>
          <Ionicons name={isLast ? 'checkmark' : 'chevron-forward'} size={17} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.76)',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    padding: 18,
    shadowColor: '#0B1020',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  modeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 2,
  },
  skipButton: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 24,
  },
  description: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  finalBox: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finalText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  progressRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#EAECF0',
  },
  activeDot: {
    backgroundColor: '#FFD0B8',
  },
  currentDot: {
    backgroundColor: theme.colors.primary,
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    minHeight: 44,
    minWidth: 96,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  nextButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    ...theme.orangeShadow,
    shadowOpacity: 0.14,
  },
  backText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.46,
  },
  disabledText: {
    color: theme.colors.subtle,
  },
  pressed: {
    opacity: 0.72,
  },
});
