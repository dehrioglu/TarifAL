import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

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
