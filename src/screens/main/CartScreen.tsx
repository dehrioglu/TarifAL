import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../components/AppButton';
import { CartItemCard } from '../../components/CartItemCard';
import { DataSyncBanner } from '../../components/DataSyncBanner';
import { DualBasketTabs } from '../../components/DualBasketTabs';
import { EmptyState } from '../../components/EmptyState';
import { FeedbackPromptButton } from '../../components/FeedbackPromptButton';
import { InvestorConversionStrip } from '../../components/InvestorConversionStrip';
import { PriceBreakdownCard } from '../../components/PriceBreakdownCard';
import { Screen } from '../../components/Screen';
import { SponsoredProductCard } from '../../components/SponsoredProductCard';
import { theme } from '../../constants/theme';
import { demoMarketOptions } from '../../data/demoCheckout';
import { demoSmartBasketMarket } from '../../data/demoSmartBasket';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import {
  getSponsoredProductsForCart,
  trackSponsoredClick,
  trackSponsoredImpression,
} from '../../services/sponsoredPlacementService';
import { useAppStore } from '../../store/useAppStore';
import { isFounderUser } from '../../utils/profileIdentity';

export function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Cart'>>();
  const { showToast, showDemoModal } = useFeedback();
  const user = useAppStore((store) => store.user);
  const profile = useAppStore((store) => store.profile);
  const cart = useAppStore((store) => store.cart);
  const restaurantCart = useAppStore((store) => store.restaurantCart);
  const orders = useAppStore((store) => store.orders);
  const dataError = useAppStore((store) => store.dataError);
  const incrementCartItem = useAppStore((store) => store.incrementCartItem);
  const decrementCartItem = useAppStore((store) => store.decrementCartItem);
  const removeCartItem = useAppStore((store) => store.removeCartItem);
  const clearCart = useAppStore((store) => store.clearCart);
  const addSponsoredProductToCart = useAppStore((store) => store.addSponsoredProductToCart);
  const incrementRestaurantItem = useAppStore((store) => store.incrementRestaurantItem);
  const decrementRestaurantItem = useAppStore((store) => store.decrementRestaurantItem);
  const removeRestaurantItem = useAppStore((store) => store.removeRestaurantItem);
  const clearRestaurantCart = useAppStore((store) => store.clearRestaurantCart);
  const [activeBasket, setActiveBasket] = useState<'market' | 'restaurant'>('market');
  const [selectedMarketId, setSelectedMarketId] = useState(demoMarketOptions[0].id);
  const [address, setAddress] = useState('Ev adresi');
  const [feedback, setFeedback] = useState('');
  const isFounderAccount = isFounderUser(user);
  const showTestingTools = Boolean(isFounderAccount || profile?.isBetaTester || user?.isBetaTester);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedMarket =
    demoMarketOptions.find((market) => market.id === selectedMarketId) ?? demoMarketOptions[0];
  const adjustedTotal = total * selectedMarket.priceMultiplier;
  const marketSavings = Math.max(0, total - adjustedTotal);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const restaurantCount = restaurantCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCount = count + restaurantCount;
  const restaurantSubtotal = restaurantCart.reduce(
    (sum, item) => sum + item.portionPrice * item.quantity,
    0,
  );
  const restaurantDeliveryFee = restaurantCart.length > 0
    ? Math.max(...restaurantCart.map((item) => item.deliveryFee))
    : 0;
  const restaurantCommission = restaurantCart.reduce((sum, item) => sum + item.commissionEstimate, 0);
  const deliveryFee = cart.length > 0 ? selectedMarket.deliveryFee : 0;
  const grandTotal = adjustedTotal + deliveryFee;
  const recipeCount = useMemo(() => new Set(cart.map((item) => item.recipeId)).size, [cart]);
  const smartBasketItems = useMemo(
    () => cart.filter((item) => item.source === 'smartBasket'),
    [cart],
  );
  const familyListItems = useMemo(
    () => cart.filter((item) => item.source === 'familyList'),
    [cart],
  );
  const smartBasketTotal = smartBasketItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const familyListTotal = familyListItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasSmartBasketItems = smartBasketItems.length > 0;
  const hasFamilyListItems = familyListItems.length > 0;
  const estimatedCommission = Math.max(
    18,
    Math.round(smartBasketTotal * demoSmartBasketMarket.commissionRate),
  );
  const sponsoredCartProduct = useMemo(
    () => getSponsoredProductsForCart(cart, 1)[0],
    [cart],
  );

  useEffect(() => {
    if (route.params?.activeBasket) {
      setActiveBasket(route.params.activeBasket);
    }
  }, [route.params?.activeBasket]);

  useEffect(() => {
    if (activeBasket !== 'market' || !sponsoredCartProduct) {
      return;
    }

    trackSponsoredImpression(sponsoredCartProduct, 'cart', {
      userId: user?.id,
      userEmail: user?.email,
      sourceScreen: 'CartScreen',
      isDemoMode: user?.isDemo,
    });
  }, [activeBasket, sponsoredCartProduct, user?.email, user?.id, user?.isDemo]);

  const handleConfirm = () => {
    if (cart.length === 0) {
      setFeedback('Önce bir tariften eksik malzemeleri sepete ekle.');
      showToast('Sepetin boş. Önce eksik malzemeleri sepete eklemelisin.', 'warning');
      return;
    }

    navigation.navigate('MarketCheckout', { marketId: selectedMarket.id });
  };

  const handleClearCart = () => {
    if (activeBasket === 'restaurant') {
      clearRestaurantCart();
      setFeedback('Restoran sepeti boşaltıldı.');
      showToast('Restoran sepeti boşaltıldı.', 'info');
      return;
    }

    clearCart();
    setFeedback('Sepet boşaltıldı.');
    showToast('Sepet boşaltıldı.', 'info');
  };

  const handleTransform = () => {
    if (cart.length === 0) {
      setFeedback('Önce bir tariften eksik malzemeleri sepete ekle.');
      showToast('Sepetin boş. Akıllı Sipariş için ürün eklemelisin.', 'warning');
      return;
    }

    navigation.navigate('MarketCheckout', { marketId: selectedMarket.id });
  };

  const handleRestaurantConfirm = () => {
    if (restaurantCart.length === 0) {
      showToast('Restoran sepetin boş. Hazır yemek seçeneğinden ürün ekleyebilirsin.', 'warning');
      return;
    }

    showDemoModal({
      title: 'Restoran siparişi hazırlandı',
      message:
        'Bu aşamada restorana sipariş iletilmez. Hazır yemek akışı test modunda tamamlanır.',
      primaryLabel: 'Ana Sayfaya Dön',
      secondaryLabel: 'Sepette Kal',
      onPrimary: () => navigation.navigate('MainTabs', { screen: 'Home' }),
    });
  };

  const handleSponsoredCartAdd = () => {
    if (!sponsoredCartProduct) {
      return;
    }

    trackSponsoredClick(sponsoredCartProduct, 'cart', {
      userId: user?.id,
      userEmail: user?.email,
      sourceScreen: 'CartScreen',
      isDemoMode: user?.isDemo,
    });
    addSponsoredProductToCart(sponsoredCartProduct, { placementType: 'cart' });
    showToast(`${sponsoredCartProduct.productName} sepete eklendi.`, 'success');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>TarifAL Sepet</Text>
          <Text style={styles.subtitle}>
            {activeBasket === 'market' && cart.length > 0
              ? `Bu sepet ${recipeCount || 1} tarif için oluşturuldu.`
              : `${totalCount} kalem`}
          </Text>
        </View>
        {(activeBasket === 'market' ? cart.length : restaurantCart.length) > 0 ? (
          <TouchableOpacity onPress={handleClearCart} activeOpacity={0.85} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>
              {activeBasket === 'market' ? 'Sepeti Boşalt' : 'Restoranı Boşalt'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <DualBasketTabs
        active={activeBasket}
        marketCount={count}
        restaurantCount={restaurantCount}
        onChange={setActiveBasket}
      />

      <DataSyncBanner message={dataError} />
      {showTestingTools ? (
        <View style={styles.feedbackWrap}>
          <FeedbackPromptButton screenName="CartScreen" compact />
        </View>
      ) : null}

      {activeBasket === 'restaurant' ? (
        <>
          <View style={styles.restaurantCard}>
            <View style={styles.restaurantHeader}>
              <View style={styles.restaurantIcon}>
                <Ionicons name="restaurant-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.restaurantCopy}>
                <Text style={styles.restaurantTitle}>Hazır yemek sepeti</Text>
                <Text style={styles.restaurantSubtitle}>
                  Restoran siparişi ayrı tutulur; market malzemeleriyle karışmaz.
                </Text>
              </View>
            </View>
            <View style={styles.conversionStats}>
              <View style={styles.conversionStat}>
                <Text style={styles.statValue}>₺{restaurantSubtotal.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Restoran sepeti</Text>
              </View>
              <View style={styles.conversionStat}>
                <Text style={styles.statValue}>₺{restaurantDeliveryFee.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Teslimat</Text>
              </View>
              <View style={styles.conversionStat}>
                <Text style={styles.statValue}>{restaurantCart.length}</Text>
                <Text style={styles.statLabel}>Restoran</Text>
              </View>
            </View>
          </View>

          <View style={styles.list}>
            {restaurantCart.length === 0 ? (
              <EmptyState
                icon="restaurant-outline"
                title="Restoran sepeti boş"
                text="Tarif detayında Hazır Sipariş Et seçeneğinden restoran ekleyebilirsin."
              />
            ) : (
              restaurantCart.map((item) => (
                <View key={item.id} style={styles.restaurantItem}>
                  <View style={styles.restaurantItemTop}>
                    <View style={styles.restaurantItemIcon}>
                      <Ionicons name="fast-food-outline" size={19} color={theme.colors.primary} />
                    </View>
                    <View style={styles.restaurantItemCopy}>
                      <Text style={styles.restaurantItemTitle} numberOfLines={1}>{item.recipeTitle}</Text>
                      <Text style={styles.restaurantItemMeta} numberOfLines={1}>
                        {item.restaurantName} • {item.deliveryEstimate}
                      </Text>
                    </View>
                    <Text style={styles.restaurantItemPrice}>₺{(item.portionPrice * item.quantity).toFixed(2)}</Text>
                  </View>
                  <View style={styles.restaurantItemBottom}>
                    <View style={styles.qtyControl}>
                      <TouchableOpacity onPress={() => decrementRestaurantItem(item.id)} style={styles.qtyButton}>
                        <Ionicons name="remove" size={15} color={theme.colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => incrementRestaurantItem(item.id)} style={styles.qtyButton}>
                        <Ionicons name="add" size={15} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        removeRestaurantItem(item.id);
                        showToast(`${item.recipeTitle} restoran sepetinden silindi.`, 'info');
                      }}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                      <Text style={styles.removeText}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          <PriceBreakdownCard
            subtotal={restaurantSubtotal}
            deliveryFee={restaurantDeliveryFee}
            commissionEstimate={isFounderAccount ? restaurantCommission : 0}
            totalLabel="Restoran toplamı"
          />
          <AppButton
            title="Restoran Siparişini Onayla"
            icon="restaurant"
            onPress={handleRestaurantConfirm}
            disabled={restaurantCart.length === 0}
          />
          <Text style={styles.mockText}>* Bu aşamada ödeme alınmaz; restoran siparişi test modunda tamamlanır.</Text>
        </>
      ) : (
        <>

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
                ? `${recipeCount} tariften gelen eksikler ${selectedMarket.name} sepetine hazırlandı.`
                : 'Eksikleri sepete eklediğinde market seçenekleri burada görünür.'}
            </Text>
          </View>
        </View>
        <View style={styles.conversionStats}>
          <View style={styles.conversionStat}>
            <Text style={styles.statValue}>₺{adjustedTotal.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Tahmini sepet</Text>
          </View>
          <View style={styles.conversionStat}>
            <Text style={styles.statValue}>30-45 dk</Text>
            <Text style={styles.statLabel}>Teslimat</Text>
          </View>
          <View style={styles.conversionStat}>
            <Text style={styles.statValue}>{selectedMarket.name}</Text>
            <Text style={styles.statLabel}>Market eşleşmesi</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleTransform} activeOpacity={0.86} style={styles.transformButton}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          <Text style={styles.transformButtonText}>Alışverişe Dönüştür</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.marketCompareCard}>
        <View style={styles.marketCompareHeader}>
          <View>
            <Text style={styles.marketCompareTitle}>Market seçimi</Text>
            <Text style={styles.marketCompareText}>Fiyat ve teslimat farkını siparişten önce karşılaştır.</Text>
          </View>
          <Ionicons name="storefront-outline" size={21} color={theme.colors.primary} />
        </View>
        <View style={styles.marketOptions}>
          {demoMarketOptions.map((market) => {
            const selected = market.id === selectedMarket.id;
            return (
              <TouchableOpacity
                key={market.id}
                onPress={() => {
                  setSelectedMarketId(market.id);
                  showToast(`${market.name} seçildi.`, 'info');
                }}
                activeOpacity={0.84}
                style={[styles.marketOption, selected && styles.marketOptionActive]}
              >
                <Text style={[styles.marketOptionName, selected && styles.marketOptionNameActive]}>{market.name}</Text>
                <Text style={styles.marketOptionMeta}>{market.deliveryEstimate}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.marketSaving}>
          <Ionicons name="pricetag-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.marketSavingText}>
            {selectedMarket.id === 'a101'
              ? `A101 seçimiyle yaklaşık ₺${Math.max(18, Math.round(marketSavings))} tasarruf edebilirsin.`
              : 'A101 seçersen yaklaşık ₺18 daha ucuz bir sepet oluşturabilirsin.'}
          </Text>
        </View>
      </View>

      {sponsoredCartProduct ? (
        <SponsoredProductCard
          product={sponsoredCartProduct}
          title="Sepetine uygun tamamlayıcı"
          subtitle="Sepetindeki tarif ve eksik ürünlere göre önerildi."
          onAddToCart={handleSponsoredCartAdd}
        />
      ) : null}

      {hasSmartBasketItems ? (
        <View style={styles.smartBasketCard}>
          <View style={styles.smartBasketHeader}>
            <View style={styles.smartBasketIcon}>
              <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.smartBasketCopy}>
              <Text style={styles.smartBasketTitle}>Akıllı Sepet'ten aktarıldı</Text>
              <Text style={styles.smartBasketSubtitle}>
                 {smartBasketItems.length} ürün market sepetine dönüştü.
              </Text>
            </View>
          </View>
          <View style={styles.smartBasketStats}>
            <View style={styles.smartBasketStat}>
              <Text style={styles.smartBasketValue}>₺{smartBasketTotal.toFixed(0)}</Text>
              <Text style={styles.smartBasketLabel}>Ürün toplamı</Text>
            </View>
            {isFounderAccount ? (
              <View style={styles.smartBasketStat}>
                <Text style={styles.smartBasketValue}>₺{estimatedCommission}</Text>
                <Text style={styles.smartBasketLabel}>Tahmini komisyon</Text>
              </View>
            ) : null}
            <View style={styles.smartBasketStat}>
              <Text style={styles.smartBasketValue}>{demoSmartBasketMarket.deliveryEstimate}</Text>
              <Text style={styles.smartBasketLabel}>Teslimat</Text>
            </View>
          </View>
          {isFounderAccount ? <InvestorConversionStrip compact /> : null}
        </View>
      ) : null}

      {hasFamilyListItems ? (
        <View style={styles.familyCard}>
          <View style={styles.smartBasketHeader}>
            <View style={styles.familyIcon}>
              <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.smartBasketCopy}>
              <Text style={styles.smartBasketTitle}>Ev Listesi'nden aktarıldı</Text>
              <Text style={styles.smartBasketSubtitle}>
                {familyListItems.length} ortak liste ürünü aile hesabından market sepetine eklendi.
              </Text>
            </View>
          </View>
          <View style={styles.smartBasketStats}>
            <View style={styles.smartBasketStat}>
              <Text style={styles.smartBasketValue}>₺{familyListTotal.toFixed(0)}</Text>
              <Text style={styles.smartBasketLabel}>Ortak liste</Text>
            </View>
            <View style={styles.smartBasketStat}>
              <Text style={styles.smartBasketValue}>{familyListItems.length}</Text>
              <Text style={styles.smartBasketLabel}>Ürün</Text>
            </View>
            <View style={styles.smartBasketStat}>
              <Text style={styles.smartBasketValue}>Ev hesabı</Text>
              <Text style={styles.smartBasketLabel}>Kaynak</Text>
            </View>
          </View>
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
              onRemove={() => {
                removeCartItem(item.id);
                showToast(`${item.name} sepetten silindi.`, 'info');
              }}
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
          <Text style={styles.summaryValue}>₺{adjustedTotal.toFixed(2)}</Text>
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
        title="Akıllı Siparişi Tamamla"
        icon="bag-check"
        onPress={handleConfirm}
        disabled={cart.length === 0}
      />
      <Text style={styles.mockText}>* Bu aşamada ödeme alınmaz; sipariş akışı test modunda tamamlanır.</Text>

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
                <Text style={styles.orderId} numberOfLines={1}>#{order.orderNumber ?? order.id.replace('order-', '')}</Text>
                <Text style={styles.orderTotal}>₺{order.total.toFixed(2)}</Text>
              </View>
              <Text style={styles.orderMeta} numberOfLines={1}>
                {order.items.length} ürün • {order.marketName ?? 'TarifAL Market'} • {new Date(order.createdAt).toLocaleDateString('tr-TR')}
              </Text>
              <Text style={styles.orderAddress} numberOfLines={2}>{order.address}</Text>
            </View>
          ))
        )}
      </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
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
  feedbackWrap: {
    marginTop: 12,
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
  restaurantCard: {
    marginTop: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 16,
    gap: 14,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  restaurantIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantCopy: {
    flex: 1,
  },
  restaurantTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  restaurantSubtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  restaurantItem: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 13,
    gap: 12,
  },
  restaurantItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  restaurantItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantItemCopy: {
    flex: 1,
  },
  restaurantItemTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  restaurantItemMeta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  restaurantItemPrice: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  restaurantItemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    minWidth: 18,
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '900',
  },
  removeButton: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  removeText: {
    color: theme.colors.danger,
    fontSize: 11,
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
  familyCard: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  familyIcon: {
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
  marketCompareCard: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  marketCompareHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  marketCompareTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  marketCompareText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  marketOptions: {
    flexDirection: 'row',
    gap: 7,
  },
  marketOption: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  marketOptionName: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  marketOptionNameActive: {
    color: theme.colors.primary,
  },
  marketOptionMeta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  marketSaving: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  marketSavingText: {
    flex: 1,
    color: theme.colors.primary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
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
