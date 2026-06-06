import type { OrderStatus, PartnerOrder, PartnerUser } from '../types';
import { orderService } from '../services/orderService';
import { currency, dateTime } from '../utils/format';
import { canUpdateOrderStatus } from '../utils/access';
import { AppButton } from './AppButton';
import { Modal } from './Modal';
import { OrderStatusBadge, PaymentStatusBadge } from './StatusBadge';

interface OrderDetailModalProps {
  order: PartnerOrder | null;
  user: PartnerUser;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const statusOptions: OrderStatus[] = ['new', 'accepted', 'preparing', 'ready', 'on_the_way', 'completed', 'cancelled'];

export function OrderDetailModal({ order, user, isOpen, onClose, onStatusChange }: OrderDetailModalProps) {
  if (!order) {
    return null;
  }

  const nextStatus = orderService.nextStatus(order.status);
  const canEdit = canUpdateOrderStatus(user.role);

  return (
    <Modal
      title={`${order.orderNo} sipariş detayı`}
      description="Bu ekran demo sipariş operasyonunun partner panelindeki karşılığıdır."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="detail-grid">
        <div className="detail-box">
          <span>Müşteri</span>
          <strong>{order.customerName}</strong>
          <p>{order.customerPhone}</p>
        </div>
        <div className="detail-box">
          <span>İşletme</span>
          <strong>{order.businessName}</strong>
          <p>{order.type === 'market' ? 'Market siparişi' : 'Restoran siparişi'}</p>
        </div>
        <div className="detail-box">
          <span>Durum</span>
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge paymentStatus={order.paymentStatus} />
        </div>
        <div className="detail-box">
          <span>Toplam</span>
          <strong>{currency(order.total)}</strong>
          <p>{dateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="modal-section">
        <h3>Ürünler</h3>
        <div className="line-list">
          {order.items.map((item) => (
            <div key={item.id} className="line-row">
              <div>
                <strong>{item.name}</strong>
                {item.note ? <span>{item.note}</span> : null}
              </div>
              <b>
                {item.quantity} x {currency(item.unitPrice)}
              </b>
            </div>
          ))}
        </div>
      </div>

      <div className="modal-section">
        <h3>Teslimat ve tarif bağlantısı</h3>
        <div className="detail-grid detail-grid--two">
          <div className="detail-box">
            <span>Adres</span>
            <strong>{order.deliveryAddress}</strong>
          </div>
          <div className="detail-box">
            <span>İlgili tarif</span>
            <strong>{order.relatedRecipe}</strong>
          </div>
        </div>
      </div>

      <div className="modal-section">
        <h3>Zaman çizelgesi</h3>
        <div className="timeline">
          {order.timeline.map((item, index) => (
            <div key={`${item.status}-${index}`} className="timeline__item">
              <span>{item.time}</span>
              <strong>{item.label}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="modal-actions">
        <select
          className="select-input"
          value={order.status}
          onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)}
          disabled={!canEdit}
          aria-label="Sipariş durumunu seç"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <AppButton
          type="button"
          disabled={!canEdit || nextStatus === order.status}
          onClick={() => onStatusChange(order.id, nextStatus)}
        >
          Sonraki duruma al
        </AppButton>
      </div>
    </Modal>
  );
}
