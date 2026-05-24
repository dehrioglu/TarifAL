import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../components/AppButton';
import { CartItemCard } from '../../components/CartItemCard';
import { EmptyState } from '../../components/EmptyState';
import { InvestorConversionStrip } from '../../components/InvestorConversionStrip';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { demoSmartBasketMarket } from '../../data/demoSmartBasket';
import { useAppStore } from '../../store/useAppStore';

export function CartScreen() {
  const cart = useAppStore((store) => store.cart);
  const orders = useAppStore((store) => store.orders);
  const incrementCartItem = useAppStore((store) => store.incrementCartItem);
  const decrementCartItem = useAppStore((store) => store.decrementCartItem);
  const removeCartItem = useAppStore((store) => store.removeCartItem);
  const clearCart = useAppStore((store) => store.clearCart);
  const placeOrder = useAppStore((store) => store.placeOrder);
  const [address, setAddress] = useState('Saran Holding');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 29 : 0;
  const grandTotal = total + deliveryFee;
  const recipeCount = useMemo(() => new Set(cart.map((item) => item.recipeId)).size, [cart]);
  const smartBasketItems = useMemo(
    () => cart.filter((item) => item.source === 'smartBasket'),
    [cart],
  );
  const smartBasketTotal = smartBasketItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasSmartBasketItems = smartBasketItems.length > 0;
  const estimatedCommission = Math.max(
    18,
    Math.round(smartBasketTotal * demoSmartBasketMarket.commissionRate),
  );

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await placeOrder(address);
      setFeedback('Alışveriş planın hazır. Tarif için eksik ürünler sepetine eklendi; demo sipariş oluşturuldu.');
      Alert.alert('Alışveriş planın hazır', 'Bu MVP demosunda ödeme simüle edilmiştir.');
    } catch (error) {
      Alert.alert('Sipariş tamamlanamadı', error instanceof Error ? error.message : 'Tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setFeedback('Sepet boşaltıldı.');
  };

  const handleTransform = () => {
    if (cart.length === 0) {
      setFeedback('Önce bir tariften eksik malzemeleri sepete ekle.');
      return;
    }

    setFeedback('Tariften alışveriş listesine dönüşüm hazır. Demo Market eşleşmesi oluşturuldu.');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sepetim</Text>
          <Text style={styles.subtitle}>{count} kalem</Text>
        </View>
        {cart.length > 0 ? (
          <TouchableOpacity onPress={handleClearCart} activeOpacity={0.85} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Sepeti Boşalt</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.conversionCard}>
        <View style={styles.conversionHeader}>
          <View style={styles.conversionIcon}>
            <Ionicons name="git-compare-outline" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.conversionCopy}>
            <Text style={styles.conversionTitle}>
              {cart.length > 0 ? `Bu tarifleri yapmak için ${count} ürün eksik` : 'Tarifi alışverişe dönüştür'}
            </Text>
            <Text style={styles.conversionSubtitle}>
              {cart.length > 0
                ? `${recipeCount} tariften gelen eksikler Demo Market sepetine hazırlandı.`
                : 'Eksikleri sepete eklediğinde ticari dönüşüm akışı burada görünür.'}
            </Text>
          </View>
        </View>
        <View style={styles.conversionStats}>
          <View style={styles.conversionStat}>
            <Text style={styles.statValue}>₺{total.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Tahmini sepet</Text>
          </View>
          <View style={styles.conversionStat}>
            <Text style={styles.statValue}>30-45 dk</Text>
            <Text style={styles.statLabel}>Teslimat</Text>
          </View>
          <View style={styles.conversionStat}>
            <Text style={styles.statValue}>Demo</Text>
            <Text style={styles.statLabel}>Market eşleşmesi</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleTransform} activeOpacity={0.86} style={styles.transformButton}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          <Text style={styles.transformButtonText}>Alışverişe Dönüştür</Text>
        </TouchableOpacity>
      </View>

      {hasSmartBasketItems ? (
        <View style={styles.smartBasketCard}>
          <View style={styles.smartBasketHeader}>
            <View style={styles.smartBasketIcon}>
              <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.smartBasketCopy}>
              <Text style={styles.smartBasketTitle}>Akıllı Sepet'ten aktarıldı</Text>
              <Text style={styles.smartBasketSubtitle}>
                {smartBasketItems.length} ürün {demoSmartBasketMarket.name} eşleşmesiyle market sepetine dönüştü.
              </Text>
            </View>
          </View>
          <View style={styles.smartBasketStats}>
            <View style={styles.smartBasketStat}>
              <Text style={styles.smartBasketValue}>₺{smartBasketTotal.toFixed(0)}</Text>
              <Text style={styles.smartBasketLabel}>Ürün toplamı</Text>
            </View>
            <View style={styles.smartBasketStat}>
              <Text style={styles.smartBasketValue}>₺{estimatedCommission}</Text>
              <Text style={styles.smartBasketLabel}>Tahmini komisyon</Text>
            </View>
            <View style={styles.smartBasketStat}>
              <Text style={styles.smartBasketValue}>{demoSmartBasketMarket.deliveryEstimate}</Text>
              <Text style={styles.smartBasketLabel}>Teslimat</Text>
            </View>
          </View>
          <InvestorConversionStrip compact />
        </View>
      ) : null}

      <View style={styles.list}>
        {cart.length === 0 ? (
          <EmptyState
            icon="cart-outline"
            title="Sepetin boş"
            text="Eksikleri sepete eklediğinde ürünler burada görünecek."
          />
        ) : (
          cart.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onIncrement={() => incrementCartItem(item.id)}
              onDecrement={() => decrementCartItem(item.id)}
              onRemove={() => removeCartItem(item.id)}
            />
          ))
        )}
      </View>
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <Text style={styles.label}>Teslimat Adresi</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        multiline
        placeholder="Adres gir"
        placeholderTextColor={theme.colors.subtle}
        style={styles.address}
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ürün toplamı</Text>
          <Text style={styles.summaryValue}>₺{total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tahmini teslimat</Text>
          <Text style={styles.summaryValue}>₺{deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Genel toplam</Text>
          <Text style={styles.totalValue}>₺{grandTotal.toFixed(2)}</Text>
        </View>
      </View>

      <AppButton
        title="Siparişi Tamamla"
        icon="bag-check"
        onPress={handleConfirm}
        loading={submitting}
        disabled={cart.length === 0}
      />
      <Text style={styles.mockText}>* Bu MVP demosunda ödeme simüle edilmiştir.</Text>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Sipariş Geçmişi</Text>
        <Text style={styles.historyCount}>{orders.length} sipariş</Text>
      </View>

      <View style={styles.historyList}>
        {orders.length === 0 ? (
          <View style={styles.historyEmpty}>
            <Text style={styles.historyEmptyText}>Henüz tamamlanmış sipariş yok.</Text>
          </View>
        ) : (
          orders.slice(0, 4).map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.orderId} numberOfLines={1}>#{order.id.replace('order-', '')}</Text>
                <Text style={styles.orderTotal}>₺{order.total.toFixed(2)}</Text>
              </View>
              <Text style={styles.orderMeta} numberOfLines={1}>
                {order.items.length} ürün • {new Date(order.createdAt).toLocaleDateString('tr-TR')}
              </Text>
              <Text style={styles.orderAddress} numberOfLines={2}>{order.address}</Text>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  clearButton: {
    minHeight: 38,
    marginTop: 3,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: '900',
  },
  conversionCard: {
    marginTop: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 16,
    gap: 14,
  },
  conversionHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  conversionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversionCopy: {
    flex: 1,
  },
  conversionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  conversionSubtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  conversionStats: {
    flexDirection: 'row',
    gap: 8,
  },
  conversionStat: {
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
  transformButton: {
    minHeight: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  transformButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  smartBasketCard: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  smartBasketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  smartBasketIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartBasketCopy: {
    flex: 1,
  },
  smartBasketTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  smartBasketSubtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  smartBasketStats: {
    flexDirection: 'row',
    gap: 8,
  },
  smartBasketStat: {
    flex: 1,
    minHeight: 66,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    padding: 10,
    justifyContent: 'center',
  },
  smartBasketValue: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  smartBasketLabel: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  list: {
    marginTop: 20,
    gap: 12,
  },
  feedback: {
    marginTop: 10,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  label: {
    marginTop: 30,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  address: {
    minHeight: 64,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.text,
    textAlignVertical: 'top',
    fontWeight: '600',
  },
  summaryCard: {
    marginTop: 16,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    padding: 16,
    gap: 9,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontWeight: '800',
    fontSize: 13,
  },
  summaryValue: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 14,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#FFD8C4',
  },
  totalLabel: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 15,
  },
  totalValue: {
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 22,
  },
  mockText: {
    marginTop: 10,
    textAlign: 'center',
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '600',
  },
  historyHeader: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  historyCount: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '800',
  },
  historyList: {
    marginTop: 12,
    gap: 10,
  },
  historyEmpty: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  historyEmptyText: {
    color: theme.colors.muted,
    fontWeight: '700',
    textAlign: 'center',
  },
  orderCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 5,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderId: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  orderTotal: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  orderMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  orderAddress: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
