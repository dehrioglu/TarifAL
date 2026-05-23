import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppStore } from '../store/useAppStore';
import { ArrowPointer } from './ArrowPointer';
import { CoachMarkCard } from './CoachMarkCard';
import { SpotlightOverlay } from './SpotlightOverlay';
import { onboardingStorage } from './onboardingStorage';
import { onboardingTourSteps } from './tourSteps';
import { TargetRect, TourStep, TourTargetKey } from './types';

type TargetRef = View | null;

type OnboardingTourContextValue = {
  isTourActive: boolean;
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  registerTarget: (key: TourTargetKey) => (node: TargetRef) => void;
  startTour: () => void;
  restartTour: () => void;
};

export const OnboardingTourContext = createContext<OnboardingTourContextValue | null>(null);

const CARD_MARGIN = 18;
const CARD_MAX_WIDTH = 350;
const CARD_ESTIMATED_HEIGHT = 278;
const ARROW_SIZE = 58;
const TARGET_RETRY_LIMIT = 10;

const clamp = (value: number, min: number, max: number) =>
  max < min ? min : Math.min(Math.max(value, min), max);

export function OnboardingTourProvider({ children }: PropsWithChildren) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const targetRefs = useRef(new Map<TourTargetKey, View>());
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);

  const user = useAppStore((store) => store.user);
  const shouldStartGuidedTour = useAppStore((store) => store.shouldStartGuidedTour);
  const consumePendingGuidedTour = useAppStore((store) => store.consumePendingGuidedTour);
  const markGuidedTourCompleted = useAppStore((store) => store.markGuidedTourCompleted);
  const markGuidedTourSkipped = useAppStore((store) => store.markGuidedTourSkipped);

  const currentStep = isTourActive ? onboardingTourSteps[activeStepIndex] ?? null : null;
  const totalSteps = onboardingTourSteps.length;

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const registerTarget = useCallback(
    (key: TourTargetKey) => (node: TargetRef) => {
      if (node) {
        targetRefs.current.set(key, node);
      } else {
        targetRefs.current.delete(key);
      }
    },
    [],
  );

  const finishTour = useCallback(
    (status: 'completed' | 'skipped') => {
      clearRetryTimer();
      setIsTourActive(false);
      setTargetRect(null);

      if (status === 'completed') {
        void markGuidedTourCompleted();
      } else {
        void markGuidedTourSkipped();
      }
    },
    [clearRetryTimer, markGuidedTourCompleted, markGuidedTourSkipped],
  );

  const measureStepTarget = useCallback(
    (stepIndex: number, attempt = 0) => {
      const step = onboardingTourSteps[stepIndex];
      const target = step ? targetRefs.current.get(step.target) : null;

      if (!step) {
        finishTour('completed');
        return;
      }

      if (!target) {
        if (attempt >= TARGET_RETRY_LIMIT) {
          setActiveStepIndex((current) =>
            current >= onboardingTourSteps.length - 1 ? current : current + 1,
          );
          return;
        }

        retryTimerRef.current = setTimeout(() => measureStepTarget(stepIndex, attempt + 1), 90);
        return;
      }

      target.measureInWindow((x, y, targetWidth, targetHeight) => {
        if (targetWidth > 0 && targetHeight > 0) {
          setTargetRect({ x, y, width: targetWidth, height: targetHeight });
          return;
        }

        if (attempt >= TARGET_RETRY_LIMIT) {
          setActiveStepIndex((current) =>
            current >= onboardingTourSteps.length - 1 ? current : current + 1,
          );
          return;
        }

        retryTimerRef.current = setTimeout(() => measureStepTarget(stepIndex, attempt + 1), 90);
      });
    },
    [finishTour],
  );

  const startTour = useCallback(() => {
    clearRetryTimer();
    setTargetRect(null);
    setActiveStepIndex(0);
    setIsTourActive(true);
  }, [clearRetryTimer]);

  const restartTour = useCallback(() => {
    void onboardingStorage.resetTour(user?.id);
    startTour();
  }, [startTour, user?.id]);

  const goNext = useCallback(() => {
    if (activeStepIndex >= onboardingTourSteps.length - 1) {
      finishTour('completed');
      return;
    }

    setTargetRect(null);
    setActiveStepIndex((index) => index + 1);
  }, [activeStepIndex, finishTour]);

  const goBack = useCallback(() => {
    if (activeStepIndex === 0) {
      return;
    }

    setTargetRect(null);
    setActiveStepIndex((index) => Math.max(0, index - 1));
  }, [activeStepIndex]);

  useEffect(() => {
    if (!isTourActive) {
      return;
    }

    clearRetryTimer();
    const timer = setTimeout(() => measureStepTarget(activeStepIndex), 120);

    return () => {
      clearTimeout(timer);
      clearRetryTimer();
    };
  }, [activeStepIndex, clearRetryTimer, height, isTourActive, measureStepTarget, width]);

  useEffect(() => {
    if (!user || !shouldStartGuidedTour) {
      return;
    }

    const timer = setTimeout(() => {
      startTour();
      consumePendingGuidedTour();
    }, 650);

    return () => clearTimeout(timer);
  }, [consumePendingGuidedTour, shouldStartGuidedTour, startTour, user]);

  const cardLayout = useMemo(() => {
    const cardWidth = Math.min(width - CARD_MARGIN * 2, CARD_MAX_WIDTH);
    const fallbackTop = height - insets.bottom - CARD_ESTIMATED_HEIGHT - 28;
    const fallbackLeft = (width - cardWidth) / 2;

    if (!targetRect) {
      return {
        card: {
          left: fallbackLeft,
          top: Math.max(insets.top + 24, fallbackTop),
          width: cardWidth,
        },
        arrow: null,
      };
    }

    const targetCenterX = targetRect.x + targetRect.width / 2;
    const availableBelow = height - insets.bottom - (targetRect.y + targetRect.height);
    const placeBelow = availableBelow > CARD_ESTIMATED_HEIGHT + 46;
    const cardLeft = clamp(targetCenterX - cardWidth / 2, CARD_MARGIN, width - cardWidth - CARD_MARGIN);
    const cardTop = placeBelow
      ? clamp(
          targetRect.y + targetRect.height + 34,
          insets.top + CARD_MARGIN,
          height - insets.bottom - CARD_ESTIMATED_HEIGHT - CARD_MARGIN,
        )
      : clamp(
          targetRect.y - CARD_ESTIMATED_HEIGHT - 34,
          insets.top + CARD_MARGIN,
          height - insets.bottom - CARD_ESTIMATED_HEIGHT - CARD_MARGIN,
        );

    const arrowX = clamp(targetCenterX - ARROW_SIZE / 2, CARD_MARGIN, width - ARROW_SIZE - CARD_MARGIN);
    const arrowY = placeBelow
      ? clamp(cardTop - ARROW_SIZE + 6, targetRect.y + targetRect.height + 2, cardTop - 10)
      : clamp(cardTop + CARD_ESTIMATED_HEIGHT - 4, cardTop + 12, targetRect.y - ARROW_SIZE - 2);

    return {
      card: {
        left: cardLeft,
        top: cardTop,
        width: cardWidth,
      },
      arrow: {
        x: arrowX,
        y: arrowY,
        direction: placeBelow ? ('up' as const) : ('down' as const),
      },
    };
  }, [height, insets.bottom, insets.top, targetRect, width]);

  const contextValue = useMemo<OnboardingTourContextValue>(
    () => ({
      isTourActive,
      currentStep,
      currentStepIndex: activeStepIndex,
      totalSteps,
      registerTarget,
      startTour,
      restartTour,
    }),
    [activeStepIndex, currentStep, isTourActive, registerTarget, restartTour, startTour, totalSteps],
  );

  return (
    <OnboardingTourContext.Provider value={contextValue}>
      <View style={styles.root}>
        {children}
        {currentStep ? (
          <View pointerEvents="auto" style={styles.overlayRoot}>
            <SpotlightOverlay targetRect={targetRect} screenWidth={width} screenHeight={height} />
            {cardLayout.arrow ? (
              <ArrowPointer
                x={cardLayout.arrow.x}
                y={cardLayout.arrow.y}
                direction={cardLayout.arrow.direction}
              />
            ) : null}
            <CoachMarkCard
              step={currentStep}
              stepIndex={activeStepIndex}
              totalSteps={totalSteps}
              position={cardLayout.card}
              isFirst={activeStepIndex === 0}
              isLast={activeStepIndex === totalSteps - 1}
              onBack={goBack}
              onNext={goNext}
              onSkip={() => finishTour('skipped')}
            />
          </View>
        ) : null}
      </View>
    </OnboardingTourContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
});
