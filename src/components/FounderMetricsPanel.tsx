import { ComponentProps, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, DimensionValue, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { fetchFounderAnalyticsSummary } from '../services/analyticsService';
import { getFeedbackStats } from '../services/feedbackService';
import { AnalyticsMetricSummary, FeedbackStats } from '../types';
import { AppButton } from './AppButton';
import { BrandPartnershipMetrics } from './BrandPartnershipMetrics';
import { OrderAdminPanel } from './OrderAdminPanel';

const formatCurrency = (value: number) => `₺${value.toLocaleString('tr-TR')}`;

const emptySummary: AnalyticsMetricSummary = {
  totalUsers: 0,
  totalEvents: 0,
  recipeOpenCount: 0,
  favoriteCount: 0,
  cartCreatedCount: 0,
  checkoutCompletedCount: 0,
  averageCartTotal: 0,
  cartConversionRate: 0,
  checkoutCompletionRate: 0,
  demoUsageRate: 0,
  realAccountUsageRate: 0,
  topOpenedRecipes: [],
  topFavoritedRecipes: [],
};

const emptyFeedbackStats: FeedbackStats = {
  betaTesterCount: 0,
  totalFeedback: 0,
  averageRating: 0,
  topFeedbackScreen: 'Henüz veri yok',
  mostLikedScreen: 'Henüz veri yok',
  topBugScreen: 'Henüz veri yok',
  topConfusingScreen: 'Henüz veri yok',
  recentFeedback: [],
  surveyAnswerDistribution: {},
  marketOrderIntent: {
    yes: 0,
    maybe: 0,
    no: 0,
    total: 0,
  },
};

type MetricCardProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  helper: string;
};

function MetricCard({ icon, label, value, helper }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricHelper}>{helper}</Text>
    </View>
  );
}

type ProgressLineProps = {
  label: string;
  value: number;
};

function ProgressLine({ label, value }: ProgressLineProps) {
  const width = `${Math.max(0, Math.min(100, value))}%` as DimensionValue;

  return (
    <View style={styles.progressBlock}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>%{value}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width }]} />
      </View>
    </View>
  );
}

type RankingListProps = {
  title: string;
  items: Array<{ recipeTitle: string; count: number }>;
};

