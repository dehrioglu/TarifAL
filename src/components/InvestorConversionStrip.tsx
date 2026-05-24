import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { demoSmartBasketMetrics } from '../data/demoSmartBasket';
import { theme } from '../constants/theme';

type InvestorConversionStripProps = {
  compact?: boolean;
};

export function InvestorConversionStrip({ compact = false }: InvestorConversionStripProps) {
  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="trending-up-outline" size={18} color={theme.colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Demo / simülasyon</Text>
          <Text style={styles.title}>Tariften market sepetine dönüşüm</Text>
        </View>
      </View>
      <View style={styles.metrics}>
        {demoSmartBasketMetrics.map((metric) => (
          <View key={metric.id} style={styles.metric}>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            {!compact ? <Text style={styles.metricHelper}>{metric.helper}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 14,
    gap: 12,
  },
  compactCard: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
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
    marginTop: 2,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metric: {
    width: '48%',
    minHeight: 70,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    padding: 10,
    justifyContent: 'center',
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  metricHelper: {
    marginTop: 2,
    color: theme.colors.subtle,
    fontSize: 9,
    fontWeight: '700',
  },
});
