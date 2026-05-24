import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type SmartBasketAnalysisStepProps = {
  onComplete: () => void;
};

const analysisSteps = [
  'Malzemelerin analiz ediliyor...',
  'Bütçene uygun tarifler seçiliyor...',
  'Eksik ürünler hesaplanıyor...',
  'Market sepeti hazırlanıyor...',
];

export function SmartBasketAnalysisStep({ onComplete }: SmartBasketAnalysisStepProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timers = analysisSteps.map((_, index) =>
      setTimeout(() => setActiveIndex(index), index * 520),
    );
    const doneTimer = setTimeout(onComplete, analysisSteps.length * 520 + 420);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <View style={styles.card}>
      <View style={styles.heroIcon}>
        <Ionicons name="sparkles" size={32} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>TarifAL AI mutfağını analiz ediyor</Text>
      <Text style={styles.subtitle}>Tarif, bütçe ve market sepeti aynı anda hesaplanıyor.</Text>
      <View style={styles.steps}>
        {analysisSteps.map((step, index) => {
          const active = index === activeIndex;
          const complete = index < activeIndex;

          return (
            <View key={step} style={[styles.stepRow, active && styles.activeStepRow]}>
              <View style={[styles.stepIcon, (active || complete) && styles.activeStepIcon]}>
                {complete ? (
                  <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                ) : active ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="ellipse-outline" size={14} color={theme.colors.subtle} />
                )}
              </View>
              <Text style={[styles.stepText, active && styles.activeStepText]}>{step}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 18,
    gap: 14,
    alignItems: 'center',
    ...theme.orangeShadow,
    shadowOpacity: 0.08,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  steps: {
    width: '100%',
    gap: 10,
  },
  stepRow: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeStepRow: {
    borderColor: '#FFD8C4',
    backgroundColor: theme.colors.primarySoft,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStepIcon: {
    backgroundColor: theme.colors.primary,
  },
  stepText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  activeStepText: {
    color: theme.colors.text,
  },
});
