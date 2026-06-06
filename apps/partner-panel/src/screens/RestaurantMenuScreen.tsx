import { useMemo, useState } from 'react';
import type { PartnerUser } from '../types';
import { restaurantService } from '../services/restaurantService';
import { currency } from '../utils/format';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { RestaurantItemForm } from './RestaurantItemForm';

interface RestaurantMenuScreenProps {
  user: PartnerUser;
  onToast: (title: string, message: string, tone?: 'success' | 'info' | 'warning' | 'danger') => void;
}

export function RestaurantMenuScreen({ user, onToast }: RestaurantMenuScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const items = useMemo(() => restaurantService.getItemsForUser(user), [user, version]);

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Menü yönetimi"
        title="Yemekler ve fiyatlar"
        description="Restoran menünüzdeki yemekleri, stok durumlarını ve hazırlık sürelerini yönetin."
        action={<AppButton onClick={() => setIsFormOpen(true)}>Yemek ekle</AppButton>}
      />

      {items.length === 0 ? (
        <EmptyState title="Menü ürünü yok" description="Bu rol için menü ürünü görüntülenemiyor." />
      ) : (
        <div className="catalog-grid">
          {items.map((item) => (
            <article key={item.id} className="catalog-card">
              <img src={item.imageURL} alt="" />
              <div className="catalog-card__body">
                <span>{item.category}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="catalog-card__meta">
                  <b>{currency(item.price)}</b>
                  <span>{item.preparationTime} dk</span>
                  <span>{item.calories} kcal</span>
                </div>
                <AppButton
                  type="button"
                  variant={item.isAvailable ? 'secondary' : 'primary'}
                  onClick={() => {
                    const updated = restaurantService.updateAvailability(item.id);
                    setVersion((value) => value + 1);
                    onToast('Yemek durumu güncellendi', `${item.name} ${updated?.isAvailable ? 'satışa açıldı' : 'pasife alındı'}.`, 'success');
                  }}
                >
                  {item.isAvailable ? 'Pasife al' : 'Satışa aç'}
                </AppButton>
              </div>
            </article>
          ))}
        </div>
      )}

      <RestaurantItemForm
        user={user}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={(item) => {
          setVersion((value) => value + 1);
          onToast('Yemek eklendi', `${item.name} menüye eklendi.`, 'success');
        }}
      />
    </div>
  );
}
