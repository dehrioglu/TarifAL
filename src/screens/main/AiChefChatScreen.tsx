import { ComponentProps, useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../components/AppButton';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { demoAiChefPrompts, demoAiChefSuggestions } from '../../data/demoAiChef';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { RootStackParamList } from '../../navigation/types';
import { getSocialBotResponse, getSocialBotSuggestions } from '../../services/botService';
import { useAppStore } from '../../store/useAppStore';
import { Recipe, RecipeMatch } from '../../types';
import {
  getRecipeCost,
  getRecipeMatch,
  getRecipeSuitabilityScore,
  normalizeIngredientText,
  parsePantryText,
} from '../../utils/recipeMatching';

type Props = NativeStackScreenProps<RootStackParamList, 'AiChefChat'>;
type IconName = ComponentProps<typeof Ionicons>['name'];

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  matches?: RecipeMatch[];
  pantryItems?: string[];
};

type ChefIntent = {
  quick: boolean;
  economic: boolean;
  healthy: boolean;
  kids: boolean;
  protein: boolean;
  budgetLimit?: number;
  servings?: number;
};

const fallbackPrompt = 'Evdeki malzemelerime göre pratik ve ekonomik bir yemek öner.';

const extractIntent = (prompt: string): ChefIntent => {
  const normalized = normalizeIngredientText(prompt);
  const budgetMatch = normalized.match(/(\d{2,4})\s*(tl|₺)/);
  const servingsMatch = normalized.match(/(\d+)\s*(kisilik|kisi)/);

  return {
    quick:
      normalized.includes('hizli') ||
      normalized.includes('pratik') ||
      normalized.includes('dakika') ||
      normalized.includes('20') ||
      normalized.includes('15'),
    economic:
      normalized.includes('ekonomik') ||
      normalized.includes('ucuz') ||
      normalized.includes('butce') ||
      normalized.includes('ogrenci') ||
      Boolean(budgetMatch),
    healthy:
      normalized.includes('saglik') ||
      normalized.includes('fit') ||
      normalized.includes('hafif'),
    kids: normalized.includes('cocuk'),
    protein:
      normalized.includes('protein') ||
      normalized.includes('kas') ||
      normalized.includes('spor'),
    budgetLimit: budgetMatch ? Number(budgetMatch[1]) : undefined,
    servings: servingsMatch ? Number(servingsMatch[1]) : undefined,
  };
};

const extractIngredients = (prompt: string, recipes: Recipe[]) => {
  const normalizedPrompt = normalizeIngredientText(prompt);
  const ingredientNames = new Set<string>();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      const normalizedIngredient = normalizeIngredientText(ingredient.name);

      if (normalizedPrompt.includes(normalizedIngredient)) {
        ingredientNames.add(ingredient.name);
      }
    });
  });

  if (ingredientNames.size > 0) {
    return Array.from(ingredientNames);
  }

  if (normalizedPrompt.includes(' var') || normalizedPrompt.includes(',') || normalizedPrompt.includes('evde')) {
    return parsePantryText(prompt).filter((item) => item.length <= 24);
  }

  return [];
};

const getIntentScore = (recipe: Recipe, intent: ChefIntent) => {
  const cost = getRecipeCost(recipe);
  const normalizedTags = recipe.tags.map(normalizeIngredientText);
  let score = 0;

  if (intent.quick && recipe.prepTime <= 25) {
    score += 24;
  }

  if (intent.economic && cost <= (intent.budgetLimit ?? 160)) {
    score += 26;
  }

  if (intent.healthy && (recipe.calories <= 520 || normalizedTags.some((tag) => ['fit', 'saglikli', 'vejetaryen'].includes(tag)))) {
    score += 22;
  }

  if (intent.kids && recipe.difficulty === 'Kolay') {
    score += 16;
  }

  if (intent.protein && normalizedTags.some((tag) => tag.includes('protein'))) {
    score += 28;
  }

  return score;
};

