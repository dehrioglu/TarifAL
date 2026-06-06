import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';

import { AppUser } from '../types';
import { auth } from './firebase';

const DEMO_EMAIL = 'tarifai@tarifai.com';
const LEGACY_DEMO_EMAIL = 'test@tarifai.com';
const DEMO_PASSWORD = 'Test123!';

export const DEMO_USER: AppUser = {
  id: 'demo-user',
  name: 'Enes',
  email: DEMO_EMAIL,
  isDemo: true,
  role: 'user',
};

const localUserFromEmail = (email: string, name?: string): AppUser => ({
  id: email === DEMO_EMAIL || email === LEGACY_DEMO_EMAIL ? 'demo-user' : `local-${email.toLowerCase()}`,
  name: name || (email === DEMO_EMAIL || email === LEGACY_DEMO_EMAIL ? 'Enes' : email.split('@')[0]),
  email,
  isDemo: true,
  role: 'user',
});

export const appUserFromFirebase = (user: User): AppUser => ({
  id: user.uid,
  name: user.displayName || user.email?.split('@')[0] || 'TarifAL Kullanıcısı',
  email: user.email || '',
  avatarUrl: user.photoURL || undefined,
  isDemo: false,
});

const authErrorMessage = (error: unknown) => {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: string }).code)
      : '';

  if (code.includes('invalid-credential') || code.includes('wrong-password')) {
    return 'E-posta veya şifre hatalı.';
  }

  if (code.includes('email-already-in-use')) {
    return 'Bu e-posta ile daha önce hesap oluşturulmuş.';
  }

  if (code.includes('invalid-email')) {
    return 'Geçerli bir e-posta adresi gir.';
  }

  if (code.includes('network-request-failed')) {
    return 'İnternet bağlantısı kurulamadı. Demo modunda devam edebilirsin.';
  }

  return error instanceof Error ? error.message : 'Hesap işlemi tamamlanamadı.';
};

export const signInWithEmail = async (email: string, password: string): Promise<AppUser> => {
  if (!email || !password) {
    throw new Error('E-posta ve şifre gerekli.');
  }

  if (auth) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return appUserFromFirebase(credential.user);
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
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
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      return appUserFromFirebase(credential.user);
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  }

  return localUserFromEmail(email, name);
};

export const signOutUser = async () => {
  if (auth) {
    await firebaseSignOut(auth);
  }
};

export const subscribeToAuthState = (callback: (user: AppUser | null) => void) => {
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, (user) => callback(user ? appUserFromFirebase(user) : null));
};
