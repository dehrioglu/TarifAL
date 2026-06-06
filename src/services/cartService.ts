import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';

import { CartItem } from '../types';
import { COLLECTIONS, db } from './firebase';

const userCart = (userId: string) => collection(db!, COLLECTIONS.users, userId, COLLECTIONS.cart);

const cleanItem = (item: CartItem) => JSON.parse(JSON.stringify(item)) as CartItem;

export const fetchUserCart = async (userId: string): Promise<CartItem[]> => {
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(userCart(userId));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<CartItem, 'id'>),
  }));
};

export const replaceUserCart = async (userId: string, items: CartItem[]) => {
  if (!db) {
    return;
  }

  const database = db;
  const snapshot = await getDocs(userCart(userId));
  const nextIds = new Set(items.map((item) => item.id));
  const existingIds = new Set(snapshot.docs.map((item) => item.id));

  await Promise.all([
    ...snapshot.docs
      .filter((item) => !nextIds.has(item.id))
      .map((item) => deleteDoc(item.ref)),
    ...items.map((item) => {
      const payload = {
        ...cleanItem(item),
        itemId: item.id,
        sourceRecipeId: item.recipeId ?? null,
        updatedAt: serverTimestamp(),
        ...(existingIds.has(item.id) ? {} : { createdAt: serverTimestamp() }),
      };

      return setDoc(
        doc(database, COLLECTIONS.users, userId, COLLECTIONS.cart, item.id),
        payload,
        { merge: true },
      );
    }),
  ]);
};
