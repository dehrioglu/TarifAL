import { ComponentProps, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { InvestorConversionStrip } from '../../components/InvestorConversionStrip';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import {
  demoCheckoutAlternatives,
  demoCheckoutMetrics,
  demoCheckoutTrackingSteps,
  demoDeliverySlots,
  demoMarketOptions,
  demoPaymentMethods,
} from '../../data/demoCheckout';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { CartItem, Order } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MarketCheckout'>;
type IconName = ComponentProps<typeof Ionicons>['name'];

const formatPrice = (value: number) => `₺${value.toFixed(0)}`;

const getRecipeCount = (items: CartItem[]) =>
  new Set(items.map((item) => item.recipeId).filter((id) => id !== 'family-list')).size;

export function MarketCheckoutScreen({ navigation }: Props) {
  const cart = useAppStore((store) => store.cart);
  const placeOrder = useAppStore((store) => store.placeOrder);
  const { showToast, showDemoModal } = useFeedback();
  const [address, setAddress] = useState('Saran Holding');
  const [selectedMarketId, setSelectedMarketId] = useState(demoMarketOptions[0].id);
  const [selectedSlotId, setSelectedSlotId] = useState(demoDeliverySlots[0].id);
  const [selectedPaymentId, setSelectedPaymentId] = useState(demoPaymentMethods[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const checkoutItems = confirmedOrder?.items ?? cart;
  const selectedMarket =
    demoMarketOptions.find((market) => market.id === selectedMarketId) ?? demoMarketOptions[0];
  const selectedSlot =
    demoDeliverySlots.find((slot) => slot.id === selectedSlotId) ?? demoDeliverySlots[0];
  const selectedPayment =
    demoPaymentMethods.find((payment) => payment.id === selectedPaymentId) ?? demoPaymentMethods[0];

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);
  const recipeCount = useMemo(() => getRecipeCount(checkoutItems), [checkoutItems]);
  const commissionEstimate = Math.max(18, Math.round(subtotal * selectedMarket.commissionRate));
  const deliveryEstimate =
    selectedSlot.id === 'now' ? selectedMarket.deliveryEstimate : selectedSlot.estimate;
  const grandTotal = subtotal + selectedMarket.deliveryFee + selectedMarket.serviceFee;
  const firstRecipeId = confirmedOrder?.items.find((item) => item.recipeId !== 'family-list')?.recipeId;

  const handleConfirm = async () => {
    if (cart.length === 0) {
      return;
    }

    if (!address.trim()) {
      showToast('Demo siparişi oluşturmak için teslimat adresi gir.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => {
        setTimeout(resolve, 850);
      });
      const order = await placeOrder(address, {
        marketName: selectedMarket.name,
        deliveryEstimate,
        deliverySlot: selectedSlot.label,
        deliveryFee: selectedMarket.deliveryFee,
        serviceFee: selectedMarket.serviceFee,
        paymentMethod: selectedPayment.label,
        commissionEstimate,
        averageBasket: demoCheckoutMetrics.averageBasket,
        conversionRate: demoCheckoutMetrics.conversionRate,
      });
      setConfirmedOrder(order);
      showToast('Demo sipariş onaylandı. Sipariş takip ekranı hazır.', 'info');
    } catch (error) {
      showDemoModal({
        title: 'Sipariş tamamlanamadı',
        message: error instanceof Error ? error.message : 'Tekrar deneyin.',
        primaryLabel: 'Tamam',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (checkoutItems.length === 0 && !confirmedOrder) {
    return (
      <Screen contentStyle={styles.emptyContent}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.86}
            accessibilityRole="button"
            accessibilityLabel="Geri dön"
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Akıllı Sipariş</Text>
          <View style={styles.backGhost} />
        </View>
        <EmptyState
          icon="bag-outline"
          title="Sepette ürün yok"
          text="Önce tarif eksiklerini veya Ev Listesi ürünlerini sepete ekle, ardından sipariş akışını başlat."
        />
        <AppButton title="Akıllı Sepet Oluştur" icon="sparkles" onPress={() => navigation.navigate('SmartBasket')} />
      </Screen>
    );
  }

  if (confirmedOrder) {
    return (
      <Screen scroll contentStyle={styles.content}>
        <View style={styles.successHero}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={34} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Sipariş akışın hazır</Text>
          <Text style={styles.successText}>
            Eksik ürünler market sepetine dönüştürüldü. Bu MVP demosunda ödeme simüle edildi.
          </Text>
          <View style={styles.successStats}>
            <View style={styles.successStat}>
              <Text style={styles.successValue}>{selectedMarket.name}</Text>
              <Text style={styles.successLabel}>Market</Text>
            </View>
            <View style={styles.successStat}>
              <Text style={styles.successValue}>{deliveryEstimate}</Text>
              <Text style={styles.successLabel}>Teslimat</Text>
            </View>
            <View style={styles.successStat}>
              <Text style={styles.successValue}>{formatPrice(confirmedOrder.total)}</Text>
              <Text style={styles.successLabel}>Toplam</Text>
            </View>
          </View>
        </View>

        <View style={styles.trackingCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Sipariş takip</Text>
              <Text style={styles.sectionSubtitle}>Tariften alışverişe dönüşüm net şekilde görünsün.</Text>
            </View>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>Demo</Text>
            </View>
          </View>
          {demoCheckoutTrackingSteps.map((step, index) => {
            const isLast = index === demoCheckoutTrackingSteps.length - 1;

            return (
              <View key={step.id} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, index <= 1 && styles.timelineDotActive]}>
                    <Ionicons
                      name={step.icon as IconName}
                      size={16}
                      color={index <= 1 ? '#FFFFFF' : theme.colors.subtle}
                    />
                  </View>
                  {!isLast ? <View style={styles.timelineLine} /> : null}
                </View>
                <View style={styles.timelineCopy}>
                  <Text style={styles.timelineTitle}>{step.title}</Text>
                  <Text style={styles.timelineText}>{step.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.investorCard}>
          <Text style={styles.sectionTitle}>Yatırımcı görünümü</Text>
          <View style={styles.metricGrid}>
            <Metric label="Tahmini komisyon" value={formatPrice(commissionEstimate)} />
            <Metric label="Sepete dönüşüm" value={`%${demoCheckoutMetrics.conversionRate}`} />
            <Metric label="Tekrar potansiyeli" value={`%${demoCheckoutMetrics.repeatPotential}`} />
          </View>
        </View>

        <View style={styles.successActions}>
          <AppButton
            title="Sipariş Detayları"
            icon="receipt-outline"
            variant="soft"
            onPress={() =>
              showDemoModal({
                title: 'Demo sipariş detayları',
                message: `${confirmedOrder.items.length} ürün ${confirmedOrder.marketName ?? selectedMarket.name} ile eşleşti. Bu işlem gerçek markete iletilmedi; yatırımcı demosu için simüle edildi.`,
                primaryLabel: 'Tamam',
              })
            }
          />
          {firstRecipeId ? (
            <AppButton
              title="Tarifi Pişirmeye Geç"
              icon="restaurant"
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: firstRecipeId, openCooking: true })}
            />
          ) : null}
          <AppButton
            title="Ana Sayfaya Dön"
            icon="home-outline"
            variant="soft"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Akıllı Sipariş</Text>
        <View style={styles.backGhost} />
      </View>

      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
          <Text style={styles.heroBadgeText}>TarifAL ticari demo akışı</Text>
        </View>
        <Text style={styles.heroTitle}>Tarifi market siparişine dönüştür</Text>
        <Text style={styles.heroText}>
          Sepetteki eksikler marketle eşleşir, teslimat zamanı seçilir ve mock ödeme ile sipariş takip akışı başlar.
        </Text>
        <View style={styles.heroStats}>
          <Metric label="Ürün" value={`${itemCount}`} />
          <Metric label="Tarif" value={`${recipeCount || 1}`} />
          <Metric label="Tahmini sepet" value={formatPrice(subtotal)} />
        </View>
      </View>

      <View style={styles.stepPills}>
        <StepPill active label="1 Market" />
        <StepPill active label="2 Teslimat" />
        <StepPill active label="3 Demo ödeme" />
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Market seçimi</Text>
            <Text style={styles.sectionSubtitle}>Demo market gelir modeli burada görünür.</Text>
          </View>
          <Ionicons name="storefront-outline" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.marketList}>
          {demoMarketOptions.map((market) => {
            const selected = selectedMarketId === market.id;

            return (
              <TouchableOpacity
                key={market.id}
                onPress={() => setSelectedMarketId(market.id)}
                activeOpacity={0.86}
                style={[styles.marketCard, selected && styles.marketCardActive]}
              >
                <View style={styles.marketTop}>
                  <View style={[styles.marketIcon, selected && styles.marketIconActive]}>
                    <Ionicons name="bag-handle-outline" size={18} color={selected ? '#FFFFFF' : theme.colors.primary} />
                  </View>
                  <View style={styles.marketCopy}>
                    <Text style={styles.marketName}>{market.name}</Text>
                    <Text style={styles.marketDescription}>{market.description}</Text>
                  </View>
                  <View style={styles.marketBadge}>
                    <Text style={styles.marketBadgeText}>{market.badge}</Text>
                  </View>
                </View>
                <View style={styles.marketMetaRow}>
                  <Text style={styles.marketMeta}>⭐ {market.rating}</Text>
                  <Text style={styles.marketMeta}>{market.deliveryEstimate}</Text>
                  <Text style={styles.marketMeta}>{formatPrice(market.deliveryFee)} teslimat</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Teslimat zamanı</Text>
            <Text style={styles.sectionSubtitle}>Kullanıcının yemek planına göre teslimat seçilir.</Text>
          </View>
          <Ionicons name="time-outline" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.slotGrid}>
          {demoDeliverySlots.map((slot) => {
            const selected = selectedSlotId === slot.id;

            return (
              <TouchableOpacity
                key={slot.id}
                onPress={() => setSelectedSlotId(slot.id)}
                activeOpacity={0.86}
                style={[styles.slotCard, selected && styles.slotCardActive]}
              >
                <Text style={[styles.slotLabel, selected && styles.slotLabelActive]}>{slot.label}</Text>
                <Text style={styles.slotHelper}>{slot.helper}</Text>
                <Text style={styles.slotEstimate}>{slot.id === 'now' ? selectedMarket.deliveryEstimate : slot.estimate}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Akıllı alternatifler</Text>
            <Text style={styles.sectionSubtitle}>Sepet optimizasyonu yatırımcıya ticari zekayı gösterir.</Text>
          </View>
          <Ionicons name="options-outline" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.alternativeList}>
          {demoCheckoutAlternatives.map((alternative) => (
            <View key={alternative.id} style={styles.alternativeRow}>
              <View style={styles.alternativeDot} />
              <View style={styles.alternativeCopy}>
                <Text style={styles.alternativeTitle}>{alternative.title}</Text>
                <Text style={styles.alternativeText}>{alternative.description}</Text>
              </View>
              <Text style={styles.alternativeValue}>{alternative.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Teslimat ve ödeme</Text>
            <Text style={styles.sectionSubtitle}>Gerçek ödeme yok; MVP demosu güvenli şekilde simüle edilir.</Text>
          </View>
          <Ionicons name="card-outline" size={22} color={theme.colors.primary} />
        </View>
        <Text style={styles.inputLabel}>Teslimat adresi</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Adres gir"
          placeholderTextColor={theme.colors.subtle}
          style={styles.addressInput}
        />
        <View style={styles.paymentList}>
          {demoPaymentMethods.map((payment) => {
            const selected = selectedPaymentId === payment.id;

            return (
              <TouchableOpacity
                key={payment.id}
                onPress={() => setSelectedPaymentId(payment.id)}
                activeOpacity={0.86}
                style={[styles.paymentRow, selected && styles.paymentRowActive]}
              >
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selected ? theme.colors.primary : theme.colors.subtle}
                />
                <View style={styles.paymentCopy}>
                  <Text style={styles.paymentTitle}>{payment.label}</Text>
                  <Text style={styles.paymentText}>{payment.helper}</Text>
                </View>
                <Text style={styles.paymentBadge}>{payment.badge}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Sipariş özeti</Text>
            <Text style={styles.sectionSubtitle}>{selectedMarket.name} • {deliveryEstimate}</Text>
          </View>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>Simülasyon</Text>
          </View>
        </View>
        <SummaryRow label="Ürün toplamı" value={`₺${subtotal.toFixed(2)}`} />
        <SummaryRow label="Teslimat" value={`₺${selectedMarket.deliveryFee.toFixed(2)}`} />
        <SummaryRow label="Hizmet bedeli" value={`₺${selectedMarket.serviceFee.toFixed(2)}`} />
        <View style={styles.summaryDivider} />
        <SummaryRow label="Genel toplam" value={`₺${grandTotal.toFixed(2)}`} strong />
        <View style={styles.metricGrid}>
          <Metric label="Tahmini komisyon" value={formatPrice(commissionEstimate)} />
          <Metric label="Sepete dönüşüm" value={`%${demoCheckoutMetrics.conversionRate}`} />
          <Metric label="Ort. sepet" value={formatPrice(demoCheckoutMetrics.averageBasket)} />
        </View>
        <AppButton
          title="Ürünleri Düzenle"
          icon="cart-outline"
          variant="soft"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
        />
        <AppButton
          title={submitting ? 'Demo sipariş hazırlanıyor...' : 'Demo Siparişi Onayla'}
          icon="bag-check"
          loading={submitting}
          onPress={handleConfirm}
        />
        <Text style={styles.mockText}>* Bu MVP demosunda gerçek ödeme alınmaz.</Text>
      </View>

      <InvestorConversionStrip compact />
    </Screen>
  );
}

function StepPill({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.stepPill, active && styles.stepPillActive]}>
      <Text style={[styles.stepPillText, active && styles.stepPillTextActive]}>{label}</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, strong && styles.summaryStrong]}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryTotal]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingTop: 12,
  },
  emptyContent: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingTop: 12,
    gap: 18,
  },
  topBar: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGhost: {
    width: 42,
    height: 42,
  },
  topTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  hero: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 18,
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBadgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '900',
  },
  heroText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 8,
  },
  stepPills: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  stepPill: {
    flex: 1,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    paddingVertical: 10,
    alignItems: 'center',
  },
  stepPillActive: {
    backgroundColor: theme.colors.primary,
  },
  stepPillText: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  stepPillTextActive: {
    color: '#FFFFFF',
  },
  card: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 15,
    gap: 13,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  sectionSubtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  marketList: {
    gap: 10,
  },
  marketCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 10,
  },
  marketCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFF8F4',
  },
  marketTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  marketIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketIconActive: {
    backgroundColor: theme.colors.primary,
  },
  marketCopy: {
    flex: 1,
  },
  marketName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  marketDescription: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  marketBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  marketBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  marketMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  marketMeta: {
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  slotGrid: {
    gap: 10,
  },
  slotCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
  },
  slotCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  slotLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  slotLabelActive: {
    color: theme.colors.primary,
  },
  slotHelper: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  slotEstimate: {
    marginTop: 8,
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  alternativeList: {
    gap: 10,
  },
  alternativeRow: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alternativeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  alternativeCopy: {
    flex: 1,
  },
  alternativeTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  alternativeText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  alternativeValue: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  addressInput: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    color: theme.colors.text,
    fontWeight: '700',
  },
  paymentList: {
    gap: 10,
  },
  paymentRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentRowActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFF8F4',
  },
  paymentCopy: {
    flex: 1,
  },
  paymentTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  paymentText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  paymentBadge: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  summaryCard: {
    marginTop: 14,
    borderRadius: 26,
    backgroundColor: theme.colors.primarySoft,
    padding: 16,
    gap: 11,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  summaryStrong: {
    color: theme.colors.text,
    fontSize: 15,
  },
  summaryTotal: {
    color: theme.colors.primary,
    fontSize: 18,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#FFD8C4',
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    minHeight: 62,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 10,
    justifyContent: 'center',
  },
  metricValue: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  mockText: {
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  demoBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  demoBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  successHero: {
    borderRadius: 30,
    backgroundColor: theme.colors.text,
    padding: 20,
    gap: 13,
    ...theme.shadow,
  },
  successIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
  },
  successText: {
    color: '#D6DAE5',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  successStats: {
    flexDirection: 'row',
    gap: 8,
  },
  successStat: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
  },
  successValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  successLabel: {
    marginTop: 4,
    color: '#B8C0CF',
    fontSize: 10,
    fontWeight: '800',
  },
  trackingCard: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 15,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 11,
    marginTop: 14,
  },
  timelineRail: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: theme.colors.border,
  },
  timelineCopy: {
    flex: 1,
    paddingBottom: 5,
  },
  timelineTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  timelineText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  investorCard: {
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#FFE0CF',
    padding: 15,
    gap: 12,
  },
  successActions: {
    marginTop: 14,
    gap: 10,
  },
});
