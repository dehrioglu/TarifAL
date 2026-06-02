import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import { Recipe } from '../types';

type CookingModeProps = {
  recipe: Recipe;
  visible: boolean;
  onClose: () => void;
  onFinish?: () => void;
  onAskChef?: () => void;
};

export function CookingMode({ recipe, visible, onClose, onFinish, onAskChef }: CookingModeProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [keepAwake, setKeepAwake] = useState(true);
  const stepCount = Math.max(1, recipe.steps.length);
  const perStepMinutes = Math.max(1, Math.round(recipe.prepTime / stepCount));
  const [minutes, setMinutes] = useState(perStepMinutes);
  const step = recipe.steps[stepIndex];
  const isLastStep = stepIndex === stepCount - 1;
  const progress = ((stepIndex + 1) / stepCount) * 100;
  const stepTip = useMemo(() => getStepTip(stepIndex, recipe.title), [recipe.title, stepIndex]);

  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      setMinutes(perStepMinutes);
    }
  }, [perStepMinutes, recipe.id, visible]);

  const next = () => {
    setStepIndex((value) => Math.min(stepCount - 1, value + 1));
    setMinutes(perStepMinutes);
  };
  const previous = () => {
    setStepIndex((value) => Math.max(0, value - 1));
    setMinutes(perStepMinutes);
  };
  const finish = () => {
    onClose();
    onFinish?.();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>TarifAL odak modu</Text>
            <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel="Pişirme modunu kapat"
            style={styles.close}
          >
            <Ionicons name="close" size={23} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <Text style={styles.progressTitle}>Adım {stepIndex + 1} / {stepCount}</Text>
              <Text style={styles.progressPercent}>%{Math.round(progress)}</Text>
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{stepIndex + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step?.text ?? 'Tarif adımı hazırlanıyor.'}</Text>
            <View style={styles.stepMeta}>
              <Ionicons name="time-outline" size={17} color={theme.colors.primary} />
              <Text style={styles.stepMetaText}>Yaklaşık {perStepMinutes} dakika</Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb-outline" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.tipCopy}>
              <Text style={styles.tipTitle}>AI Şef ipucu</Text>
              <Text style={styles.tipText}>{stepTip}</Text>
            </View>
          </View>

          <View style={styles.timerCard}>
            <View>
              <Text style={styles.timerLabel}>Adım zamanlayıcısı</Text>
              <Text style={styles.timerValue}>{minutes}:00</Text>
            </View>
            <View style={styles.timerActions}>
              <TimerButton icon="remove" label="Zamanlayıcıyı azalt" onPress={() => setMinutes((value) => Math.max(1, value - 1))} />
              <TimerButton icon="add" label="Zamanlayıcıyı artır" onPress={() => setMinutes((value) => value + 1)} />
            </View>
          </View>

          <View style={styles.keepAwake}>
            <View style={styles.keepCopy}>
              <Text style={styles.keepTitle}>Ekran açık kalsın</Text>
              <Text style={styles.keepSubtitle}>Pişirirken aktif adım ekranda görünmeye devam etsin.</Text>
            </View>
            <Switch
              value={keepAwake}
              onValueChange={setKeepAwake}
              trackColor={{ false: theme.colors.border, true: theme.colors.primarySoft }}
              thumbColor={keepAwake ? theme.colors.primary : '#FFFFFF'}
            />
          </View>

          <TouchableOpacity
            onPress={onAskChef}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel="AI Şef'e sor"
            style={styles.aiButton}
          >
            <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
            <View style={styles.aiButtonCopy}>
              <Text style={styles.aiButtonTitle}>AI Şef’e Sor</Text>
              <Text style={styles.aiButtonText}>Bu adım için alternatif veya püf noktası iste.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.nav}>
          <TouchableOpacity
            onPress={previous}
            activeOpacity={0.84}
            disabled={stepIndex === 0}
            accessibilityRole="button"
            accessibilityLabel="Önceki adım"
            style={[styles.navButton, stepIndex === 0 && styles.disabledNav]}
          >
            <Ionicons name="chevron-back" size={18} color={theme.colors.primary} />
            <Text style={styles.navText}>Önceki</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={isLastStep ? finish : next}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel={isLastStep ? 'Tarifi tamamladım' : 'Sonraki adım'}
            style={[styles.navButton, styles.nextButton]}
          >
            <Text style={[styles.navText, styles.nextText]}>
              {isLastStep ? 'Tarifi Tamamladım' : 'Sonraki Adım'}
            </Text>
            <Ionicons name={isLastStep ? 'checkmark-circle' : 'chevron-forward'} size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function TimerButton({
  icon,
  label,
  onPress,
}: {
  icon: 'add' | 'remove';
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.timerButton}
    >
      <Ionicons name={icon} size={18} color={theme.colors.primary} />
    </TouchableOpacity>
  );
}

const getStepTip = (stepIndex: number, recipeTitle: string) => {
  const tips = [
    `${recipeTitle} için malzemeleri tezgâhta sıralamak bu adımı hızlandırır.`,
    'Isıyı kontrollü yükselt; aroma için acele etmeden karıştır.',
    'Kıvamı kontrol ederken küçük bir tadım yapmayı unutma.',
    'Servisten önce bir dakika dinlendirmek lezzeti dengeler.',
  ];

  return tips[stepIndex % tips.length];
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFCFA',
  },
  header: {
    paddingHorizontal: theme.screen.padding,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
  },
  close: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: theme.screen.padding,
    paddingBottom: 20,
    gap: 12,
  },
  progressCard: {
    borderRadius: 20,
    backgroundColor: theme.colors.primarySoft,
    padding: 14,
    gap: 9,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  progressPercent: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD8C4',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  stepCard: {
    minHeight: 270,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 22,
    justifyContent: 'center',
    gap: 18,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  stepNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  stepText: {
    color: theme.colors.text,
    fontSize: 24,
    lineHeight: 35,
    fontWeight: '900',
  },
  stepMeta: {
    alignSelf: 'flex-start',
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stepMetaText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  tipCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 13,
    flexDirection: 'row',
    gap: 10,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCopy: {
    flex: 1,
  },
  tipTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  tipText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  timerCard: {
    borderRadius: 20,
    backgroundColor: theme.colors.primarySoft,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timerLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  timerValue: {
    marginTop: 3,
    color: theme.colors.primary,
    fontSize: 25,
    fontWeight: '900',
  },
  timerActions: {
    flexDirection: 'row',
    gap: 9,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  keepCopy: {
    flex: 1,
  },
  keepTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  keepSubtitle: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  aiButton: {
    minHeight: 62,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  aiButtonCopy: {
    flex: 1,
  },
  aiButtonTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  aiButtonText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  nav: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.screen.padding,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    gap: 9,
  },
  navButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  nextButton: {
    flex: 1.25,
    backgroundColor: theme.colors.primary,
  },
  disabledNav: {
    opacity: 0.4,
  },
  navText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  nextText: {
    color: '#FFFFFF',
  },
});
