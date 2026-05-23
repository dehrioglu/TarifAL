import { GoalType, Ingredient, Recipe, RecipeMatch, UserGoal } from '../types';

export const normalizeIngredientText = (value: string) =>
  value
    .toLocaleLowerCase('tr-TR')
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, ' ');

export const parsePantryText = (value: string) =>
  value
    .split(/[,\n]+/)
    .map((item) => normalizeIngredientText(item))
    .filter(Boolean);

export const ingredientMatchesTerm = (ingredient: Ingredient, term: string) => {
  const name = normalizeIngredientText(ingredient.name);
  const normalizedTerm = normalizeIngredientText(term);

  return name.includes(normalizedTerm) || normalizedTerm.includes(name);
};

export const getRecipeMatch = (recipe: Recipe, pantryItems: string[]): RecipeMatch => {
  const requiredIngredients = recipe.requiredIngredients ?? recipe.ingredients;
  const normalizedItems = pantryItems.map(normalizeIngredientText);
  const matchedIngredients = requiredIngredients.filter((ingredient) =>
    normalizedItems.some((item) => ingredientMatchesTerm(ingredient, item)),
  );
  const missingIngredients = requiredIngredients.filter(
    (ingredient) => !matchedIngredients.some((matched) => matched.id === ingredient.id),
  );
  const matchPercent =
    requiredIngredients.length === 0
      ? 0
      : Math.round((matchedIngredients.length / requiredIngredients.length) * 100);

  let label = `${missingIngredients.length} malzeme eksik`;
  let qualityLabel = 'Daha fazla malzeme gerek';

  if (matchPercent === 100) {
    label = 'Tam uyumlu';
    qualityLabel = 'Tam uyumlu';
  } else if (matchPercent >= 70) {
    qualityLabel = 'Çok uygun';
  } else if (matchPercent >= 40) {
    qualityLabel = 'Eksiklerle tamamlanır';
  } else if (missingIngredients.length === 1) {
    label = '1 malzeme eksik';
  } else if (matchPercent > 0) {
    label = `%${matchPercent} uyumlu`;
  }

  return {
    recipe,
    matchedIngredients,
    missingIngredients,
    matchPercent,
    label,
    qualityLabel,
  };
};

export const getRecipeMatches = (recipes: Recipe[], pantryText: string) => {
  const pantryItems = parsePantryText(pantryText);

  return recipes
    .map((recipe) => getRecipeMatch(recipe, pantryItems))
    .filter((match) => match.matchPercent > 0 || pantryItems.length === 0)
    .sort((first, second) => second.matchPercent - first.matchPercent);
};

export const getRecipeCost = (recipe: Recipe) =>
  recipe.estimatedPrice ?? recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.price, 0);

export const getRecipeSuitabilityScore = (
  recipe: Recipe,
  matchPercent: number,
  goal: UserGoal,
) => {
  const cost = getRecipeCost(recipe);
  const budgetScore = Math.max(0, Math.min(100, 100 - Math.max(0, cost - 80) * 0.35));
  const timeScore = Math.max(0, Math.min(100, 110 - recipe.prepTime * 1.4));
  const difficultyScore = recipe.difficulty === 'Kolay' ? 96 : recipe.difficulty === 'Orta' ? 78 : 62;
  const goalScore = Math.min(100, getGoalScore(recipe, goal));
  const score = Math.round(
    matchPercent * 0.42 +
      budgetScore * 0.2 +
      timeScore * 0.16 +
      difficultyScore * 0.12 +
      goalScore * 0.1,
  );

  return Math.max(36, Math.min(99, score));
};

export const goalToType: Record<UserGoal, GoalType> = {
  'Kilo vermek': 'kilo_vermek',
  'Kas yapmak': 'kas_yapmak',
  'Sağlıklı beslenmek': 'saglikli_beslenmek',
  'Ekonomik beslenmek': 'ekonomik_beslenmek',
  'Pratik yemek yapmak': 'pratik_yemek',
  'Aile için pratik yemek': 'pratik_yemek',
  'Öğrenci modu': 'ekonomik_beslenmek',
  'Zaman kazanmak': 'pratik_yemek',
};

export const getGoalScore = (recipe: Recipe, goal: UserGoal) => {
  const goalType = goalToType[goal];
  let score = recipe.goalTypes.includes(goalType) ? 100 : 0;

  if (goal === 'Ekonomik beslenmek') {
    score += Math.max(0, 140 - getRecipeCost(recipe));
  }

  if (goal === 'Pratik yemek yapmak') {
    score += Math.max(0, 45 - recipe.prepTime) * 2;
  }

  if (goal === 'Aile için pratik yemek') {
    score += recipe.servings >= 4 ? 55 : 0;
    score += Math.max(0, 45 - recipe.prepTime);
  }

  if (goal === 'Öğrenci modu') {
    score += Math.max(0, 130 - getRecipeCost(recipe));
    score += recipe.tags.some((tag) => normalizeIngredientText(tag).includes('ogrenci')) ? 45 : 0;
  }

  if (goal === 'Zaman kazanmak') {
    score += Math.max(0, 35 - recipe.prepTime) * 3;
  }

  if (goal === 'Kilo vermek') {
    score += Math.max(0, 520 - recipe.calories) / 4;
  }

  if (goal === 'Kas yapmak' && recipe.tags.some((tag) => normalizeIngredientText(tag).includes('protein'))) {
    score += 50;
  }

  if (goal === 'Sağlıklı beslenmek' && recipe.tags.some((tag) => ['saglikli', 'fit', 'vejetaryen'].includes(normalizeIngredientText(tag)))) {
    score += 45;
  }

  return score;
};

export const sortRecipesByGoal = (recipes: Recipe[], goal: UserGoal) =>
  [...recipes].sort((first, second) => getGoalScore(second, goal) - getGoalScore(first, goal));
