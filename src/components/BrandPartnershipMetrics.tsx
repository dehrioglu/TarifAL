import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { demoSponsoredMetrics, demoSponsoredProducts } from '../data/demoSponsoredProducts';

const formatCurrency = (value: number) => `₺${value.toLocaleString('tr-TR')}`;

export function BrandPartnershipMetrics() {
  const activeProducts = demoSponsoredProducts.filter((product) => product.isActive);
  const impressions = activeProducts.reduce((sum, product) => sum + product.impressionCount, 0);
  const clicks = activeProducts.reduce((sum, product) => sum + product.clickCount, 0);
  const cartAdds = activeProducts.reduce((sum, product) => sum + product.cartAddCount, 0);
  const clickRate = impressions > 0 ? Math.round((clicks / impressions) * 100) : 0;
  const cartAddRate = clicks > 0 ? Math.round((cartAdds / clicks) * 100) : 0;
  const topProduct = [...activeProducts].sort((first, second) => second.cartAddCount - first.cartAddCount)[0];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="ribbon-outline" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Marka İş Birlikleri</Text>
          <Text style={styles.title}>Sponsorlu öneri performansı</Text>
          <Text style={styles.description}>
            Kullanıcı ihtiyacına göre gösterilen ürün önerileri. Reklam panosu değil; tarif, sepet ve AI akışında doğal öneri metriği.
          </Text>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <Metric value={String(activeProducts.length)} label="Aktif ürün" helper="Demo kampanya" />
        <Metric value={String(impressions)} label="Gösterim" helper="sponsored_impression" />
        <Metric value={`%${clickRate}`} label="Tıklama oranı" helper={`${clicks} tıklama`} />
        <Metric value={`%${cartAddRate}`} label="Sepete ekleme" helper={`${cartAdds} ürün`} />
        <Metric value={formatCurrency(demoSponsoredMetrics.estimatedMonthlyRevenue)} label="Aylık potansiyel" helper="Demo tahmin" />
        <Metric value={topProduct?.brandName ?? '-'} label="En güçlü marka" helper={topProduct?.productName ?? 'Veri bekleniyor'} />
      </View>
    </View>
  );
}

function Metric({ value, label, helper }: { value: string; label: string; helper: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricHelper} numberOfLines={1}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  description: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  metricCard: {
    flexBasis: '31%',
    flexGrow: 1,
    minHeight: 86,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 10,
    justifyContent: 'center',
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  metricHelper: {
    marginTop: 3,
    color: theme.colors.subtle,
    fontSize: 9,
    fontWeight: '800',
  },
});
