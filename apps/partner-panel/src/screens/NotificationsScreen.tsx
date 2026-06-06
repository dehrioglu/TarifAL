import { useMemo, useState } from 'react';
import type { PartnerUser } from '../types';
import { notificationService } from '../services/notificationService';
import { dateTime } from '../utils/format';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';

interface NotificationsScreenProps {
  user: PartnerUser;
  onToast: (title: string, message: string, tone?: 'success' | 'info' | 'warning' | 'danger') => void;
}

export function NotificationsScreen({ user, onToast }: NotificationsScreenProps) {
  const [version, setVersion] = useState(0);
  const notifications = useMemo(() => notificationService.getNotificationsForUser(user), [user, version]);

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Bildirim merkezi"
        title="Operasyon uyarıları"
        description="Sipariş, stok, kampanya ve sponsorlu ürün bildirimleri role göre filtrelenir."
        action={
          <AppButton
            variant="secondary"
            onClick={() => {
              notificationService.markAllAsRead(user);
              setVersion((value) => value + 1);
              onToast('Bildirimler okundu', 'Tüm görünür bildirimler okundu olarak işaretlendi.', 'success');
            }}
          >
            Tümünü okundu yap
          </AppButton>
        }
      />

      <PanelCard title="Bildirimler" subtitle={`${notifications.filter((item) => !item.isRead).length} okunmamış uyarı var.`}>
        {notifications.length === 0 ? (
          <EmptyState title="Bildirim yok" description="Bu rol için gösterilecek bildirim bulunmuyor." />
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`notification-row notification-row--${notification.severity} ${notification.isRead ? '' : 'is-unread'}`}
                onClick={() => {
                  notificationService.markAsRead(notification.id);
                  setVersion((value) => value + 1);
                  onToast('Bildirim açıldı', notification.title, 'info');
                }}
              >
                <span />
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                </div>
                <em>{dateTime(notification.createdAt)}</em>
              </button>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
