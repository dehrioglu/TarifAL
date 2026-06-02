import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DailyReturnState = {
  lastVisit: string;
  streak: number;
  completedToday: boolean;
};

const storageKey = 'retention:daily-return';

const getDayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getYesterdayKey = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDayKey(yesterday);
};

export function useDailyReturn() {
  const [state, setState] = useState<DailyReturnState>({
    lastVisit: getDayKey(),
    streak: 1,
    completedToday: false,
  });

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const today = getDayKey();
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        const previous = stored ? (JSON.parse(stored) as DailyReturnState) : undefined;
        const next: DailyReturnState =
          previous?.lastVisit === today
            ? previous
            : {
                lastVisit: today,
                streak: previous?.lastVisit === getYesterdayKey() ? previous.streak + 1 : 1,
                completedToday: false,
              };

        await AsyncStorage.setItem(storageKey, JSON.stringify(next));
        if (active) {
          setState(next);
        }
      } catch {
        const fallback = { lastVisit: today, streak: 1, completedToday: false };
        await AsyncStorage.setItem(storageKey, JSON.stringify(fallback));
        if (active) {
          setState(fallback);
        }
      }
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  const completeDailyAction = useCallback(async () => {
    const next = { ...state, completedToday: true };
    setState(next);
    await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  }, [state]);

  return {
    streak: state.streak,
    completedToday: state.completedToday,
    completeDailyAction,
  };
}
