import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

import { AppUser, CartItem, Order, Recipe } from '../types';
import { COLLECTIONS, db } from './firebase';

export const syncUser = async (user: AppUser) => {
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, COLLECTIONS.users, user.id),
    {
      ...user,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const saveRecipe = async (recipe: Recipe) => {
  if (!db) {
    return;
  }

  const database = db;

  await setDoc(doc(database, COLLECTIONS.recipes, recipe.id), {
    ...recipe,
    createdAt: serverTimestamp(),
  });

  await Promise.all(
    recipe.ingredients.map((ingredient) =>
      setDoc(doc(database, COLLECTIONS.ingredients, ingredient.id), {
        ...ingredient,
        recipeId: recipe.id,
        updatedAt: serverTimestamp(),
      }),
    ),
  );
};

export const saveLike = async (userId: string, recipeId: string, liked: boolean) => {
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, COLLECTIONS.likes, `${userId}_${recipeId}`),
    {
      userId,
      recipeId,
      liked,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const saveCartItem = async (userId: string, item: CartItem) => {
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, COLLECTIONS.cart, `${userId}_${item.id}`),
    {
      userId,
      ...item,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const saveOrder = async (order: Order) => {
  if (!db) {
    return;
  }

  await setDoc(doc(db, COLLECTIONS.orders, order.id), {
    ...order,
    createdAt: serverTimestamp(),
  });
};

export const fetchRecipes = async (): Promise<Recipe[]> => {
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(collection(db, COLLECTIONS.recipes));

  return snapshot.docs.map((recipeDoc) => ({
    id: recipeDoc.id,
    ...(recipeDoc.data() as Omit<Recipe, 'id'>),
  }));
};

export const fetchUserLikes = async (userId: string): Promise<Record<string, boolean>> => {
  if (!db) {
    return {};
  }

  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.likes), where('userId', '==', userId), where('liked', '==', true)),
  );

  return snapshot.docs.reduce<Record<string, boolean>>((acc, likeDoc) => {
    const data = likeDoc.data() as { recipeId?: string };

    if (data.recipeId) {
      acc[data.recipeId] = true;
    }

    return acc;
  }, {});
};

export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.orders), where('userId', '==', userId)),
  );

  return snapshot.docs
    .map((orderDoc) => ({ id: orderDoc.id, ...(orderDoc.data() as Omit<Order, 'id'>) }))
    .sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)));
};
