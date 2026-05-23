import { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { RecipeMatch, UserGoal } from '../types';
import { getRecipeCost, getRecipeSuitabilityScore } from '../utils/recipeMatching';

type AiAnalysisModalProps = {
  visible: boolean;
  title?: string;
  matches: RecipeMatch[];
  userGoal: UserGoal;
  onClose: () => void;
  onOpenRecipe: (recipeId: string) => void;
  onAddMissing: (recipeId: string) => void;
};

const analysisSteps = [
  'Malzemelerin taranıyor...',
  'Bütçene uygun tarifler seçiliyor...',
  'Eksik ürünler hesaplanıyor...',
  'En iyi öneriler hazırlanıyor...',
];

export function AiAnalysisModal({
  visible,
  title = 'TarifAL AI mutfağını analiz ediyor...',
  matches,
  userGoal,
  onClose,
  onOpenRecipe,
  onAddMissing,
}: AiAnalysisModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [done, setDone] = useState(false);
  const suggestions = useMemo(() => matches.slice(0, 3), [matches]);

  useEffect(() => {
    if (!visible) {
      setActiveStep(0);
      setDone(false);
      return;
    }

    const timers = analysisSteps.map((_, index) =>
      setTimeout(() => {
        setActiveStep(index);
        if (index === analysisSteps.length - 1) {
          setTimeout(() => setDone(true), 420);
        }
      }, index * 430),
    );

    return () => timers.forEach(clearTimeout);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={24} color={theme.colors.primary} />
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={styles.close}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{done ? 'Sana uygun tarifler hazır' : title}</Text>
          <Text style={styles.subtitle}>
            {done
              ? 'Malzemelerin, süren ve bütçen birlikte değerlendirildi.'
              : 'Sana en uygun tarifleri hazırlıyoruz.'}
          </Text>

          {!done ? (
            <View style={styles.steps}>
              {analysisSteps.map((step, index) => {
                const complete = index < activeStep;
                const active = index === activeStep;

                return (
                  <View key={step} style={[styles.stepRow, active && styles.activeStepRow]}>
                    <View style={[styles.stepIcon, (complete || active) && styles.activeStepIcon]}>
                      <Ionicons
                        name={complete ? 'checkmark' : active ? 'sparkles' : 'ellipse-outline'}
                        size={15}
                        color={complete || active ? '#FFFFFF' : theme.colors.subtle}
                      />
                    </View>
                    <Text style={[styles.stepText, active && styles.activeStepText]}>{step}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.results}>
              {suggestions.map((match) => {
                const score = getRecipeSuitabilityScore(match.recipe, match.matchPercent, userGoal);
                const cost = getRecipeCost(match.recipe);

                return (
                  <View key={match.recipe.id} style={styles.resultCard}>
                    <View style={styles.resultTop}>
                      <Text style={styles.resultTitle} numberOfLines={1}>{match.recipe.title}</Text>
                      <View style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>%{score}</Text>
                      </View>
                    </View>
                    <Text style={styles.resultMeta}>
                      {match.recipe.prepTime} dk • {match.recipe.difficulty} • ₺{cost.toFixed(0)} • %{match.matchPercent} uyum
                    </Text>
                    <View style={styles.resultActions}>
                      <TouchableOpacity
                        onPress={() => onOpenRecipe(match.recipe.id)}
                        activeOpacity={0.85}
                        style={styles.resultPrimary}
                      >
                        <Text style={styles.resultPrimaryText}>Tarifi Gör</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onAddMissing(match.recipe.id)}
                        activeOpacity={0.85}
                        style={styles.resultSecondary}
                      >
                        <Text style={styles.resultSecondaryText}>Eksikleri Sepete Ekle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 16, 32, 0.42)',
    padding: theme.screen.padding,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...theme.shadow,
    shadowOpacity: 0.16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 16,
    color: theme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  steps: {
    marginTop: 18,
    gap: 10,
  },
  stepRow: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeStepRow: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: '#FFD8C4',
  },
  stepIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
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
  results: {
    marginTop: 16,
    gap: 10,
  },
  resultCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 9,
  },
  resultTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  scoreBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  resultMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
  },
  resultPrimary: {
    flex: 1,
    minHeight: 38,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  resultSecondary: {
    flex: 1.35,
    minHeight: 38,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  resultSecondaryText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
});
