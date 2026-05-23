export type TourTargetKey =
  | 'homeHeader'
  | 'homeSearch'
  | 'homePantry'
  | 'homeQuickActions'
  | 'homeRecipeCards'
  | 'homeMarket';

export type TargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TourStep = {
  id: string;
  target: TourTargetKey;
  title: string;
  description: string;
  finalMessage?: string;
};

export type CoachPlacement = 'top' | 'bottom';
