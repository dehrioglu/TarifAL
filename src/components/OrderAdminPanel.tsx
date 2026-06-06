import { ComponentProps, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { useFeedback } from '../feedback/FeedbackProvider';
import { trackEvent } from '../services/analyticsService';
import { getOrderStats, OrderStats, subscribeToOrders, updateOrderStatus } from '../services/ordersService';
import { useAppStore } from '../store/useAppStore';
import { Order, OrderStatus } from '../types';
import { isAdminUser } from '../utils/profileIdentity';
import { AppButton } from './AppButton';

type IconName = ComponentProps<typeof Ionicons>['name'];
type TimeFilter = 'today' | 'week' | 'all';
type DemoFilter = 'all' | 'demo' | 'real';

const statusColumns: Array<{ status: OrderStatus; title: string; icon: IconName }> = [
  { status: 'new', title: 'Yeni Sipariş', icon: 'sparkles-outline' },
  { status: 'preparing', title: 'Hazırlanıyor', icon: 'restaurant-outline' },
  { status: 'on_the_way', title: 'Teslimatta', icon: 'bicycle-outline' },
  { status: 'completed', title: 'Tamamlandı', icon: 'checkmark-done-outline' },
  { status: 'cancelled', title: 'İptal', icon: 'close-circle-outline' },
];

const statusLabels: Record<OrderStatus, string> = {
  new: 'Yeni',
  preparing: 'Hazırlanıyor',
  on_the_way: 'Teslimatta',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

const paymentLabels: Record<string, string> = {
  demo: 'Demo ödeme',
  pending: 'Beklemede',
  paid: 'Ödendi',
  failed: 'Başarısız',
  refunded: 'İade edildi',
};

const formatCurrency = (value?: number) => `₺${(value ?? 0).toLocaleString('tr-TR')}`;

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isInSelectedTime = (order: Order, filter: TimeFilter) => {
  if (filter === 'all') {
    return true;
  }

  const created = new Date(order.createdAt);
  const now = new Date();

  if (Number.isNaN(created.getTime())) {
    return false;
  }

  if (filter === 'today') {
    return created.toLocaleDateString('tr-TR') === now.toLocaleDateString('tr-TR');
  }

  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  return created >= oneWeekAgo;
};

const getOrderItemCount = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.quantity, 0);

function StatCard({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={17} color={theme.colors.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      style={[styles.filterPill, active && styles.filterPillActive]}
    >
      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNo} numberOfLines={1}>#{order.orderNumber ?? order.id}</Text>
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>{order.isDemoOrder === false ? 'Gerçek' : 'Demo'}</Text>
        </View>
      </View>
      <Text style={styles.orderUser} numberOfLines={1}>{order.userName || order.userEmail || 'TarifAL Kullanıcısı'}</Text>
      <Text style={styles.orderMeta} numberOfLines={1}>
        {getOrderItemCount(order)} ürün · {order.marketName ?? 'Demo Market'}
      </Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
        <Text style={styles.orderTime}>{formatDate(order.createdAt)}</Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusBadgeText}>{statusLabels[order.status]}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function OrderAdminPanel() {
  const user = useAppStore((store) => store.user);
  const accountMode = useAppStore((store) => store.accountMode);
  const { showToast } = useFeedback();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [demoFilter, setDemoFilter] = useState<DemoFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const isFounder = isAdminUser(user);

  useEffect(() => {
    if (!isFounder) {
      setLoading(false);
      setOrders([]);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToOrders(
      (nextOrders) => {
        setOrders(nextOrders);
        setLoading(false);
      },
      () => {
        setError('Siparişler şu anda yüklenemedi. Bağlantı veya erişim ayarlarını kontrol edip tekrar dene.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [isFounder]);

  const marketOptions = useMemo(
    () => Array.from(new Set(orders.map((order) => order.marketName).filter(Boolean))) as string[],
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('tr-TR');

    return orders.filter((order) => {
      const haystack = `${order.orderNumber ?? ''} ${order.id} ${order.userName ?? ''} ${order.userEmail ?? ''}`
        .toLocaleLowerCase('tr-TR');
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesMarket = marketFilter === 'all' || order.marketName === marketFilter;
      const matchesDemo =
        demoFilter === 'all' ||
        (demoFilter === 'demo' && (order.isDemoOrder ?? true)) ||
        (demoFilter === 'real' && order.isDemoOrder === false);
      const matchesTime = isInSelectedTime(order, timeFilter);

      return matchesSearch && matchesStatus && matchesMarket && matchesDemo && matchesTime;
    });
  }, [demoFilter, marketFilter, orders, search, statusFilter, timeFilter]);

  const stats: OrderStats = useMemo(() => getOrderStats(orders), [orders]);

  const selectedOrderFresh = useMemo(
    () => orders.find((order) => order.id === selectedOrder?.id) ?? selectedOrder,
    [orders, selectedOrder],
  );

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!selectedOrderFresh) {
      return;
    }

    setUpdatingStatus(status);

    try {
      await updateOrderStatus(selectedOrderFresh.id, status);
      await trackEvent('order_status_updated', {
        userId: user?.id,
        userEmail: user?.email,
        sourceScreen: 'OrderAdminPanel',
        isDemoMode: accountMode === 'demo',
        cartTotal: selectedOrderFresh.total,
        extraData: {
          orderId: selectedOrderFresh.id,
          orderNumber: selectedOrderFresh.orderNumber ?? selectedOrderFresh.id,
          status,
        },
      });

      if (status === 'completed') {
        await trackEvent('order_completed', {
          userId: user?.id,
          userEmail: user?.email,
          sourceScreen: 'OrderAdminPanel',
          cartTotal: selectedOrderFresh.total,
          isDemoMode: accountMode === 'demo',
          extraData: {
            orderId: selectedOrderFresh.id,
            orderNumber: selectedOrderFresh.orderNumber ?? selectedOrderFresh.id,
          },
        });
      }

      if (status === 'cancelled') {
        await trackEvent('order_cancelled', {
          userId: user?.id,
          userEmail: user?.email,
          sourceScreen: 'OrderAdminPanel',
          cartTotal: selectedOrderFresh.total,
          isDemoMode: accountMode === 'demo',
          extraData: {
            orderId: selectedOrderFresh.id,
            orderNumber: selectedOrderFresh.orderNumber ?? selectedOrderFresh.id,
          },
        });
      }

      setSelectedOrder((current) =>
        current
          ? {
              ...current,
              status,
              updatedAt: new Date().toISOString(),
              completedAt: status === 'completed' ? new Date().toISOString() : null,
            }
          : current,
      );
      showToast('Sipariş durumu güncellendi.', 'success');
    } catch {
      showToast('Sipariş durumu güncellenemedi.', 'warning');
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (!isFounder) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Siparişler</Text>
        <Text style={styles.emptyText}>Bu panel sadece kurucu/admin hesabı için görünür.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="receipt-outline" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Siparişler</Text>
          <Text style={styles.title}>Sipariş takip admin paneli</Text>
          <Text style={styles.description}>
            Demo ve gerçek siparişleri tek ekrandan takip et, durumlarını yönet ve yatırımcıya operasyon akışını göster.
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.emptyText}>Siparişler yükleniyor...</Text>
        </View>
      ) : (
        <>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {orders.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="file-tray-outline" size={28} color={theme.colors.primary} />
              <Text style={styles.emptyTitle}>Henüz sipariş yok.</Text>
              <Text style={styles.emptyText}>Akıllı Sipariş demosu tamamlandığında kayıtlar burada görünecek.</Text>
            </View>
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
            <StatCard icon="today-outline" label="Bugünkü sipariş" value={String(stats.todayOrders)} />
            <StatCard icon="receipt-outline" label="Toplam sipariş" value={String(stats.totalOrders)} />
            <StatCard icon="sparkles-outline" label="Bekleyen" value={String(stats.newOrders)} />
            <StatCard icon="restaurant-outline" label="Hazırlanıyor" value={String(stats.preparingOrders)} />
            <StatCard icon="bicycle-outline" label="Teslimatta" value={String(stats.onTheWayOrders)} />
            <StatCard icon="checkmark-done-outline" label="Tamamlandı" value={String(stats.completedOrders)} />
            <StatCard icon="close-circle-outline" label="İptal" value={String(stats.cancelledOrders)} />
            <StatCard icon="card-outline" label="Ortalama sepet" value={formatCurrency(stats.averageBasket)} />
            <StatCard icon="trending-up-outline" label="Demo ciro" value={formatCurrency(stats.totalDemoRevenue)} />
          </ScrollView>

          <View style={styles.filtersBox}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Sipariş no, kullanıcı veya e-posta ara..."
              placeholderTextColor={theme.colors.subtle}
              style={styles.searchInput}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              <FilterPill label="Tüm durumlar" active={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
              {statusColumns.map((column) => (
                <FilterPill
                  key={column.status}
                  label={statusLabels[column.status]}
                  active={statusFilter === column.status}
                  onPress={() => setStatusFilter(column.status)}
                />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              <FilterPill label="Tüm marketler" active={marketFilter === 'all'} onPress={() => setMarketFilter('all')} />
              {marketOptions.map((market) => (
                <FilterPill key={market} label={market} active={marketFilter === market} onPress={() => setMarketFilter(market)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              <FilterPill label="Tüm siparişler" active={demoFilter === 'all'} onPress={() => setDemoFilter('all')} />
              <FilterPill label="Demo" active={demoFilter === 'demo'} onPress={() => setDemoFilter('demo')} />
              <FilterPill label="Gerçek" active={demoFilter === 'real'} onPress={() => setDemoFilter('real')} />
              <FilterPill label="Bugün" active={timeFilter === 'today'} onPress={() => setTimeFilter('today')} />
              <FilterPill label="Bu hafta" active={timeFilter === 'week'} onPress={() => setTimeFilter('week')} />
              <FilterPill label="Tüm zamanlar" active={timeFilter === 'all'} onPress={() => setTimeFilter('all')} />
            </ScrollView>
          </View>

          {filteredOrders.length === 0 && orders.length > 0 ? (
            <Text style={styles.emptyText}>Bu filtrelere uygun sipariş bulunamadı.</Text>
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kanbanRow}>
            {statusColumns.map((column) => {
              const columnOrders = filteredOrders.filter((order) => order.status === column.status);

              return (
                <View key={column.status} style={styles.kanbanColumn}>
                  <View style={styles.columnHeader}>
                    <Ionicons name={column.icon} size={17} color={theme.colors.primary} />
                    <Text style={styles.columnTitle}>{column.title}</Text>
                    <Text style={styles.columnCount}>{columnOrders.length}</Text>
                  </View>
                  {columnOrders.length === 0 ? (
                    <Text style={styles.columnEmpty}>Bu kolonda sipariş yok.</Text>
                  ) : (
                    columnOrders.map((order) => (
                      <OrderCard key={order.id} order={order} onPress={() => setSelectedOrder(order)} />
                    ))
                  )}
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      <Modal
        visible={Boolean(selectedOrderFresh)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>Sipariş Detayı</Text>
                <Text style={styles.modalTitle}>#{selectedOrderFresh?.orderNumber ?? selectedOrderFresh?.id}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.84}
                onPress={() => setSelectedOrder(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedOrderFresh ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                <View style={styles.detailGrid}>
                  <Detail label="Kullanıcı" value={selectedOrderFresh.userName || 'TarifAL Kullanıcısı'} />
                  <Detail label="E-posta" value={selectedOrderFresh.userEmail || '-'} />
                  <Detail label="Tarih" value={formatDate(selectedOrderFresh.createdAt)} />
                  <Detail label="Market" value={selectedOrderFresh.marketName ?? 'Demo Market'} />
                  <Detail label="Durum" value={statusLabels[selectedOrderFresh.status]} />
                  <Detail label="Ödeme" value={paymentLabels[selectedOrderFresh.paymentStatus ?? 'demo']} />
                  <Detail label="Demo sipariş" value={selectedOrderFresh.isDemoOrder === false ? 'Hayır' : 'Evet'} />
                  <Detail label="Son güncelleme" value={formatDate(selectedOrderFresh.updatedAt)} />
                </View>

                <View style={styles.statusActions}>
                  {statusColumns.map((column) => (
                    <TouchableOpacity
                      key={column.status}
                      activeOpacity={0.84}
                      disabled={updatingStatus !== null}
                      onPress={() => {
                        void handleStatusUpdate(column.status);
                      }}
                      style={[
                        styles.statusButton,
                        selectedOrderFresh.status === column.status && styles.statusButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          selectedOrderFresh.status === column.status && styles.statusButtonTextActive,
                        ]}
                      >
                        {updatingStatus === column.status ? 'Güncelleniyor...' : statusLabels[column.status]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Ürün listesi</Text>
                  {selectedOrderFresh.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemCopy}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemMeta}>
                          {item.quantity} adet · {item.gram} gr · {item.recipeTitle}
                        </Text>
                      </View>
                      <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>İlgili tarifler</Text>
                  {(selectedOrderFresh.relatedRecipes ?? []).length > 0 ? (
                    selectedOrderFresh.relatedRecipes?.map((recipe) => (
                      <Text key={recipe.recipeId} style={styles.relatedRecipe}>• {recipe.recipeTitle}</Text>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>İlgili tarif bilgisi yok.</Text>
                  )}
                </View>

                <View style={styles.priceBox}>
                  <PriceLine label="Ara toplam" value={selectedOrderFresh.subtotal} />
                  <PriceLine label="Teslimat" value={selectedOrderFresh.deliveryFee} />
                  <PriceLine label="İndirim" value={selectedOrderFresh.discount} />
                  <PriceLine label="Genel toplam" value={selectedOrderFresh.total} strong />
                </View>

                <View style={styles.noteBox}>
                  <Text style={styles.detailTitle}>Kullanıcı notu</Text>
                  <Text style={styles.emptyText}>{selectedOrderFresh.userNote || 'Not yazılmadı.'}</Text>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function PriceLine({ label, value, strong }: { label: string; value?: number; strong?: boolean }) {
  return (
    <View style={styles.priceLine}>
      <Text style={[styles.priceLabel, strong && styles.priceStrong]}>{label}</Text>
      <Text style={[styles.priceValue, strong && styles.priceTotal]}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
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
    minHeight: 110,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyBox: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  errorText: {
    borderRadius: 16,
    backgroundColor: '#FFF1F1',
    color: theme.colors.danger,
    padding: 12,
    fontSize: 12,
    fontWeight: '800',
  },
  statsRow: {
    gap: 10,
    paddingRight: 6,
  },
  statCard: {
    width: 142,
    minHeight: 104,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE0CF',
    padding: 12,
    justifyContent: 'space-between',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  filtersBox: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 10,
  },
  searchInput: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  filterRow: {
    gap: 8,
    paddingRight: 6,
  },
  filterPill: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  filterPillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  filterPillText: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  kanbanRow: {
    gap: 12,
    paddingRight: 8,
  },
  kanbanColumn: {
    width: 260,
    minHeight: 220,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    gap: 10,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  columnTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  columnCount: {
    minWidth: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primary,
    textAlign: 'center',
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '900',
  },
  columnEmpty: {
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 12,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  orderCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 12,
    gap: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  orderNo: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  demoBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  demoBadgeText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  orderUser: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  orderMeta: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  orderTotal: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  orderTime: {
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.48)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '88%',
    alignSelf: 'center',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalEyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  modalTitle: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    gap: 12,
    paddingBottom: 10,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 70,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 10,
    justifyContent: 'center',
  },
  detailLabel: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  detailValue: {
    marginTop: 5,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  statusButtonText: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  detailSection: {
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 8,
  },
  detailTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  itemCopy: {
    flex: 1,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  itemMeta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  itemPrice: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  relatedRecipe: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  priceBox: {
    borderRadius: 18,
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#FFE0CF',
    padding: 12,
    gap: 8,
  },
  priceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  priceValue: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  priceStrong: {
    color: theme.colors.text,
    fontSize: 14,
  },
  priceTotal: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  noteBox: {
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 5,
  },
});
