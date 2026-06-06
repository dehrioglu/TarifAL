import { getApp, getApps, initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

const configValues = Object.values(firebaseConfig);
const requiredConfigValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
];
const hasPlaceholderValue = configValues.some(
  (value) => value.includes('your-') || value.includes('000000'),
);

export const isFirebaseConfigured = requiredConfigValues.every(Boolean) && !hasPlaceholderValue;

export const firebaseApp = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

const createAuth = () => {
  if (!firebaseApp) {
    return null;
  }

  if (Platform.OS === 'web') {
    return FirebaseAuth.getAuth(firebaseApp);
  }

  const nativeAuth = FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence?: (
      storage: typeof AsyncStorage,
    ) => FirebaseAuth.Persistence;
  };

  try {
    return nativeAuth.getReactNativePersistence
      ? FirebaseAuth.initializeAuth(firebaseApp, {
          persistence: nativeAuth.getReactNativePersistence(AsyncStorage),
        })
      : FirebaseAuth.getAuth(firebaseApp);
  } catch {
    return FirebaseAuth.getAuth(firebaseApp);
  }
};

export const auth = createAuth();
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

export const COLLECTIONS = {
  users: 'users',
  recipes: 'recipes',
  ingredients: 'ingredients',
  orders: 'orders',
  likes: 'likes',
  favorites: 'favorites',
  cart: 'cart',
  analyticsEvents: 'analyticsEvents',
  feedback: 'feedback',
  miniSurveyResponses: 'miniSurveyResponses',
  sponsoredProducts: 'sponsoredProducts',
} as const;
