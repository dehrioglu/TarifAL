import type { PartnerUser } from '../types';
import { businessService } from '../services/businessService';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';

interface RestaurantManagementScreenProps {
  user: PartnerUser;
  onToast: (title: string, message: string, tone?: 'success' | 'info' | 'warning' | 'danger') => void;
}

export function RestaurantManagementScreen({ user, onToast }: RestaurantManagementScreenProps) {
  const restaurants = businessService.getBusinessesForUser(user).filter((business) => business.businessType === 'restaurant');

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Restoran yönetimi"
        title="Restoran profili"
        description="Restoran bilgileri, teslimat ayarları ve aktiflik durumunu yönetin."
      />

      {restaurants.length === 0 ? (
        <EmptyState title="Restoran erişimi yok" description="Bu rol için restoran profili görüntülenemiyor." />
      ) : (
        <div className="card-grid card-grid--two">
          {restaurants.map((restaurant) => {
            const profile = businessService.getRestaurantProfile(restaurant.id);
            return (
              <PanelCard key={restaurant.id} className="profile-card">
                <img className="profile-card__cover" src={restaurant.coverImageURL} alt="" />
                <div className="profile-card__body">
                  <img className="profile-card__logo" src={restaurant.logoURL} alt="" />
                  <div>
                    <span className="page-header__eyebrow">{profile?.cuisineType ?? 'Restoran'}</span>
                    <h2>{restaurant.businessName}</h2>
                    <p>{profile?.description}</p>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-box">
                      <span>Çalışma saatleri</span>
                      <strong>{profile?.workingHours}</strong>
                    </div>
                    <div className="detail-box">
                      <span>Teslimat</span>
                      <strong>{profile?.deliveryTime}</strong>
                    </div>
                    <div className="detail-box">
                      <span>Minimum sipariş</span>
                      <strong>₺{profile?.minimumOrderAmount}</strong>
                    </div>
                    <div className="detail-box">
                      <span>Puan</span>
                      <strong>{profile?.rating}</strong>
                    </div>
                  </div>
                  <AppButton
                    type="button"
                    variant={restaurant.isActive ? 'secondary' : 'primary'}
                    onClick={() => {
                      const updated = businessService.toggleBusinessStatus(restaurant.id);
                      onToast(
                        'Restoran durumu güncellendi',
                        `${restaurant.businessName} artık ${updated?.isActive ? 'aktif' : 'pasif'} durumda.`,
                        'success',
                      );
                    }}
                  >
                    {restaurant.isActive ? 'Restoranı pasife al' : 'Restoranı aktif et'}
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
