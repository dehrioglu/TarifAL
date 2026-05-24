import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { demoSmartBasketMarket } from '../data/demoSmartBasket';
import { theme } from '../constants/theme';
import { SmartBasketPlan } from '../types';

type SmartBasketMissingItemsProps = {
  plan: SmartBasketPlan;
  onNext: () => void;
};

export function SmartBasketMissingItems({ plan, onNext }: SmartBasketMissingItemsProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Eksik ürünler bulundu</Text>
          <Text style={styles.subtitle}>
            {plan.recipeTitle} için {plan.missingIngredients.length} ürün Demo Market sepetine dönüşebilir.
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{demoSmartBasketMarket.name}</Text>
        </View>
      </View>

      {plan.missingIngredients.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="checkmark-done" size={22} color={theme.colors.primary} />
          <Text style={styles.emptyText}>Bu plan için eksik ürün görünmüyor. Market önizlemesini yine de açabilirsin.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {plan.missingIngredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="add" size={16} color={theme.colors.primary} />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.name}>{ingredient.name}</Text>
                <Text style={styles.meta}>{ingredient.gram} gr • {plan.recipeTitle}</Text>
              </View>
              <Text style={styles.price}>₺{ingredient.price.toFixed(0)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Eksik ürün toplamı</Text>
        <Text style={styles.summaryValue}>₺{plan.missingTotal.toFixed(0)}</Text>
      </View>

      <TouchableOpacity onPress={onNext} activeOpacity={0.88} style={styles.primaryButton}>
        <Ionicons name="basket" size={17} color="#FFFFFF" />
        <Text style={styles.primaryText}>Demo market sepetini önizle</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  list: {
    gap: 9,
  },
  row: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
  },
  name: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  meta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  price: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFD8C4',
    backgroundColor: theme.colors.primarySoft,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  summary: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#FFF8F4',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  summaryValue: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: '900',
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
