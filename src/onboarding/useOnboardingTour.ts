import { useContext } from 'react';

import { OnboardingTourContext } from './OnboardingTourProvider';
import { TourTargetKey } from './types';

const noopRegister = () => () => undefined;

export function useOnboardingTour() {
  const context = useContext(OnboardingTourContext);

  if (context) {
    return context;
  }

  return {
    isTourActive: false,
    currentStep: null,
    currentStepIndex: 0,
    totalSteps: 0,
    registerTarget: noopRegister as (key: TourTargetKey) => () => undefined,
    startTour: () => undefined,
    restartTour: () => undefined,
  };
}
