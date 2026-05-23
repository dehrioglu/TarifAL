import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';

import { AppUser } from '../types';
import { auth } from './firebase';

const DEMO_EMAIL = 'tarifai@tarifai.com';
const LEGACY_DEMO_EMAIL = 'test@tarifai.com';
const DEMO_PASSWORD = 'Test123!';

const localUserFromEmail = (email: string, name?: string): AppUser => ({
  id: email === DEMO_EMAIL || email === LEGACY_DEMO_EMAIL ? 'demo-user' : `local-${email.toLowerCase()}`,
  name: name || (email === DEMO_EMAIL || email === LEGACY_DEMO_EMAIL ? 'Enes' : email.split('@')[0]),
  email,
});

export const signInWithEmail = async (email: string, password: string): Promise<AppUser> => {
  if (!email || !password) {
    throw new Error('E-posta ve şifre gerekli.');
  }

  if (auth) {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    return {
      id: credential.user.uid,
      name: credential.user.displayName || 'Tarif AI',
      email: credential.user.email || email,
      avatarUrl: credential.user.photoURL || undefined,
    };
  }

  if ((email === DEMO_EMAIL || email === LEGACY_DEMO_EMAIL) && password !== DEMO_PASSWORD) {
    throw new Error('Demo şifresi: Test123!');
  }

  return localUserFromEmail(email);
};

export const registerWithEmail = async (
  name: string,
  email: string,
  password: string,
): Promise<AppUser> => {
  if (!name || !email || password.length < 6) {
    throw new Error('Ad, e-posta ve en az 6 karakter şifre gerekli.');
  }

  if (auth) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    return {
      id: credential.user.uid,
      name,
      email: credential.user.email || email,
      avatarUrl: credential.user.photoURL || undefined,
    };
  }

  return localUserFromEmail(email, name);
};

export const signOutUser = async () => {
  if (auth) {
    await firebaseSignOut(auth);
  }
};
