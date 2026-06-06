import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { demoSmartBasketMarket } from '../data/demoSmartBasket';
import { theme } from '../constants/theme';
import { SmartBasketPlan } from '../types';
import { InvestorConversionStrip } from './InvestorConversionStrip';
import { useAppStore } from '../store/useAppStore';
import { isFounderUser } from '../utils/profileIdentity';

type SmartBasketMarketPreviewProps = {
  plan: SmartBasketPlan;
  onAddToCart: () => void;
};

export function SmartBasketMarketPreview({ plan, onAddToCart }: SmartBasketMarketPreviewProps) {
  const user = useAppStore((store) => store.user);
  const profile = useAppStore((store) => store.profile);
  const showFounderMetrics = Boolean(isFounderUser(user) || profile?.isBetaTester || user?.isBetaTester);

  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.marketIcon}>
            <Ionicons name="storefront-outline" size={23} color={theme.colors.primary} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Market sepeti</Text>
            <Text style={styles.title}>{demoSmartBasketMarket.name}</Text>
            <Text style={styles.subtitle}>Teslimat: {demoSmartBasketMarket.deliveryEstimate}</Text>
          </View>
        </View>

        <View style={styles.rows}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Seçilen plan</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{plan.recipeTitle}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Eksik ürün</Text>
            <Text style={styles.summaryValue}>{plan.missingIngredients.length} kalem</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ürün toplamı</Text>
            <Text style={styles.summaryValue}>₺{plan.missingTotal.toFixed(0)}</Text>
          </View>
          {showFounderMetrics ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tahmini komisyon</Text>
              <Text style={styles.primaryValue}>₺{Math.max(18, plan.estimatedCommission).toFixed(0)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.revenueBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.revenueText}>
            Ürünler seçili market sepetine aktarılır. Bu aşamada ödeme alınmaz.
          </Text>
        </View>

        <TouchableOpacity onPress={onAddToCart} activeOpacity={0.88} style={styles.primaryButton}>
          <Ionicons name="cart" size={17} color="#FFFFFF" />
          <Text style={styles.primaryText}>Eksikleri sepete aktar</Text>
        </TouchableOpacity>
      </View>

      {showFounderMetrics ? <InvestorConversionStrip /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 16,
    gap: 14,
    ...theme.orangeShadow,
    shadowOpacity: 0.08,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  marketIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    marginTop: 2,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  rows: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  primaryValue: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  revenueBox: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  revenueText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
