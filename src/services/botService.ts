import { socialBotQuickActions, socialBotResponses } from '../data/mockBotMessages';

export type BotSuggestion = {
  prompt: string;
  response: string;
};

export const getSocialBotSuggestions = (): BotSuggestion[] =>
  socialBotQuickActions.map((prompt) => ({
    prompt,
    response: socialBotResponses[prompt] ?? 'TarifAL Bot bu isteği mutfak tercihlerinle eşleştirdi.',
  }));

export const getSocialBotResponse = (prompt: string) =>
  socialBotResponses[prompt] ??
  'İsteğini malzeme, bütçe ve süre bilgisine göre değerlendirdim.';
