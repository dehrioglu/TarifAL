import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';

import { Recipe } from '../types';
import { COLLECTIONS, db } from './firebase';

const cleanRecipe = (recipe: Recipe) => JSON.parse(JSON.stringify(recipe)) as Recipe;

export const saveUserRecipe = async (recipe: Recipe) => {
  if (!db) {
    return;
  }

  const database = db;
  const clean = cleanRecipe(recipe);

  await setDoc(doc(database, COLLECTIONS.recipes, recipe.id), {
    ...clean,
    imageURL: clean.imageUrl,
    createdAt: clean.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDemo: Boolean(clean.isDemo),
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

export const fetchRemoteRecipes = async (): Promise<Recipe[]> => {
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(collection(db, COLLECTIONS.recipes));

  return snapshot.docs.map((recipeDoc) => {
    const data = recipeDoc.data() as Omit<Recipe, 'id'> & { imageURL?: string };

    return {
      ...data,
      id: recipeDoc.id,
      imageUrl: data.imageUrl || data.imageURL || '',
    };
  });
};
