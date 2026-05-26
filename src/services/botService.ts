import { socialBotQuickActions, socialBotResponses } from '../data/mockBotMessages';

export type BotSuggestion = {
  prompt: string;
  response: string;
};

export const getSocialBotSuggestions = (): BotSuggestion[] =>
  socialBotQuickActions.map((prompt) => ({
    prompt,
    response: socialBotResponses[prompt] ?? 'TarifAL Bot bu isteği demo modunda yanıtladı.',
  }));

export const getSocialBotResponse = (prompt: string) =>
  socialBotResponses[prompt] ??
  'Bu cevap mock bot servisiyle üretildi. İleride aynı katmana gerçek AI API bağlanabilir.';
