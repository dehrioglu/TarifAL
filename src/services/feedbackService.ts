import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import {
  FeedbackItem,
  FeedbackPayload,
  FeedbackStats,
  MiniSurveyPayload,
  MiniSurveyResponse,
} from '../types';
import { COLLECTIONS, db } from './firebase';

const APP_VERSION = '1.0.0-beta';

type FirestoreTimestampLike = {
  toDate?: () => Date;
};

type StoredFeedback = Omit<FeedbackItem, 'id'> & {
  createdAt?: FirestoreTimestampLike | string;
};

type StoredSurveyResponse = Omit<MiniSurveyResponse, 'id'> & {
  createdAt?: FirestoreTimestampLike | string;
};

type StoredUser = {
  isBetaTester?: boolean;
};

const emptyFeedbackStats: FeedbackStats = {
  betaTesterCount: 0,
  totalFeedback: 0,
  averageRating: 0,
  topFeedbackScreen: 'Henüz veri yok',
  mostLikedScreen: 'Henüz veri yok',
  topBugScreen: 'Henüz veri yok',
  topConfusingScreen: 'Henüz veri yok',
  recentFeedback: [],
  surveyAnswerDistribution: {},
  marketOrderIntent: {
    yes: 0,
    maybe: 0,
    no: 0,
    total: 0,
  },
};

const cleanExtraData = (extraData?: FeedbackPayload['extraData']) => {
  if (!extraData) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(extraData).filter(([, value]) => value !== undefined),
  );
};

const timestampToString = (value?: FirestoreTimestampLike | string) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.toDate?.().toISOString();
};

const normalizeFeedback = (id: string, data: StoredFeedback): FeedbackItem => ({
  ...data,
  id,
  createdAt: timestampToString(data.createdAt),
});

const normalizeSurvey = (id: string, data: StoredSurveyResponse): MiniSurveyResponse => ({
  ...data,
  id,
  createdAt: timestampToString(data.createdAt),
});

const topScreen = (feedback: FeedbackItem[], predicate?: (item: FeedbackItem) => boolean) => {
  const counts = feedback.reduce<Record<string, number>>((acc, item) => {
    if (predicate && !predicate(item)) {
      return acc;
    }

    acc[item.screenName] = (acc[item.screenName] ?? 0) + 1;
    return acc;
  }, {});

  const [screen] = Object.entries(counts).sort((first, second) => second[1] - first[1])[0] ?? [];

  return screen ?? 'Henüz veri yok';
};

const normalizeIntentAnswer = (answer: string) => {
  const normalized = answer.toLocaleLowerCase('tr-TR');

  if (normalized.includes('evet')) {
    return 'yes';
  }

  if (normalized.includes('belki') || normalized.includes('kısmen') || normalized.includes('kismen')) {
    return 'maybe';
  }

  return 'no';
};

export const submitFeedback = async (payload: FeedbackPayload) => {
  if (!db || payload.isDemoMode || !payload.userId || payload.userId === 'demo-user') {
    return `local-feedback-${Date.now()}`;
  }

  try {
    const reference = await addDoc(collection(db, COLLECTIONS.feedback), {
      userId: payload.userId ?? 'demo-user',
      userEmail: payload.userEmail ?? null,
      userName: payload.userName ?? null,
      screenName: payload.screenName,
      feedbackType: payload.feedbackType,
      message: payload.message?.trim() ?? '',
      rating: payload.rating ?? null,
      isBetaTester: Boolean(payload.isBetaTester),
      isDemoMode: Boolean(payload.isDemoMode),
      appVersion: APP_VERSION,
      extraData: cleanExtraData(payload.extraData),
      createdAt: serverTimestamp(),
    });

    return reference.id;
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('Feedback gönderilemedi:', error);
    }

    throw new Error('Geri bildirimin gönderilemedi. Daha sonra tekrar deneyebilirsin.');
  }
};

