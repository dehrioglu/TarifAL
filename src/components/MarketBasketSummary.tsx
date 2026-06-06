import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { commerceMarketDemo } from '../data/demoCommerce';

type MarketBasketSummaryProps = {
  itemCount: number;
  total: number;
  onAddToCart: () => void;
};

export function MarketBasketSummary({ itemCount, total, onAddToCart }: MarketBasketSummaryProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="basket-outline" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Market sepeti özeti</Text>
          <Text style={styles.subtitle}>
            {itemCount} malzeme • {commerceMarketDemo.marketName} • {commerceMarketDemo.deliveryEstimate}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>₺{total.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Canlı toplam</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{commerceMarketDemo.deliveryEstimate}</Text>
          <Text style={styles.statLabel}>Teslimat</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>%{Math.round(commerceMarketDemo.conversionRate * 100)}</Text>
          <Text style={styles.statLabel}>Sepete uygun</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onAddToCart}
        activeOpacity={0.86}
        style={[styles.button, itemCount === 0 && styles.buttonDisabled]}
      >
        <Ionicons name={itemCount === 0 ? 'checkmark-circle' : 'bag-add'} size={17} color="#FFFFFF" />
        <Text style={styles.buttonText}>
          {itemCount === 0 ? 'Eksik ürün yok' : 'Eksikleri Sepete Ekle'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.note}>Fiyatlar tahminidir; market entegrasyonu beta sürecinde netleşir.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 14,
    gap: 13,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  button: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.success,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  note: {
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});
