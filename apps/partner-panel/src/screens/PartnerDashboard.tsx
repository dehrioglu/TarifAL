import type { PartnerUser } from '../types';
import { businessService } from '../services/businessService';
import { notificationService } from '../services/notificationService';
import { orderService } from '../services/orderService';
import { reportService } from '../services/reportService';
import { currency, dateTime } from '../utils/format';
import { AppButton } from '../components/AppButton';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { OrderStatusBadge } from '../components/StatusBadge';

interface PartnerDashboardProps {
  user: PartnerUser;
  onNavigate: (screenId: string) => void;
}

export function PartnerDashboard({ user, onNavigate }: PartnerDashboardProps) {
  const metrics = reportService.getDashboardMetrics(user);
  const orders = orderService.getOrdersForUser(user).slice(0, 4);
  const notifications = notificationService.getNotificationsForUser(user).slice(0, 4);
  const businesses = businessService.getBusinessesForUser(user);
  const business = businessService.getBusinessById(user.businessId);

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Genel bakış"
        title={`${business?.businessName ?? 'TarifAL'} kontrol merkezi`}
        description="Sipariş, kampanya, ürün ve dönüşüm metriklerini role göre tek ekranda takip edin."
        action={<AppButton onClick={() => onNavigate('orders')}>Siparişleri Aç</AppButton>}
      />

      <div className="metric-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="two-column">
        <PanelCard
          title="Canlı sipariş akışı"
          subtitle="TarifAL kullanıcı uygulamasından panele düşen sipariş simülasyonları."
          action={<AppButton variant="ghost" onClick={() => onNavigate('orders')}>Tümünü gör</AppButton>}
        >
          <div className="compact-list">
            {orders.map((order) => (
              <button key={order.id} type="button" className="compact-row" onClick={() => onNavigate('orders')}>
                <span>
                  <strong>{order.orderNo}</strong>
                  <small>{order.customerName} · {order.businessName}</small>
                </span>
                <span>
                  <b>{currency(order.total)}</b>
                  <OrderStatusBadge status={order.status} />
                </span>
              </button>
            ))}
          </div>
        </PanelCard>

        <PanelCard
          title="Operasyon uyarıları"
          subtitle="Stok, sipariş ve kampanya aksiyonları."
          action={<AppButton variant="ghost" onClick={() => onNavigate('notifications')}>Bildirimler</AppButton>}
        >
          <div className="compact-list">
            {notifications.map((notification) => (
              <button key={notification.id} type="button" className={`compact-row compact-row--${notification.severity}`} onClick={() => onNavigate('notifications')}>
                <span>
                  <strong>{notification.title}</strong>
                  <small>{notification.message}</small>
                </span>
                <em>{dateTime(notification.createdAt)}</em>
              </button>
            ))}
          </div>
        </PanelCard>
      </div>

      <PanelCard title="Bağlı işletmeler" subtitle="Rolünüzün erişebildiği işletme kapsamı.">
        <div className="business-strip">
          {businesses.map((item) => (
            <article key={item.id} className="business-mini-card">
              <img src={item.logoURL} alt="" />
              <div>
                <strong>{item.businessName}</strong>
                <span>{item.city} / {item.district}</span>
              </div>
              <b className={item.isActive ? 'is-online' : 'is-offline'}>{item.isActive ? 'Aktif' : 'Pasif'}</b>
            </article>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