const buildAssistantText = (prompt: string, matches: RecipeMatch[], pantryItems: string[], intent: ChefIntent) => {
  const topMatch = matches[0];
  const promptIntro = pantryItems.length > 0
    ? `${pantryItems.slice(0, 4).join(', ')} ile baktım.`
    : 'Hedefine, bütçene ve süre isteğine göre baktım.';

  if (!topMatch) {
    return 'Bu isteğe uygun net bir tarif bulamadım. Birkaç malzeme daha yazarsan daha iyi öneri çıkarabilirim.';
  }

  const budgetCopy = intent.budgetLimit ? ` ${intent.budgetLimit} TL sınırını da dikkate aldım.` : '';
  const missingCopy =
    topMatch.missingIngredients.length === 0
      ? 'İlk öneri tam uyumlu; direkt pişirmeye başlayabilirsin.'
      : `İlk öneride ${topMatch.missingIngredients.length} eksik ürün var; istersen tek tıkla sepete aktarabilirim.`;

  return `${promptIntro}${budgetCopy} Sana en uygun ${matches.length} tarif seçtim. ${missingCopy}`;
};

const getInitialMessage = (pantryText: string): ChatMessage => ({
  id: 'assistant-welcome',
  role: 'assistant',
  text: `Ben TarifAL AI Şef. "${pantryText}" gibi evdeki malzemeleri, bütçeyi veya süreyi yaz; sana tarif önerip eksikleri sepete aktarırım.`,
});

