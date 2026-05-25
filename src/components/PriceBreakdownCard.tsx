import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

type PriceBreakdownCardProps = {
  subtotal: number;
  deliveryFee: number;
  commissionEstimate?: number;
  totalLabel?: string;
};

export function PriceBreakdownCard({
  subtotal,
  deliveryFee,
  commissionEstimate = 0,
  totalLabel = 'Genel toplam',
}: PriceBreakdownCardProps) {
  const total = subtotal + deliveryFee;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Ürün toplamı</Text>
        <Text style={styles.value}>₺{subtotal.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tahmini teslimat</Text>
        <Text style={styles.value}>₺{deliveryFee.toFixed(2)}</Text>
      </View>
      {commissionEstimate > 0 ? (
        <View style={styles.row}>
          <Text style={styles.label}>Komisyon simülasyonu</Text>
          <Text style={styles.value}>₺{commissionEstimate.toFixed(2)}</Text>
        </View>
      ) : null}
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.totalLabel}>{totalLabel}</Text>
        <Text style={styles.totalValue}>₺{total.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: theme.colors.primarySoft,
    padding: 16,
    gap: 9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  value: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#FFD9C5',
  },
  totalLabel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  totalValue: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
});
