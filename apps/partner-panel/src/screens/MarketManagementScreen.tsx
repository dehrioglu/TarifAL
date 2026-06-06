import type { PartnerUser } from '../types';
import { businessService } from '../services/businessService';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';

interface MarketManagementScreenProps {
  user: PartnerUser;
  onToast: (title: string, message: string, tone?: 'success' | 'info' | 'warning' | 'danger') => void;
}

export function MarketManagementScreen({ user, onToast }: MarketManagementScreenProps) {
  const markets = businessService.getBusinessesForUser(user).filter((business) => business.businessType === 'market');

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Market yönetimi"
        title="Market profili"
        description="Teslimat bölgesi, minimum sepet ve aktiflik durumunu yönetin."
      />

      {markets.length === 0 ? (
        <EmptyState title="Market erişimi yok" description="Bu rol için market profili görüntülenemiyor." />
      ) : (
        <div className="card-grid card-grid--two">
          {markets.map((market) => {
            const profile = businessService.getMarketProfile(market.id);
            return (
              <PanelCard key={market.id} className="profile-card">
                <img className="profile-card__cover" src={market.coverImageURL} alt="" />
                <div className="profile-card__body">
                  <img className="profile-card__logo" src={market.logoURL} alt="" />
                  <div>
                    <span className="page-header__eyebrow">Market</span>
                    <h2>{market.businessName}</h2>
                    <p>{profile?.deliveryZone}</p>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-box">
                      <span>Teslimat süresi</span>
                      <strong>{profile?.deliveryTime}</strong>
                    </div>
                    <div className="detail-box">
                      <span>Minimum sepet</span>
                      <strong>₺{profile?.minimumCartAmount}</strong>
                    </div>
                    <div className="detail-box">
                      <span>Şehir</span>
                      <strong>{market.city}</strong>
                    </div>
                    <div className="detail-box">
                      <span>Durum</span>
                      <strong>{market.isActive ? 'Aktif' : 'Pasif'}</strong>
                    </div>
                  </div>
                  <AppButton
                    type="button"
                    variant={market.isActive ? 'secondary' : 'primary'}
                    onClick={() => {
                      const updated = businessService.toggleBusinessStatus(market.id);
                      onToast(
                        'Market durumu güncellendi',
                        `${market.businessName} artık ${updated?.isActive ? 'aktif' : 'pasif'} durumda.`,
                        'success',
                      );
                    }}
                  >
                    {market.isActive ? 'Marketi pasife al' : 'Marketi aktif et'}
                  </AppButton>
                </div>
              </PanelCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
