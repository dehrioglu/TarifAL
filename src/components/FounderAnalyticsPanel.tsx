import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { fetchFounderAnalyticsSummary } from '../services/analyticsService';
import { AnalyticsMetricSummary } from '../types';

const formatPrice = (value: number) => `₺${value.toLocaleString('tr-TR')}`;

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
};

function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricHelper}>{helper}</Text>
    </View>
  );
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.progressBlock}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>%{value}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, value))}%` }]} />
      </View>
    </View>
  );
}

function RecipeRankList({
  title,
  items,
}: {
  title: string;
  items: AnalyticsMetricSummary['topOpenedRecipes'];
}) {
  return (
    <View style={styles.rankBlock}>
      <Text style={styles.rankTitle}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptySmall}>Henüz veri yok.</Text>
      ) : (
        items.map((item, index) => (
          <View key={`${item.recipeTitle}-${index}`} style={styles.rankRow}>
            <View style={styles.rankNumber}>
              <Text style={styles.rankNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.rankName} numberOfLines={1}>{item.recipeTitle}</Text>
            <Text style={styles.rankCount}>{item.count}</Text>
          </View>
        ))
      )}
    </View>
  );
}

export function FounderAnalyticsPanel() {
  const [summary, setSummary] = useState<AnalyticsMetricSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    setLoading(true);
    setError('');

    try {
      const nextSummary = await fetchFounderAnalyticsSummary();
      setSummary(nextSummary);
    } catch {
      setError('Kurucu metrikleri şu anda alınamadı. Bağlantı veya erişim ayarlarını kontrol edip tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  const hasData = Boolean(summary && summary.totalEvents > 0);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="analytics-outline" size={21} color={theme.colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Kurucu Paneli</Text>
          <Text style={styles.title}>Beta ölçümleme merkezi</Text>
          <Text style={styles.description}>
            Kullanıcı davranışı, sepete dönüşüm ve demo sipariş metrikleri burada toplanır.
          </Text>
        </View>
        <TouchableOpacity onPress={loadSummary} activeOpacity={0.84} style={styles.refreshButton}>
          <Ionicons name="refresh" size={17} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>Beta verileri okunuyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Metrikler yüklenemedi</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : !hasData || !summary ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Henüz yeterli beta verisi yok.</Text>
          <Text style={styles.emptyText}>
            Kayıt, tarif açma, favori ve checkout akışları kullanıldıkça bu panel dolacak.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.metricGrid}>
            <MetricCard label="Kullanıcı" value={`${summary.totalUsers}`} helper="Toplam hesap" />
            <MetricCard label="Event" value={`${summary.totalEvents}`} helper="Toplam davranış" />
            <MetricCard label="Tarif açılışı" value={`${summary.recipeOpenCount}`} helper="recipe_opened" />
            <MetricCard label="Favori" value={`${summary.favoriteCount}`} helper="recipe_favorited" />
            <MetricCard label="Sepet" value={`${summary.cartCreatedCount}`} helper="Sepete dönüşen aksiyon" />
            <MetricCard label="Demo sipariş" value={`${summary.checkoutCompletedCount}`} helper="Tamamlanan demo" />
            <MetricCard label="Ort. sepet" value={formatPrice(summary.averageCartTotal)} helper="Event cartTotal" />
          </View>

          <View style={styles.progressGrid}>
            <ProgressMetric label="Sepete dönüşüm" value={summary.cartConversionRate} />
            <ProgressMetric label="Checkout tamamlama" value={summary.checkoutCompletionRate} />
            <ProgressMetric label="Demo Mod kullanımı" value={summary.demoUsageRate} />
            <ProgressMetric label="Gerçek hesap kullanımı" value={summary.realAccountUsageRate} />
          </View>

          <RecipeRankList title="En çok açılan tarifler" items={summary.topOpenedRecipes} />
          <RecipeRankList title="En çok favorilenen tarifler" items={summary.topFavoritedRecipes} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 16,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 15,
    gap: 14,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyState: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '48%',
    minHeight: 84,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 12,
    justifyContent: 'center',
  },
  metricValue: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  metricHelper: {
    marginTop: 3,
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '800',
  },
  progressGrid: {
    gap: 10,
  },
  progressBlock: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  progressValue: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    marginTop: 9,
    borderRadius: 4,
    backgroundColor: theme.colors.primarySoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  rankBlock: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 9,
  },
  rankTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  emptySmall: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '800',
  },
  rankRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  rankNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  rankName: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  rankCount: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});
