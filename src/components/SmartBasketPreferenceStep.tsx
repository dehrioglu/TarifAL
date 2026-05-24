import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { smartBasketBudgetModes } from '../data/demoSmartBasket';
import { theme } from '../constants/theme';

type SmartBasketPreferenceStepProps = {
  mode: 'servings' | 'budget';
  servings: number;
  budgetModeId: string;
  onChangeServings: (value: number) => void;
  onChangeBudget: (value: string) => void;
  onNext: () => void;
};

export function SmartBasketPreferenceStep({
  mode,
  servings,
  budgetModeId,
  onChangeServings,
  onChangeBudget,
  onNext,
}: SmartBasketPreferenceStepProps) {
  if (mode === 'servings') {
    return (
      <View style={styles.card}>
        <View style={styles.iconHero}>
          <Ionicons name="people-outline" size={30} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Kaç kişilik plan hazırlayalım?</Text>
        <Text style={styles.subtitle}>Porsiyon arttıkça eksik ürün gramajı ve tahmini market tutarı otomatik ölçeklenir.</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() => onChangeServings(Math.max(1, servings - 1))}
            activeOpacity={0.85}
            style={styles.stepButton}
          >
            <Ionicons name="remove" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.servingValue}>
            <Text style={styles.servingNumber}>{servings}</Text>
            <Text style={styles.servingLabel}>kişi</Text>
          </View>
          <TouchableOpacity
            onPress={() => onChangeServings(Math.min(8, servings + 1))}
            activeOpacity={0.85}
            style={styles.stepButton}
          >
            <Ionicons name="add" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onNext} activeOpacity={0.88} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Bütçeyi seç</Text>
          <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.iconHero}>
        <Ionicons name="wallet-outline" size={30} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Bütçeni seç</Text>
      <Text style={styles.subtitle}>TarifAL önerileri bu bütçeye göre sıralar ve market sepeti etkisini hesaplar.</Text>
      <View style={styles.budgetList}>
        {smartBasketBudgetModes.map((budget) => {
          const active = budgetModeId === budget.id;

          return (
            <TouchableOpacity
              key={budget.id}
              onPress={() => onChangeBudget(budget.id)}
              activeOpacity={0.86}
              style={[styles.budgetCard, active && styles.activeBudgetCard]}
            >
              <View style={styles.budgetTop}>
                <Text style={[styles.budgetLabel, active && styles.activeBudgetLabel]}>{budget.label}</Text>
                <View style={[styles.budgetBadge, active && styles.activeBudgetBadge]}>
                  <Text style={[styles.budgetBadgeText, active && styles.activeBudgetBadgeText]}>{budget.badge}</Text>
                </View>
              </View>
              <Text style={[styles.budgetHelper, active && styles.activeBudgetHelper]}>{budget.helper}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity onPress={onNext} activeOpacity={0.88} style={styles.primaryButton}>
        <Ionicons name="sparkles" size={17} color="#FFFFFF" />
        <Text style={styles.primaryText}>AI analizi başlat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 14,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  iconHero: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  stepper: {
    minHeight: 104,
    borderRadius: 24,
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#FFE0CF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  stepButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingValue: {
    alignItems: 'center',
  },
  servingNumber: {
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: '900',
  },
  servingLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  budgetList: {
    gap: 10,
  },
  budgetCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 13,
    gap: 7,
  },
  activeBudgetCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  budgetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  budgetLabel: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  activeBudgetLabel: {
    color: theme.colors.primary,
  },
  budgetBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  activeBudgetBadge: {
    backgroundColor: theme.colors.primary,
  },
  budgetBadgeText: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  activeBudgetBadgeText: {
    color: '#FFFFFF',
  },
  budgetHelper: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  activeBudgetHelper: {
    color: theme.colors.text,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.orangeShadow,
    shadowOpacity: 0.12,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
