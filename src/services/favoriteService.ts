import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';

import { Recipe } from '../types';
import { COLLECTIONS, db } from './firebase';

const userFavorites = (userId: string) =>
  collection(db!, COLLECTIONS.users, userId, COLLECTIONS.favorites);

export const fetchUserFavorites = async (userId: string): Promise<Record<string, boolean>> => {
  if (!db) {
    return {};
  }

  const snapshot = await getDocs(userFavorites(userId));

  return snapshot.docs.reduce<Record<string, boolean>>((favorites, favorite) => {
    favorites[favorite.id] = true;
    return favorites;
  }, {});
};

export const setUserFavorite = async (
  userId: string,
  recipeId: string,
  liked: boolean,
  recipe?: Pick<Recipe, 'title' | 'imageUrl'>,
) => {
  if (!db) {
    return;
  }

  const reference = doc(db, COLLECTIONS.users, userId, COLLECTIONS.favorites, recipeId);

  if (!liked) {
    await deleteDoc(reference);
    return;
  }

  await setDoc(reference, {
    recipeId,
    title: recipe?.title ?? null,
    imageURL: recipe?.imageUrl ?? null,
    savedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
