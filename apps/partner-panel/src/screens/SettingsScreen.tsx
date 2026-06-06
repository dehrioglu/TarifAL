import type { PartnerUser } from '../types';
import { firebaseClient } from '../services/firebase';
import { businessService } from '../services/businessService';
import { roleLabels } from '../utils/format';
import { AppButton } from '../components/AppButton';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';

interface SettingsScreenProps {
  user: PartnerUser;
  onToast: (title: string, message: string, tone?: 'success' | 'info' | 'warning' | 'danger') => void;
}

const collections = [
  'partnerUsers',
  'businesses',
  'restaurants',
  'markets',
  'brands',
  'restaurantItems',
  'marketProducts',
  'orders',
  'campaigns',
  'sponsoredProducts',
  'partnerNotifications',
  'partnerReports',
];

export function SettingsScreen({ user, onToast }: SettingsScreenProps) {
  const business = businessService.getBusinessById(user.businessId);

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Ayarlar"
        title="Hesap ve entegrasyon"
        description="Demo panel ayarları, Firestore hazırlığı ve yetki modelini görüntüleyin."
      />

      <div className="two-column">
        <PanelCard title="Hesap kapsamı" subtitle="Giriş yapan partner kullanıcısı.">
          <div className="settings-list">
            <div><span>Ad</span><strong>{user.displayName}</strong></div>
            <div><span>E-posta</span><strong>{user.email}</strong></div>
            <div><span>Rol</span><strong>{roleLabels[user.role]}</strong></div>
            <div><span>İşletme</span><strong>{business?.businessName ?? 'TarifAL Operasyon'}</strong></div>
          </div>
        </PanelCard>

        <PanelCard title="Firebase durumu" subtitle="Env dosyası eklenirse gerçek Firebase client hazırlanır.">
          <div className={`firebase-status ${firebaseClient.isConfigured ? 'is-online' : 'is-offline'}`}>
            <strong>{firebaseClient.isConfigured ? 'Firebase yapılandırıldı' : 'Demo modda çalışıyor'}</strong>
            <p>
              Panel şu an mock servislerle çalışır. Firestore bağlantısı için VITE_FIREBASE_* değişkenleri eklenebilir.
            </p>
          </div>
          <AppButton
            type="button"
            variant="secondary"
            onClick={() => onToast('Demo güvenlik notu', 'Production Firestore rules role ve businessId bazlı sıkılaştırılmalı.', 'info')}
          >
            Güvenlik notunu göster
          </AppButton>
        </PanelCard>
      </div>

      <PanelCard title="Önerilen Firestore koleksiyonları" subtitle="TarifAL kullanıcı uygulamasıyla bağlanacak temel veri alanları.">
        <div className="collection-grid">
          {collections.map((collection) => (
            <span key={collection}>{collection}</span>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
