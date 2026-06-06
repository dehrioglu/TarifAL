import { useMemo, useState } from 'react';
import type { OrderStatus, PartnerOrder, PartnerUser } from '../types';
import { orderService } from '../services/orderService';
import { currency, dateTime, orderStatusLabels } from '../utils/format';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { OrderStatusBadge, PaymentStatusBadge } from '../components/StatusBadge';

interface OrdersScreenProps {
  user: PartnerUser;
  onToast: (title: string, message: string, tone?: 'success' | 'info' | 'warning' | 'danger') => void;
}

type OrderFilter = OrderStatus | 'all';

const filters: OrderFilter[] = ['all', 'new', 'accepted', 'preparing', 'ready', 'on_the_way', 'completed', 'cancelled'];

export function OrdersScreen({ user, onToast }: OrdersScreenProps) {
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [ordersVersion, setOrdersVersion] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<PartnerOrder | null>(null);

  const orders = useMemo(() => orderService.getOrdersByStatus(user, filter), [user, filter, ordersVersion]);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    try {
      const updated = orderService.updateOrderStatus(user, orderId, status);
      setOrdersVersion((value) => value + 1);
      setSelectedOrder({ ...updated, items: [...updated.items], timeline: [...updated.timeline] });
      onToast('Sipariş güncellendi', `${updated.orderNo} durumu ${orderStatusLabels[status]} olarak kaydedildi.`, 'success');
    } catch (error) {
      onToast('Yetki uyarısı', error instanceof Error ? error.message : 'Sipariş güncellenemedi.', 'danger');
    }
  };

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Sipariş yönetimi"
        title="Sipariş operasyonu"
        description="Yeni, hazırlanan, yolda ve tamamlanan siparişleri tek tabloda yönetin."
      />

      <PanelCard title="Durum filtreleri" subtitle="Desktopta tablo, küçük ekranda kart düzeni kullanılır.">
        <div className="filter-row">
          {filters.map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-pill ${filter === status ? 'is-active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'Tümü' : orderStatusLabels[status]}
            </button>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Siparişler" subtitle={`${orders.length} kayıt listeleniyor.`}>
        {orders.length === 0 ? (
          <EmptyState title="Sipariş bulunamadı" description="Bu filtrede gösterilecek sipariş yok." />
        ) : (
          <>
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sipariş No</th>
                    <th>Müşteri</th>
                    <th>İşletme</th>
                    <th>Tür</th>
                    <th>Ürün</th>
                    <th>Toplam</th>
                    <th>Durum</th>
                    <th>Ödeme</th>
                    <th>Tarih</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td><strong>{order.orderNo}</strong></td>
                      <td>{order.customerName}</td>
                      <td>{order.businessName}</td>
                      <td>{order.type === 'market' ? 'Market' : 'Restoran'}</td>
                      <td>{order.items.length}</td>
                      <td>{currency(order.total)}</td>
                      <td><OrderStatusBadge status={order.status} /></td>
                      <td><PaymentStatusBadge paymentStatus={order.paymentStatus} /></td>
                      <td>{dateTime(order.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <AppButton variant="secondary" size="sm" onClick={() => setSelectedOrder(order)}>Detay</AppButton>
                          <AppButton size="sm" onClick={() => handleStatusChange(order.id, orderService.nextStatus(order.status))}>İlerle</AppButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-order-list">
              {orders.map((order) => (
                <article key={order.id} className="mobile-order-card">
                  <div>
                    <strong>{order.orderNo}</strong>
                    <span>{order.customerName} · {order.businessName}</span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                  <p>{order.items.length} ürün · {currency(order.total)} · {dateTime(order.createdAt)}</p>
                  <div className="table-actions">
                    <AppButton variant="secondary" size="sm" onClick={() => setSelectedOrder(order)}>Detay</AppButton>
                    <AppButton size="sm" onClick={() => handleStatusChange(order.id, orderService.nextStatus(order.status))}>Durum Güncelle</AppButton>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </PanelCard>

      <OrderDetailModal
        order={selectedOrder}
        user={user}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
