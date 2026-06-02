import { useMemo } from 'react';

import { SocialFeedPost, SocialUser } from '../types';
import {
  TasteCategory,
  tasteCategoryLabels,
  useTasteProfileStore,
} from './tasteProfileStore';
import { sortFeedPostsByTaste, sortRecipesByTaste } from './TasteBasedFeedSorter';

export function useUserTasteProfile() {
  const scores = useTasteProfileStore((state) => state.scores);
  const recordInterest = useTasteProfileStore((state) => state.recordInterest);
  const recordRecipeInteraction = useTasteProfileStore((state) => state.recordRecipeInteraction);
  const recordPostInteraction = useTasteProfileStore((state) => state.recordPostInteraction);
  const recordTagInteraction = useTasteProfileStore((state) => state.recordTagInteraction);
  const recordCategoryInteraction = useTasteProfileStore((state) => state.recordCategoryInteraction);
  const recordChefFollow = useTasteProfileStore((state) => state.recordChefFollow);

  const rankedInterests = useMemo(
    () =>
      (Object.entries(scores) as Array<[TasteCategory, number]>)
        .sort((first, second) => second[1] - first[1])
        .map(([id, score]) => ({ id, label: tasteCategoryLabels[id], score })),
    [scores],
  );

  const primaryInterest = rankedInterests[0];

  return {
    scores,
    rankedInterests,
    primaryInterest,
    recordInterest,
    recordRecipeInteraction,
    recordPostInteraction,
    recordTagInteraction,
    recordCategoryInteraction,
    recordChefFollow,
    sortFeedPosts: (posts: SocialFeedPost[], usersById: Record<string, SocialUser>) =>
      sortFeedPostsByTaste(posts, scores, usersById),
    sortRecipes: (recipes: Parameters<typeof sortRecipesByTaste>[0]) => sortRecipesByTaste(recipes, scores),
  };
}