export const submitMiniSurveyResponse = async (payload: MiniSurveyPayload) => {
  if (!db || payload.isDemoMode || !payload.userId || payload.userId === 'demo-user') {
    return `local-survey-${Date.now()}`;
  }

  try {
    const reference = await addDoc(collection(db, COLLECTIONS.miniSurveyResponses), {
      userId: payload.userId ?? 'demo-user',
      userEmail: payload.userEmail ?? null,
      screenName: payload.screenName,
      question: payload.question,
      answer: payload.answer,
      relatedEvent: payload.relatedEvent,
      isBetaTester: Boolean(payload.isBetaTester),
      isDemoMode: Boolean(payload.isDemoMode),
      createdAt: serverTimestamp(),
    });

    return reference.id;
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('Mini anket kaydedilemedi:', error);
    }

    throw new Error('Mini anket kaydedilemedi. Daha sonra tekrar deneyebilirsin.');
  }
};

export const getRecentFeedback = async (count = 10): Promise<FeedbackItem[]> => {
  if (!db) {
    return [];
  }

  try {
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.feedback), orderBy('createdAt', 'desc'), limit(count)),
    );

    return snapshot.docs.map((item) => normalizeFeedback(item.id, item.data() as StoredFeedback));
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('Son feedback verisi alınamadı:', error);
    }

    return [];
  }
};

export const getFeedbackStats = async (): Promise<FeedbackStats> => {
  if (!db) {
    return emptyFeedbackStats;
  }

  try {
    const [usersSnapshot, feedbackSnapshot, surveysSnapshot] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.users)),
      getDocs(collection(db, COLLECTIONS.feedback)),
      getDocs(collection(db, COLLECTIONS.miniSurveyResponses)),
    ]);

    const feedback = feedbackSnapshot.docs
      .map((item) => normalizeFeedback(item.id, item.data() as StoredFeedback))
      .sort((first, second) => (second.createdAt ?? '').localeCompare(first.createdAt ?? ''));
    const surveys = surveysSnapshot.docs.map((item) =>
      normalizeSurvey(item.id, item.data() as StoredSurveyResponse),
    );
    const ratings = feedback
      .map((item) => item.rating)
      .filter((rating): rating is number => typeof rating === 'number' && Number.isFinite(rating));
    const surveyAnswerDistribution = surveys.reduce<Record<string, Record<string, number>>>(
      (acc, survey) => {
        acc[survey.question] = acc[survey.question] ?? {};
        acc[survey.question][survey.answer] = (acc[survey.question][survey.answer] ?? 0) + 1;
        return acc;
      },
      {},
    );
    const marketOrderIntent = surveys.reduce<FeedbackStats['marketOrderIntent']>(
      (acc, survey) => {
        const isMarketQuestion =
          survey.relatedEvent === 'checkout_demo_completed' ||
          survey.question.toLocaleLowerCase('tr-TR').includes('market sipariş');

        if (!isMarketQuestion) {
          return acc;
        }

        const key = normalizeIntentAnswer(survey.answer);
        acc[key] += 1;
        acc.total += 1;
        return acc;
      },
      { yes: 0, maybe: 0, no: 0, total: 0 },
    );
    const betaTesterCount = usersSnapshot.docs.filter(
      (item) => Boolean((item.data() as StoredUser).isBetaTester),
    ).length;

    return {
      betaTesterCount,
      totalFeedback: feedback.length,
      averageRating:
        ratings.length > 0
          ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
          : 0,
      topFeedbackScreen: topScreen(feedback),
      mostLikedScreen: topScreen(feedback, (item) => item.feedbackType === 'liked'),
      topBugScreen: topScreen(feedback, (item) => item.feedbackType === 'bug'),
      topConfusingScreen: topScreen(feedback, (item) => item.feedbackType === 'confusing'),
      recentFeedback: feedback.slice(0, 10),
      surveyAnswerDistribution,
      marketOrderIntent,
    };
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('Feedback metrikleri alınamadı:', error);
    }

    return emptyFeedbackStats;
  }
};
