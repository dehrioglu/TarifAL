import { Recipe, SocialFeedPost, SocialUser } from '../types';
import {
  getChefTasteCategories,
  getPostTasteCategories,
  getRecipeTasteCategories,
  TasteProfile,
} from './tasteProfileStore';

const sumTasteScore = (categories: Array<keyof TasteProfile>, scores: TasteProfile) =>
  categories.reduce((sum, category) => sum + scores[category], 0);

export const getPostTasteScore = (
  post: SocialFeedPost,
  scores: TasteProfile,
  author?: SocialUser,
) =>
  sumTasteScore(getPostTasteCategories(post), scores) +
  (author ? Math.round(sumTasteScore(getChefTasteCategories(author), scores) * 0.35) : 0);

export const sortFeedPostsByTaste = (
  posts: SocialFeedPost[],
  scores: TasteProfile,
  usersById: Record<string, SocialUser>,
) =>
  [...posts].sort(
    (first, second) =>
      getPostTasteScore(second, scores, usersById[second.authorId]) -
        getPostTasteScore(first, scores, usersById[first.authorId]) ||
      second.likes - first.likes,
  );

export const sortRecipesByTaste = (recipes: Recipe[], scores: TasteProfile) =>
  [...recipes].sort(
    (first, second) =>
      sumTasteScore(getRecipeTasteCategories(second), scores) -
        sumTasteScore(getRecipeTasteCategories(first), scores) ||
      second.likes - first.likes,
  );
