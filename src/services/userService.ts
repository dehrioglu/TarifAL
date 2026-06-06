import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { AppUser, UserGoal, UserRole } from '../types';
import { COLLECTIONS, db } from './firebase';

const FOUNDER_EMAIL = 'kervankayaenes@gmail.com';

type StoredUserProfile = {
  displayName?: string;
  email?: string;
  photoURL?: string;
  createdAt?: { toDate?: () => Date } | string;
  updatedAt?: { toDate?: () => Date } | string;
  nutritionGoal?: UserGoal | null;
  role?: UserRole;
  isBetaTester?: boolean;
  betaCode?: string;
  betaJoinedAt?: { toDate?: () => Date } | string;
};

const timestampToString = (value: StoredUserProfile['createdAt']) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.toDate?.().toISOString();
};

const getDefaultRole = (user: AppUser, existing?: StoredUserProfile): UserRole =>
  existing?.role ?? (user.email.toLowerCase() === FOUNDER_EMAIL ? 'founder' : 'user');

export const ensureUserProfile = async (user: AppUser) => {
  if (!db || user.isDemo) {
    return user;
  }

  const reference = doc(db, COLLECTIONS.users, user.id);
  const snapshot = await getDoc(reference);
  const existing = snapshot.exists() ? (snapshot.data() as StoredUserProfile) : undefined;

  await setDoc(
    reference,
    {
      displayName: user.name,
      email: user.email,
      photoURL: user.avatarUrl ?? null,
      nutritionGoal: existing?.nutritionGoal ?? null,
      role: getDefaultRole(user, existing),
      isBetaTester: user.isBetaTester ?? existing?.isBetaTester ?? false,
      betaCode: user.betaCode ?? existing?.betaCode ?? null,
      betaJoinedAt: user.betaJoinedAt ?? existing?.betaJoinedAt ?? null,
      createdAt: existing?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return {
    ...user,
    createdAt: timestampToString(existing?.createdAt),
    updatedAt: timestampToString(existing?.updatedAt),
    role: getDefaultRole(user, existing),
    isBetaTester: user.isBetaTester ?? existing?.isBetaTester ?? false,
    betaCode: user.betaCode ?? existing?.betaCode,
    betaJoinedAt: user.betaJoinedAt ?? timestampToString(existing?.betaJoinedAt),
  };
};

export const fetchUserProfile = async (userId: string): Promise<AppUser | null> => {
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, COLLECTIONS.users, userId));

  if (!snapshot.exists()) {
    return null;
  }

  const profile = snapshot.data() as StoredUserProfile;

  return {
    id: snapshot.id,
    name: profile.displayName || 'TarifAL Kullanıcısı',
    email: profile.email || '',
    avatarUrl: profile.photoURL || undefined,
    role: profile.role ?? (profile.email?.toLowerCase() === FOUNDER_EMAIL ? 'founder' : 'user'),
    createdAt: timestampToString(profile.createdAt),
    updatedAt: timestampToString(profile.updatedAt),
    isBetaTester: Boolean(profile.isBetaTester),
    betaCode: profile.betaCode,
    betaJoinedAt: timestampToString(profile.betaJoinedAt),
    isDemo: false,
  };
};

export const joinBetaProgram = async (user: AppUser, betaCode: string): Promise<AppUser> => {
  const joinedAt = new Date().toISOString();
  const nextUser: AppUser = {
    ...user,
    isBetaTester: true,
    betaCode,
    betaJoinedAt: joinedAt,
    updatedAt: joinedAt,
  };

  if (!db || user.isDemo) {
    return nextUser;
  }

  await setDoc(
    doc(db, COLLECTIONS.users, user.id),
    {
      isBetaTester: true,
      betaCode,
      betaJoinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return nextUser;
};
