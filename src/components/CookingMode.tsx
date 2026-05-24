import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { Recipe } from '../types';

type CookingModeProps = {
  recipe: Recipe;
  visible: boolean;
  onClose: () => void;
  onFinish?: () => void;
};

export function CookingMode({ recipe, visible, onClose, onFinish }: CookingModeProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [keepAwake, setKeepAwake] = useState(true);
  const [minutes, setMinutes] = useState(Math.max(1, Math.round(recipe.prepTime / Math.max(1, recipe.steps.length))));
  const step = recipe.steps[stepIndex];
  const isLastStep = stepIndex === recipe.steps.length - 1;

  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      setMinutes(Math.max(1, Math.round(recipe.prepTime / Math.max(1, recipe.steps.length))));
    }
  }, [recipe.id, recipe.prepTime, recipe.steps.length, visible]);

  const next = () => setStepIndex((value) => Math.min(recipe.steps.length - 1, value + 1));
  const previous = () => setStepIndex((value) => Math.max(0, value - 1));
  const finish = () => {
    onClose();
    onFinish?.();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Pişirme Modu</Text>
            <Text style={styles.title}>{recipe.title}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Pişirme modunu kapat"
            style={styles.close}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressText}>Adım {stepIndex + 1} / {recipe.steps.length}</Text>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${((stepIndex + 1) / recipe.steps.length) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>{stepIndex + 1}</Text>
          <Text style={styles.stepText}>{step?.text}</Text>
        </View>

        <View style={styles.timerCard}>
          <View>
            <Text style={styles.timerLabel}>Zamanlayıcı</Text>
            <Text style={styles.timerValue}>{minutes}:00</Text>
          </View>
          <View style={styles.timerActions}>
            <TouchableOpacity
              onPress={() => setMinutes((value) => Math.max(1, value - 1))}
              accessibilityRole="button"
              accessibilityLabel="Zamanlayıcıyı azalt"
              style={styles.timerButton}
            >
              <Ionicons name="remove" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMinutes((value) => value + 1)}
              accessibilityRole="button"
              accessibilityLabel="Zamanlayıcıyı artır"
              style={styles.timerButton}
            >
              <Ionicons name="add" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.keepAwake}>
          <View>
            <Text style={styles.keepTitle}>Ekran açık kalsın</Text>
            <Text style={styles.keepSubtitle}>Pişirirken adımlar kaybolmasın</Text>
          </View>
          <Switch
            value={keepAwake}
            onValueChange={setKeepAwake}
            trackColor={{ false: theme.colors.border, true: theme.colors.primarySoft }}
            thumbColor={keepAwake ? theme.colors.primary : '#FFFFFF'}
          />
        </View>

        <View style={styles.nav}>
          <TouchableOpacity
            onPress={previous}
            activeOpacity={0.85}
            disabled={stepIndex === 0}
            style={[styles.navButton, stepIndex === 0 && styles.disabledNav]}
          >
            <Text style={styles.navText}>Önceki Adım</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={isLastStep ? finish : next}
            activeOpacity={0.85}
            style={[styles.navButton, styles.nextButton]}
          >
            <Text style={[styles.navText, styles.nextText]}>{isLastStep ? 'Tarifi Bitir' : 'Sonraki Adım'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: theme.screen.padding,
    gap: 20,
  },
  header: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 25,
    fontWeight: '900',
  },
  close: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    gap: 8,
  },
  progressText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primarySoft,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  stepCard: {
    flex: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 24,
    justifyContent: 'center',
    gap: 18,
  },
  stepNumber: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
    fontWeight: '900',
  },
  stepText: {
    color: theme.colors.text,
    fontSize: 25,
    lineHeight: 36,
    fontWeight: '900',
  },
  timerCard: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primarySoft,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  timerValue: {
    marginTop: 3,
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  timerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  timerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepAwake: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  keepTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  keepSubtitle: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  nav: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
  },
  disabledNav: {
    opacity: 0.45,
  },
  navText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  nextText: {
    color: '#FFFFFF',
  },
});
