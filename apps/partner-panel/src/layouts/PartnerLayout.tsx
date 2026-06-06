import type { ReactNode } from 'react';
import type { PartnerMenuItem, PartnerUser } from '../types';
import { businessService } from '../services/businessService';
import { roleLabels } from '../utils/format';
import { AppButton } from '../components/AppButton';
import { RoleBadge } from '../components/RoleBadge';

export const menuItems: PartnerMenuItem[] = [
  { id: 'dashboard', label: 'Genel Bakış', description: 'Metrikler ve hızlı durum', icon: 'DB', roles: ['admin', 'restaurant_owner', 'market_owner', 'brand_manager', 'staff'] },
  { id: 'orders', label: 'Siparişler', description: 'Operasyon akışı', icon: 'OR', roles: ['admin', 'restaurant_owner', 'market_owner', 'staff'] },
  { id: 'businesses', label: 'İşletmeler', description: 'Restoran, market ve markalar', icon: 'IS', roles: ['admin'] },
  { id: 'restaurant', label: 'Restoran Profili', description: 'Restoran bilgileri', icon: 'RS', roles: ['admin', 'restaurant_owner'] },
  { id: 'restaurant-menu', label: 'Menü Yönetimi', description: 'Yemekler ve fiyatlar', icon: 'MN', roles: ['admin', 'restaurant_owner'] },
  { id: 'market', label: 'Market Profili', description: 'Teslimat ve mağaza', icon: 'MK', roles: ['admin', 'market_owner'] },
  { id: 'market-products', label: 'Ürün Yönetimi', description: 'Stok ve fiyatlar', icon: 'UR', roles: ['admin', 'market_owner'] },
  { id: 'sponsored-products', label: 'Sponsorlu Ürünler', description: 'Marka vitrini', icon: 'SP', roles: ['admin', 'brand_manager'] },
  { id: 'campaigns', label: 'Kampanyalar', description: 'İndirim ve hedefleme', icon: 'KP', roles: ['admin', 'restaurant_owner', 'market_owner', 'brand_manager'] },
  { id: 'reports', label: 'Raporlar', description: 'Performans ve dönüşüm', icon: 'RP', roles: ['admin', 'restaurant_owner', 'market_owner', 'brand_manager'] },
  { id: 'notifications', label: 'Bildirimler', description: 'Uyarı ve iş akışı', icon: 'BD', roles: ['admin', 'restaurant_owner', 'market_owner', 'brand_manager', 'staff'] },
  { id: 'settings', label: 'Ayarlar', description: 'Hesap ve entegrasyon', icon: 'AY', roles: ['admin', 'restaurant_owner', 'market_owner', 'brand_manager', 'staff'] },
];

interface PartnerLayoutProps {
  user: PartnerUser;
  activeScreen: string;
  unreadCount: number;
  onNavigate: (screenId: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function PartnerLayout({ user, activeScreen, unreadCount, onNavigate, onLogout, children }: PartnerLayoutProps) {
  const business = businessService.getBusinessById(user.businessId);
  const visibleItems = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="partner-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-lockup__mark">T</div>
          <div>
            <strong>TarifAL</strong>
            <span>Partner Paneli</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Partner panel menüsü">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav__item ${activeScreen === item.id ? 'is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-nav__icon">{item.icon}</span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              {item.id === 'notifications' && unreadCount > 0 ? <em>{unreadCount}</em> : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <RoleBadge role={user.role} />
          <p>{business?.businessName ?? roleLabels[user.role]}</p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="topbar__eyebrow">B2B ticari panel</span>
            <strong>{business?.businessName ?? 'TarifAL Operasyon'}</strong>
            <p>{user.displayName} · {roleLabels[user.role]}</p>
          </div>
          <div className="topbar__actions">
            <button type="button" className="notification-button" onClick={() => onNavigate('notifications')} aria-label="Bildirimleri aç">
              <span>Bildirim</span>
              {unreadCount > 0 ? <b>{unreadCount}</b> : null}
            </button>
            <AppButton type="button" variant="secondary" onClick={onLogout}>
              Çıkış
            </AppButton>
          </div>
        </header>

        <section className="workspace__content">{children}</section>
      </main>
    </div>
  );
}
