import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { demoInvestorMetrics } from '../data/demoPremium';
import { theme } from '../constants/theme';

export function InvestorDemoPanel() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Yatırımcı Demo Modu</Text>
          <Text style={styles.title}>Tariften sepete dönüşüm görünümü</Text>
        </View>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>Demo</Text>
        </View>
      </View>

      <Text style={styles.description}>
        TarifAL sadece tarif göstermez; eksik ürünleri sepet fırsatına dönüştüren kişisel mutfak asistanıdır.
      </Text>

      <View style={styles.metrics}>
        {demoInvestorMetrics.map((metric) => (
          <View key={metric.id} style={styles.metric}>
            <Ionicons name={metric.icon} size={18} color={theme.colors.primary} />
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricHelper}>{metric.helper}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    width: '48%',
    minHeight: 104,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 4,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  metricHelper: {
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '700',
  },
});
