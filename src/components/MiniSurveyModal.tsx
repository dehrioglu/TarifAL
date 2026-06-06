import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { useFeedback } from '../feedback/FeedbackProvider';
import { trackEvent } from '../services/analyticsService';
import { submitMiniSurveyResponse } from '../services/feedbackService';
import { useAppStore } from '../store/useAppStore';

type MiniSurveyModalProps = {
  surveyKey: string;
  screenName: string;
  question: string;
  answers: string[];
  relatedEvent: string;
  autoShow?: boolean;
  delayMs?: number;
  triggerCount?: number;
};

const getStorageKey = (userId: string | undefined, surveyKey: string) =>
  `tarifal-mini-survey:${userId ?? 'anonymous'}:${surveyKey}`;

const getLastPromptKey = (userId: string | undefined) =>
  `tarifal-mini-survey:last-prompt:${userId ?? 'anonymous'}`;

const SESSION_PROMPT_KEYS = new Set<string>();
const SURVEY_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7;

export function MiniSurveyModal({
  surveyKey,
  screenName,
  question,
  answers,
  relatedEvent,
  autoShow = false,
  delayMs = 0,
  triggerCount = 0,
}: MiniSurveyModalProps) {
  const user = useAppStore((store) => store.user);
  const profile = useAppStore((store) => store.profile);
  const accountMode = useAppStore((store) => store.accountMode);
  const { showToast } = useFeedback();
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasAttemptedAutoOpen = useRef(false);
  const isBetaTester = Boolean(profile?.isBetaTester || user?.isBetaTester);

  // Research prompts are useful for demos, but they should not interrupt real users.
  const shouldOfferSurvey = accountMode === 'demo';

  useEffect(() => {
    if (!shouldOfferSurvey) {
      return undefined;
    }

    if (!autoShow && triggerCount <= 0) {
      return undefined;
    }

    if (autoShow && hasAttemptedAutoOpen.current && triggerCount <= 0) {
      return undefined;
    }

    hasAttemptedAutoOpen.current = true;
    const storageKey = getStorageKey(user?.id, surveyKey);
    const sessionKey = `${user?.id ?? 'anonymous'}:${surveyKey}`;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const maybeOpen = async () => {
      try {
        if (SESSION_PROMPT_KEYS.has(sessionKey)) {
          return;
        }

        const [answered, lastPrompt] = await Promise.all([
          AsyncStorage.getItem(storageKey),
          AsyncStorage.getItem(getLastPromptKey(user?.id)),
        ]);
        const lastPromptAt = lastPrompt ? Number(lastPrompt) : 0;
        const stillCoolingDown =
          Number.isFinite(lastPromptAt) && Date.now() - lastPromptAt < SURVEY_COOLDOWN_MS;

        if (!answered && !stillCoolingDown && !cancelled) {
          timer = setTimeout(() => {
            if (!cancelled) {
              SESSION_PROMPT_KEYS.add(sessionKey);
              void AsyncStorage.setItem(getLastPromptKey(user?.id), String(Date.now()));
              setVisible(true);
            }
          }, delayMs);
        }
      } catch {
        // If local prompt history cannot be read, avoid interrupting the user.
      }
    };

    void maybeOpen();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [autoShow, delayMs, shouldOfferSurvey, surveyKey, triggerCount, user?.id]);

  const markDone = async () => {
    try {
      await AsyncStorage.setItem(getStorageKey(user?.id, surveyKey), 'done');
    } catch {
      // Survey deduplication is an enhancement; failure should not block the app.
    }
  };

  const handleSkip = async () => {
    await markDone();
    setVisible(false);
  };

  const handleAnswer = async (answer: string) => {
    setSubmitting(true);

    try {
      await submitMiniSurveyResponse({
        userId: user?.id,
        userEmail: user?.email,
        screenName,
        question,
        answer,
        relatedEvent,
        isBetaTester,
        isDemoMode: accountMode === 'demo',
      });
      void trackEvent('mini_survey_answered', {
        userId: user?.id,
        userEmail: user?.email,
        sourceScreen: screenName,
        isDemoMode: accountMode === 'demo',
        extraData: {
          question,
          answer,
          relatedEvent,
          isBetaTester,
        },
      });
      await markDone();
      setVisible(false);
      showToast('Teşekkürler, cevabın kaydedildi.', 'info');
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Mini anket kaydedilemedi. Daha sonra tekrar deneyebilirsin.',
        'warning',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleSkip}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="pulse-outline" size={22} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Kısa ürün sorusu</Text>
          <Text style={styles.question}>{question}</Text>
          <View style={styles.answerRow}>
            {answers.map((answer) => (
              <Pressable
                key={answer}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel={answer}
                onPress={() => {
                  void handleAnswer(answer);
                }}
                style={({ pressed }) => [styles.answerButton, pressed && styles.pressed]}
              >
                <Text style={styles.answerText}>{answer}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Mini anketi şimdi atla"
            onPress={() => {
              void handleSkip();
            }}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Şimdilik Atla</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.24)',
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 18,
    alignItems: 'center',
    gap: 12,
    ...theme.shadow,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  question: {
    color: theme.colors.text,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
    textAlign: 'center',
  },
  answerRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  answerButton: {
    flex: 1,
    minWidth: 96,
    minHeight: 46,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.72,
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  skipButton: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  skipText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
});
