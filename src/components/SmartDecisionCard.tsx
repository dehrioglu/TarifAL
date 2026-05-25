import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { commerceMarketDemo } from '../data/demoCommerce';
import { PurchaseMode, RestaurantOption } from '../types';

export type DecisionPreference = 'best' | 'economic' | 'fast' | 'healthy' | 'ready';

type SmartDecisionCardProps = {
  recipeTitle: string;
  prepTime: number;
  calories: number;
  matchPercent: number;
  estimatedHomeCost: number;
  marketTotal: number;
  restaurants: RestaurantOption[];
  preference: DecisionPreference;
  onPreferenceChange: (preference: DecisionPreference) => void;
  onSelectMode: (mode: PurchaseMode) => void;
};

type DecisionOption = {
  mode: PurchaseMode;
  title: string;
  cost: number;
  timeLabel: string;
  timeValue: number;
  helper: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const preferences: Array<{ id: DecisionPreference; label: string }> = [
  { id: 'best', label: 'En mantÄ±klÄ±sÄ±' },
  { id: 'economic', label: 'En ucuz' },
  { id: 'fast', label: 'En hÄ±zlÄ±' },
  { id: 'healthy', label: 'Daha saÄŸlÄ±klÄ±' },
  { id: 'ready', label: 'HazÄ±r gelsin' },
];

const parseDeliveryMinutes = (value: string) => {
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];

  if (numbers.length === 0) {
    return 35;
  }

  return Math.round(numbers.reduce((sum, item) => sum + item, 0) / numbers.length);
};

const getBestRestaurant = (restaurants: RestaurantOption[]) =>
  [...restaurants].sort((first, second) => {
    const firstTotal = first.portionPrice + first.deliveryFee;
    const secondTotal = second.portionPrice + second.deliveryFee;

    if (firstTotal !== secondTotal) {
      return firstTotal - secondTotal;
    }

    return parseDeliveryMinutes(first.deliveryEstimate) - parseDeliveryMinutes(second.deliveryEstimate);
  })[0];

const getRecommendation = (
  preference: DecisionPreference,
  options: DecisionOption[],
  matchPercent: number,
) => {
  const byMode = (mode: PurchaseMode) => options.find((option) => option.mode === mode) ?? options[0];

  if (preference === 'economic') {
    return [...options].sort((first, second) => first.cost - second.cost)[0];
  }

  if (preference === 'fast') {
    return [...options].sort((first, second) => first.timeValue - second.timeValue)[0];
  }

  if (preference === 'ready') {
    return byMode('restaurant');
  }

  if (preference === 'healthy') {
    return byMode(matchPercent >= 60 ? 'home' : 'market');
  }

  const restaurant = byMode('restaurant');
  const market = byMode('market');
  const home = byMode('home');

  if (matchPercent >= 80 && home.timeValue <= restaurant.timeValue + 8) {
    return home;
  }

  if (market.cost < restaurant.cost && matchPercent >= 40) {
    return market;
  }

  return restaurant;
};