export function AiChefChatScreen({ navigation }: Props) {
  const recipes = useAppStore((store) => store.recipes);
  const pantryText = useAppStore((store) => store.pantryText);
  const userGoal = useAppStore((store) => store.userGoal);
  const likes = useAppStore((store) => store.likes);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const setPantryText = useAppStore((store) => store.setPantryText);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const { showToast, showDemoModal } = useFeedback();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [getInitialMessage(pantryText)]);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Record<string, boolean>>({});

  const latestAssistantMatches = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'assistant' && message.matches)?.matches ?? [],
    [messages],
  );
  const latestAssistantResultId = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'assistant' && message.matches)?.id,
    [messages],
  );
  const socialBotSuggestions = useMemo(() => getSocialBotSuggestions(), []);

  const createMatches = (prompt: string) => {
    const intent = extractIntent(prompt);
    const extractedIngredients = extractIngredients(prompt, recipes);
    const pantryItems = extractedIngredients.length > 0 ? extractedIngredients : parsePantryText(pantryText);
    const budgetLimit = intent.budgetLimit;

    const matches = recipes
      .map((recipe) => getRecipeMatch(recipe, pantryItems))
      .filter((match) => {
        if (!budgetLimit) {
          return true;
        }

        return getRecipeCost(match.recipe) <= budgetLimit * Math.max(1, intent.servings ?? 1);
      })
      .sort((first, second) => {
        const firstScore =
          first.matchPercent * 1.2 +
          getRecipeSuitabilityScore(first.recipe, first.matchPercent, userGoal) +
          getIntentScore(first.recipe, intent);
        const secondScore =
          second.matchPercent * 1.2 +
          getRecipeSuitabilityScore(second.recipe, second.matchPercent, userGoal) +
          getIntentScore(second.recipe, intent);

        return secondScore - firstScore;
      })
      .slice(0, 3);

    return { intent, pantryItems, matches };
  };

  const sendPrompt = (value = input) => {
    const trimmedPrompt = value.trim();

    if (!trimmedPrompt) {
      showToast('Ne yemek istediğini veya evde ne olduğunu yazarsan sana öneri hazırlayabilirim.', 'warning');
      return;
    }

    const prompt = trimmedPrompt || fallbackPrompt;
    const botResponse = getSocialBotResponse(prompt);
    const { intent, pantryItems, matches } = createMatches(prompt);
    const pantryValue = pantryItems.join(', ');

    if (pantryValue) {
      setPantryText(pantryValue);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: prompt,
    };
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: botResponse.includes('mock bot servisi')
        ? buildAssistantText(prompt, matches, pantryItems, intent)
        : `${botResponse} ${buildAssistantText(prompt, matches, pantryItems, intent)}`,
      matches,
      pantryItems,
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setExpandedMessageIds({});
    setInput('');
  };

  const addMissingToCart = (match: RecipeMatch, pantryItems?: string[]) => {
    addMissingIngredientsToCart(match.recipe.id, pantryItems?.join(', '));
    setMessages((current) => [
      ...current,
      {
        id: `assistant-cart-${Date.now()}`,
        role: 'assistant',
        text: `${match.recipe.title} için eksik ürünleri sepete ekledim. Sepetten Akıllı Sipariş akışına geçebilirsin.`,
      },
    ]);
    showDemoModal({
      title: 'Eksikler sepete eklendi',
      message: `${match.recipe.title} için eksik ürünler akıllı sepete aktarıldı. Bir sonraki adımda market sipariş simülasyonuna geçebilirsin.`,
      primaryLabel: 'Akıllı Siparişe Geç',
      secondaryLabel: 'Sepete Git',
      onPrimary: () => navigation.navigate('MarketCheckout'),
      onSecondary: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
    });
  };

  const handleToggleFavorite = (recipeId: string) => {
    const liked = Boolean(likes[recipeId]);
    toggleLike(recipeId);
    showToast(liked ? 'Favorilerden çıkarıldı.' : 'Favorilere eklendi.');
  };

  const openSmartBasket = (match?: RecipeMatch, pantryItems?: string[]) => {
    navigation.navigate('SmartBasket', {
      recipeId: match?.recipe.id,
      ingredients: pantryItems?.length ? pantryItems : parsePantryText(pantryText),
      startFrom: 'servings',
    });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.86} style={styles.backButton}>
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>AI Şef’e Sor</Text>
        <TouchableOpacity onPress={() => openSmartBasket(latestAssistantMatches[0])} activeOpacity={0.86} style={styles.smallAction}>
          <Ionicons name="cart-outline" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={24} color={theme.colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Kişisel mutfak asistanın hazır</Text>
        <Text style={styles.heroText}>
          Malzeme, bütçe, kişi sayısı veya süre yaz. TarifAL AI Şef tarif önerir, eksikleri bulur ve sepete aktarır.
        </Text>
        <View style={styles.heroStats}>
          <MiniStat value="3" label="Akıllı öneri" />
          <MiniStat value="Tek tık" label="Sepete aktar" />
          <MiniStat value="Mock" label="AI demo" />
        </View>
      </View>

      <View style={styles.quickPromptBlock}>
        <Text style={styles.sectionTitle}>Hazır sorular</Text>
        <View style={styles.quickPromptList}>
          {demoAiChefPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              onPress={() => sendPrompt(prompt)}
              activeOpacity={0.86}
              style={styles.quickPrompt}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
          {socialBotSuggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.prompt}
              onPress={() => sendPrompt(suggestion.prompt)}
              activeOpacity={0.86}
              style={styles.quickPrompt}
            >
              <Text style={styles.quickPromptText}>{suggestion.prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.messages}>
        {messages.map((message) => {
          const hasMatches = Boolean(message.matches?.length);
          const isLatestResult = message.id === latestAssistantResultId;
          const isExpanded = Boolean(expandedMessageIds[message.id]);
          const showMatches = hasMatches && (isLatestResult || isExpanded);

          return (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                hasMatches && !isLatestResult && styles.historyBubble,
              ]}
            >
              {message.role === 'assistant' ? (
                <View style={styles.messageHeader}>
                  <View style={styles.messageIcon}>
                    <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.messageName}>TarifAL AI Şef</Text>
                  {hasMatches && !isLatestResult ? (
                    <View style={styles.historyBadge}>
                      <Text style={styles.historyBadgeText}>Geçmiş</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              <Text style={[styles.messageText, message.role === 'user' && styles.userMessageText]}>
                {message.text}
              </Text>
              {hasMatches && !showMatches ? (
                <TouchableOpacity
                  onPress={() =>
                    setExpandedMessageIds((current) => ({
                      ...current,
                      [message.id]: true,
                    }))
                  }
                  activeOpacity={0.86}
                  style={styles.historySummary}
                >
                  <View style={styles.historySummaryIcon}>
                    <Ionicons name="albums-outline" size={16} color={theme.colors.primary} />
                  </View>
                  <View style={styles.historySummaryCopy}>
                    <Text style={styles.historySummaryTitle}>Önceki öneri kapatıldı</Text>
                    <Text style={styles.historySummaryText}>
                      {message.matches?.length ?? 0} tarif önerisi var. İstersen tekrar açabilirsin.
                    </Text>
                  </View>
                  <Text style={styles.historySummaryAction}>Göster</Text>
                </TouchableOpacity>
              ) : null}
              {showMatches ? (
                <View style={styles.suggestionList}>
                  {!isLatestResult ? (
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedMessageIds((current) => ({
                          ...current,
                          [message.id]: false,
                        }))
                      }
                      activeOpacity={0.86}
                      style={styles.collapseHistory}
                    >
                      <Text style={styles.collapseHistoryText}>Bu geçmiş öneriyi kapat</Text>
                    </TouchableOpacity>
                  ) : null}
                  {message.matches?.map((match) => (
                    <ChefRecipeSuggestionCard
                      key={match.recipe.id}
                      match={match}
                      onOpen={() => navigation.navigate('RecipeDetail', { recipeId: match.recipe.id })}
                      onCook={() => navigation.navigate('RecipeDetail', { recipeId: match.recipe.id, openCooking: true })}
                      onAddMissing={() => addMissingToCart(match, message.pantryItems)}
                      onSmartBasket={() => openSmartBasket(match, message.pantryItems)}
                      favorite={Boolean(likes[match.recipe.id])}
                      onToggleFavorite={() => handleToggleFavorite(match.recipe.id)}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.suggestionActions}>
        {demoAiChefSuggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion}
            onPress={() => sendPrompt(suggestion)}
            activeOpacity={0.86}
            style={styles.suggestionChip}
          >
            <Text style={styles.suggestionChipText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputCard}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Örn: 150 TL altı, 2 kişilik, tavuklu pratik yemek..."
          placeholderTextColor={theme.colors.subtle}
          multiline
          style={styles.input}
        />
        <AppButton title="AI Şef’e Sor" icon="send" onPress={() => sendPrompt()} />
      </View>
    </Screen>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function ChefRecipeSuggestionCard({
  match,
  onOpen,
  onCook,
  onAddMissing,
  onSmartBasket,
  favorite,
  onToggleFavorite,
}: {
  match: RecipeMatch;
  onOpen: () => void;
  onCook: () => void;
  onAddMissing: () => void;
  onSmartBasket: () => void;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  const cost = getRecipeCost(match.recipe);
  const visibleMissing = match.missingIngredients.slice(0, 2);
  const hiddenMissing = Math.max(0, match.missingIngredients.length - visibleMissing.length);

  return (
    <View style={styles.recipeCard}>
      <Image source={{ uri: match.recipe.imageUrl }} style={styles.recipeImage} />
      <View style={styles.recipeBody}>
        <View style={styles.recipeTop}>
          <Text style={styles.recipeTitle} numberOfLines={1}>{match.recipe.title}</Text>
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>%{match.matchPercent}</Text>
          </View>
        </View>
        <Text style={styles.recipeMeta}>
          {match.recipe.prepTime} dk • {match.recipe.difficulty} • ₺{cost.toFixed(0)} • {match.recipe.calories} kcal
        </Text>
        <Text style={styles.recipeInfo}>
          {match.matchedIngredients.length} eşleşti • {match.missingIngredients.length === 0 ? 'Tam uyumlu' : `${match.missingIngredients.length} eksik`}
        </Text>
        <Text style={styles.recipeMissing} numberOfLines={1}>
          {match.missingIngredients.length === 0
            ? 'Tüm malzemeler hazır.'
            : `Eksik: ${visibleMissing.map((item) => item.name).join(', ')}${hiddenMissing > 0 ? ` +${hiddenMissing}` : ''}`}
        </Text>
        <View style={styles.recipeActions}>
          <TouchableOpacity onPress={onOpen} activeOpacity={0.86} style={styles.recipePrimary}>
            <Text style={styles.recipePrimaryText}>Tarifi Gör</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCook} activeOpacity={0.86} style={styles.recipeSoft}>
            <Text style={styles.recipeSoftText}>Pişirmeye Başla</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recipeActions}>
          <TouchableOpacity
            onPress={onAddMissing}
            activeOpacity={0.86}
            disabled={match.missingIngredients.length === 0}
            style={[styles.recipeSoft, match.missingIngredients.length === 0 && styles.disabledAction]}
          >
            <Text style={styles.recipeSoftText}>Eksikleri Al</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleFavorite} activeOpacity={0.86} style={styles.recipeSoft}>
            <Text style={styles.recipeSoftText}>{favorite ? 'Favorilerde' : 'Favoriye Ekle'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onSmartBasket} activeOpacity={0.86} style={styles.smartBasketButton}>
          <Ionicons name="sparkles" size={13} color={theme.colors.primary} />
          <Text style={styles.smartBasketText}>Akıllı Sepet’e aktar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingTop: 12,
  },
  topBar: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  hero: {
    borderRadius: 30,
    backgroundColor: theme.colors.text,
    padding: 18,
    gap: 12,
    overflow: 'hidden',
    ...theme.shadow,
    shadowOpacity: 0.08,
  },
  heroGlow: {
    position: 'absolute',
    right: -40,
    top: -44,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 90, 0, 0.18)',
  },
  aiAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '900',
  },
  heroText: {
    color: '#D6DAE5',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 8,
  },
  miniStat: {
    flex: 1,
    minHeight: 62,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    justifyContent: 'center',
  },
  miniStatValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  miniStatLabel: {
    marginTop: 3,
    color: '#B8C0CF',
    fontSize: 10,
    fontWeight: '800',
  },
  quickPromptBlock: {
    marginTop: 16,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  quickPromptList: {
    marginTop: 10,
    gap: 8,
  },
  quickPrompt: {
    minHeight: 44,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    justifyContent: 'center',
  },
  quickPromptText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  messages: {
    marginTop: 16,
    gap: 12,
  },
  messageBubble: {
    borderRadius: 22,
    padding: 14,
    gap: 10,
  },
  assistantBubble: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    ...theme.shadow,
    shadowOpacity: 0.03,
  },
  historyBubble: {
    shadowOpacity: 0.01,
    backgroundColor: '#FCFCFD',
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '88%',
    backgroundColor: theme.colors.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  messageIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageName: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  historyBadge: {
    marginLeft: 'auto',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  historyBadgeText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  messageText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  suggestionList: {
    gap: 10,
  },
  historySummary: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historySummaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historySummaryCopy: {
    flex: 1,
  },
  historySummaryTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  historySummaryText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  historySummaryAction: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  collapseHistory: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  collapseHistoryText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  recipeCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
  },
  recipeImage: {
    width: 86,
    minHeight: 138,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
  },
  recipeBody: {
    flex: 1,
    gap: 6,
  },
  recipeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recipeTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  matchBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  recipeMeta: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  recipeInfo: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  recipeMissing: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 7,
  },
  recipePrimary: {
    flex: 1,
    minHeight: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipePrimaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  recipeSoft: {
    flex: 1,
    minHeight: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledAction: {
    opacity: 0.54,
  },
  recipeSoftText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  smartBasketButton: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  smartBasketText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  suggestionActions: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  suggestionChipText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  inputCard: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 10,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  input: {
    minHeight: 76,
    maxHeight: 132,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    textAlignVertical: 'top',
  },
});
