import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingSnapshot = {
  hasSeenWelcomeOnboarding: boolean;
  hasCompletedGuidedTour: boolean;
  hasSkippedGuidedTour: boolean;
};

const memoryStore = new Map<string, string>();

const normalizeUserId = (userId?: string | null) => userId?.trim() || 'demo-user';

const keysForUser = (userId?: string | null) => {
  const id = normalizeUserId(userId);

  return {
    welcomeSeen: `onboarding:welcomeSeen:${id}`,
    tourCompleted: `onboarding:tourCompleted:${id}`,
    tourSkipped: `onboarding:tourSkipped:${id}`,
  };
};

const readValue = async (key: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }

    return await AsyncStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
};

const writeValue = async (key: string, value: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }

    await AsyncStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
};

const removeValue = async (key: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }

    await AsyncStorage.removeItem(key);
  } catch {
    memoryStore.delete(key);
  }
};

export const onboardingStorage = {
  async getSnapshot(userId?: string | null): Promise<OnboardingSnapshot> {
    const keys = keysForUser(userId);
    const [welcomeSeen, tourCompleted, tourSkipped] = await Promise.all([
      readValue(keys.welcomeSeen),
      readValue(keys.tourCompleted),
      readValue(keys.tourSkipped),
    ]);

    return {
      hasSeenWelcomeOnboarding: welcomeSeen === 'true',
      hasCompletedGuidedTour: tourCompleted === 'true',
      hasSkippedGuidedTour: tourSkipped === 'true',
    };
  },

  async markWelcomeSeen(userId?: string | null) {
    await writeValue(keysForUser(userId).welcomeSeen, 'true');
  },

  async markTourCompleted(userId?: string | null) {
    const keys = keysForUser(userId);

    await Promise.all([
      writeValue(keys.tourCompleted, 'true'),
      removeValue(keys.tourSkipped),
    ]);
  },

  async markTourSkipped(userId?: string | null) {
    const keys = keysForUser(userId);

    await Promise.all([
      writeValue(keys.tourSkipped, 'true'),
      removeValue(keys.tourCompleted),
    ]);
  },

  async resetTour(userId?: string | null) {
    const keys = keysForUser(userId);

    await Promise.all([removeValue(keys.tourCompleted), removeValue(keys.tourSkipped)]);
  },
};