export function SmartDecisionCard({
  recipeTitle,
  prepTime,
  calories,
  matchPercent,
  estimatedHomeCost,
  marketTotal,
  restaurants,
  preference,
  onPreferenceChange,
  onSelectMode,
}: SmartDecisionCardProps) {
  const bestRestaurant = getBestRestaurant(restaurants);
  const baseRestaurantTotal = bestRestaurant
    ? bestRestaurant.portionPrice + bestRestaurant.deliveryFee
    : marketTotal + 58;
  const restaurantFloor = marketTotal > 0
    ? Math.round(marketTotal * 1.45)
    : Math.round(Math.max(estimatedHomeCost, 90) * 1.35);
  const restaurantTotal = Math.max(baseRestaurantTotal, restaurantFloor);
  const restaurantTime = bestRestaurant ? parseDeliveryMinutes(bestRestaurant.deliveryEstimate) : 35;
  const marketTime = parseDeliveryMinutes(commerceMarketDemo.deliveryEstimate);
  const homeCost = 0;
  const options: DecisionOption[] = [
    {
      mode: 'home',
      title: 'Evde yap',
      cost: homeCost,
      timeLabel: `${prepTime} dk`,
      timeValue: prepTime,
      helper: `${calories} kcal â€¢ evdeki malzeme uyumu %${matchPercent}`,
      icon: 'home-outline',
    },
    {
      mode: 'market',
      title: 'Malzemeleri al',
      cost: marketTotal,
      timeLabel: commerceMarketDemo.deliveryEstimate,
      timeValue: marketTime,
      helper: marketTotal > 0
        ? `${commerceMarketDemo.marketName} â€¢ sadece eksikler`
        : 'Eksik Ã¼rÃ¼n yok â€¢ market maliyeti yok',
      icon: 'basket-outline',
    },
    {
      mode: 'restaurant',
      title: 'HazÄ±r sipariÅŸ',
      cost: restaurantTotal,
      timeLabel: bestRestaurant?.deliveryEstimate ?? '30-45 dk',
      timeValue: restaurantTime,
      helper: bestRestaurant ? `${bestRestaurant.name} â€¢ â­ ${bestRestaurant.rating.toFixed(1)}` : 'Demo restoran',
      icon: 'restaurant-outline',
    },
  ];
  const recommendation = getRecommendation(preference, options, matchPercent);
  const cheapest = [...options].sort((first, second) => first.cost - second.cost)[0];
  const fastest = [...options].sort((first, second) => first.timeValue - second.timeValue)[0];
  const savings = Math.max(0, restaurantTotal - cheapest.cost);
  const commissionPotential =
    recommendation.mode === 'restaurant'
      ? restaurantTotal * (bestRestaurant?.commissionRate ?? commerceMarketDemo.restaurantCommissionRate)
      : marketTotal * commerceMarketDemo.marketCommissionRate;
  const score = Math.min(
    98,
    Math.max(
      64,
      Math.round(62 + matchPercent * 0.18 + (savings > 0 ? 8 : 0) + (prepTime <= 30 ? 7 : 0)),
    ),
  );
  const recommendationText =
    recommendation.mode === 'home'
      ? `${recipeTitle} için evde yapmak ek market maliyeti olmadan en ekonomik seçenek görünüyor.`
      : recommendation.mode === 'market'
        ? `${recipeTitle} için yalnýzca eksikleri market sepetine dönüþtürmek mantýklý görünüyor.`
        : `${recipeTitle} için hazýr sipariþ daha pahalý ama hýz ve restoran komisyonu potansiyelini gösteriyor.`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="analytics-outline" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>TarifAL Karar Motoru</Text>
            <Text style={styles.title}>Evde yap mÄ±, hazÄ±r sÃ¶yle mi?</Text>
          </View>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreLabel}>Skor</Text>
        </View>
      </View>

      <Text style={styles.recommendation}>{recommendationText}</Text>

      <View style={styles.preferenceRow}>
        {preferences.map((item) => {
          const active = item.id === preference;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onPreferenceChange(item.id)}
              activeOpacity={0.86}
              style={[styles.preferenceChip, active && styles.preferenceChipActive]}
            >
              <Text style={[styles.preferenceText, active && styles.preferenceTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.options}>
        {options.map((option) => {
          const recommended = option.mode === recommendation.mode;

          return (
            <TouchableOpacity
              key={option.mode}
              onPress={() => onSelectMode(option.mode)}
              activeOpacity={0.86}
              style={[styles.optionCard, recommended && styles.optionCardRecommended]}
            >
              <View style={styles.optionTop}>
                <View style={[styles.optionIcon, recommended && styles.optionIconRecommended]}>
                  <Ionicons
                    name={option.icon}
                    size={17}
                    color={recommended ? '#FFFFFF' : theme.colors.primary}
                  />
                </View>
                {recommended ? <Text style={styles.recommendedPill}>Ã–nerilen</Text> : null}
              </View>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionPrice}>â‚º{option.cost.toFixed(0)}</Text>
              <Text style={styles.optionMeta}>{option.timeLabel}</Text>
              <Text style={styles.optionHelper} numberOfLines={2}>{option.helper}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>â‚º{savings.toFixed(0)}</Text>
          <Text style={styles.metricLabel}>Tasarruf pot.</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>â‚º{commissionPotential.toFixed(0)}</Text>
          <Text style={styles.metricLabel}>Komisyon pot.</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{fastest.title}</Text>
          <Text style={styles.metricLabel}>En hÄ±zlÄ±</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onSelectMode(recommendation.mode)}
        activeOpacity={0.86}
        style={styles.cta}
      >
        <Ionicons name="sparkles" size={17} color="#FFFFFF" />
        <Text style={styles.ctaText}>{recommendation.title} seÃ§eneÄŸini aÃ§</Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        Fiyatlar demo veridir; yatÄ±rÄ±mcÄ± akÄ±ÅŸÄ±nda market ve restoran gelir modelini gÃ¶rÃ¼nÃ¼r kÄ±lar.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 15,
    gap: 13,
    ...theme.orangeShadow,
    shadowOpacity: 0.08,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  scoreBadge: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 10,
    fontWeight: '900',
  },
  recommendation: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  preferenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceChip: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  preferenceText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  preferenceTextActive: {
    color: '#FFFFFF',
  },
  options: {
    gap: 8,
  },
  optionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 5,
  },
  optionCardRecommended: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
  },
  optionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconRecommended: {
    backgroundColor: theme.colors.primary,
  },
  recommendedPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '900',
  },
  optionTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  optionPrice: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  optionMeta: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  optionHelper: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metric: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  cta: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  note: {
    color: theme.colors.subtle,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    fontWeight: '700',
  },
});