function RankingList({ title, items }: RankingListProps) {
  return (
    <View style={styles.rankingBox}>
      <Text style={styles.rankingTitle}>{title}</Text>
      {items.length > 0 ? (
        items.map((item, index) => (
          <View key={`${item.recipeTitle}-${index}`} style={styles.rankingItem}>
            <Text style={styles.rankingIndex}>{index + 1}</Text>
            <Text style={styles.rankingRecipe} numberOfLines={1}>
              {item.recipeTitle}
            </Text>
            <Text style={styles.rankingCount}>{item.count}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyRanking}>Beta verisi geldikçe burada sıralama oluşacak.</Text>
      )}
    </View>
  );
}

export function FounderMetricsPanel() {
  const [summary, setSummary] = useState<AnalyticsMetricSummary>(emptySummary);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>(emptyFeedbackStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasBetaDecisionData =
    summary.totalEvents > 0 ||
    feedbackStats.totalFeedback > 0 ||
    Object.keys(feedbackStats.surveyAnswerDistribution).length > 0;

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextSummary, nextFeedbackStats] = await Promise.all([
        fetchFounderAnalyticsSummary(),
        getFeedbackStats(),
      ]);
      setSummary(nextSummary);
      setFeedbackStats(nextFeedbackStats);
    } catch {
      setError('Metrikler şu anda okunamadı. Bağlantı veya erişim ayarlarını kontrol edip tekrar dene.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="analytics-outline" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Kurucu Paneli</Text>
          <Text style={styles.title}>Beta ölçümleme özeti</Text>
          <Text style={styles.description}>
            Sadece kurucu hesabında görünür. Kullanıcı hareketlerini, geri bildirimleri ve sipariş sinyallerini karar metriklerine dönüştürür.
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>Beta metrikleri okunuyor...</Text>
        </View>
      ) : (
        <>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!hasBetaDecisionData ? (
            <View style={styles.emptyDecisionBox}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.emptyDecisionText}>Henüz yeterli beta verisi yok. İlk 10-20 test kullanıcısından sonra bu panel karar metriklerine dönüşecek.</Text>
            </View>
          ) : null}
          <View style={styles.metricGrid}>
            <MetricCard icon="people-outline" label="Kullanıcı" value={String(summary.totalUsers)} helper="Toplam hesap" />
            <MetricCard icon="pulse-outline" label="Event" value={String(summary.totalEvents)} helper="Toplam hareket" />
            <MetricCard icon="restaurant-outline" label="Tarif açılma" value={String(summary.recipeOpenCount)} helper="recipe_opened" />
            <MetricCard icon="heart-outline" label="Favori" value={String(summary.favoriteCount)} helper="favori eventleri" />
            <MetricCard icon="basket-outline" label="Sepet" value={String(summary.cartCreatedCount)} helper="sepete dönüşüm" />
            <MetricCard icon="checkmark-done-outline" label="Sipariş demosu" value={String(summary.checkoutCompletedCount)} helper="checkout tamamlandı" />
            <MetricCard
              icon="card-outline"
              label="Ortalama sepet"
              value={formatCurrency(summary.averageCartTotal)}
              helper="event cartTotal"
            />
          </View>

          <View style={styles.progressPanel}>
            <ProgressLine label="Sepete dönüşüm" value={summary.cartConversionRate} />
            <ProgressLine label="Checkout tamamlama" value={summary.checkoutCompletionRate} />
            <ProgressLine label="Demo kullanım oranı" value={summary.demoUsageRate} />
            <ProgressLine label="Gerçek hesap oranı" value={summary.realAccountUsageRate} />
          </View>

          <View style={styles.rankingGrid}>
            <RankingList title="En çok açılan tarifler" items={summary.topOpenedRecipes} />
            <RankingList title="En çok favorilenenler" items={summary.topFavoritedRecipes} />
          </View>

          <View style={styles.feedbackPanel}>
            <View style={styles.feedbackHeader}>
              <View style={styles.metricIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.feedbackTitle}>Beta Geri Bildirimleri</Text>
                <Text style={styles.feedbackDescription}>
                  Nitel kullanıcı notları, mini anketler ve beta dönüş sinyalleri.
                </Text>
              </View>
            </View>

            <View style={styles.metricGrid}>
              <MetricCard icon="rocket-outline" label="Beta kullanıcı" value={String(feedbackStats.betaTesterCount)} helper="users.isBetaTester" />
              <MetricCard icon="chatbox-outline" label="Feedback" value={String(feedbackStats.totalFeedback)} helper="Toplam not" />
              <MetricCard icon="star-outline" label="Ortalama skor" value={String(feedbackStats.averageRating)} helper="1-5 puan" />
              <MetricCard icon="storefront-outline" label="Market niyeti" value={`${feedbackStats.marketOrderIntent.yes}/${feedbackStats.marketOrderIntent.total}`} helper="Evet cevapları" />
            </View>

            <View style={styles.feedbackInsightGrid}>
              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>En çok feedback gelen ekran</Text>
                <Text style={styles.insightValue}>{feedbackStats.topFeedbackScreen}</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>En çok beğenilen</Text>
                <Text style={styles.insightValue}>{feedbackStats.mostLikedScreen}</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>En çok hata bildirilen</Text>
                <Text style={styles.insightValue}>{feedbackStats.topBugScreen}</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>En çok anlaşılmayan</Text>
                <Text style={styles.insightValue}>{feedbackStats.topConfusingScreen}</Text>
              </View>
            </View>

            <View style={styles.recentBox}>
              <Text style={styles.rankingTitle}>Son 10 geri bildirim</Text>
              {feedbackStats.recentFeedback.length > 0 ? (
                feedbackStats.recentFeedback.map((item) => (
                  <View key={item.id} style={styles.feedbackItem}>
                    <View style={styles.feedbackBadge}>
                      <Text style={styles.feedbackBadgeText}>{item.feedbackType}</Text>
                    </View>
                    <View style={styles.feedbackItemCopy}>
                      <Text style={styles.feedbackItemTitle}>{item.screenName} · {item.rating ?? '-'} / 5</Text>
                      <Text style={styles.feedbackItemText} numberOfLines={2}>
                        {item.message || 'Not yazılmadı.'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyRanking}>Henüz beta geri bildirimi yok.</Text>
              )}
            </View>

            <View style={styles.recentBox}>
              <Text style={styles.rankingTitle}>Mini anket cevap dağılımı</Text>
              {Object.keys(feedbackStats.surveyAnswerDistribution).length > 0 ? (
                Object.entries(feedbackStats.surveyAnswerDistribution).slice(0, 4).map(([question, answers]) => (
                  <View key={question} style={styles.surveyRow}>
                    <Text style={styles.surveyQuestion} numberOfLines={2}>{question}</Text>
                    <Text style={styles.surveyAnswers}>
                      {Object.entries(answers).map(([answer, count]) => `${answer}: ${count}`).join(' · ')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyRanking}>Mini anket cevabı geldikçe burada görünecek.</Text>
              )}
            </View>
          </View>
        </>
      )}

      <AppButton
        title="Metrikleri Yenile"
        icon="refresh-outline"
        variant="soft"
        loading={loading}
        onPress={() => {
          void loadSummary();
        }}
        style={styles.refreshButton}
      />

      <BrandPartnershipMetrics />

      <OrderAdminPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 16,
    gap: 16,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  loadingBox: {
    minHeight: 92,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  errorText: {
    borderRadius: 16,
    backgroundColor: '#FFF1F1',
    color: theme.colors.danger,
    padding: 12,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyDecisionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  emptyDecisionText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 132,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    padding: 12,
    justifyContent: 'space-between',
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  metricHelper: {
    marginTop: 3,
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '800',
  },
  progressPanel: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
  },
  progressBlock: {
    gap: 7,
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
    borderRadius: 999,
    backgroundColor: theme.colors.primarySoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  rankingGrid: {
    gap: 10,
  },
  rankingBox: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
  },
  rankingTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  rankingItem: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankingIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 11,
    fontWeight: '900',
  },
  rankingRecipe: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  rankingCount: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  emptyRanking: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  feedbackPanel: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feedbackTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  feedbackDescription: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  feedbackInsightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  insightCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 10,
    gap: 4,
  },
  insightLabel: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  insightValue: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  recentBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 9,
  },
  feedbackItem: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  feedbackBadge: {
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBadgeText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  feedbackItemCopy: {
    flex: 1,
  },
  feedbackItemTitle: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  feedbackItemText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  surveyRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    gap: 4,
  },
  surveyQuestion: {
    color: theme.colors.text,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
  },
  surveyAnswers: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  refreshButton: {
    minHeight: 46,
  },
});
