import { useMemo, useState } from 'react';
import type { PartnerUser } from '../types';
import { sponsoredProductService } from '../services/sponsoredProductService';
import { currency, percent } from '../utils/format';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { SponsoredProductForm } from './SponsoredProductForm';

interface SponsoredProductsScreenProps {
  user: PartnerUser;
  onToast: (title: string, message: string, tone?: 'success' | 'info' | 'warning' | 'danger') => void;
}

export function SponsoredProductsScreen({ user, onToast }: SponsoredProductsScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const products = useMemo(() => sponsoredProductService.getSponsoredProductsForUser(user), [user, version]);

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Marka ve reklam"
        title="Sponsorlu ürün yönetimi"
        description="Ürünleri tarif detayı, eksik ürün, sepet ve AI Şef yerleşimlerine hedefleyin."
        action={<AppButton onClick={() => setIsFormOpen(true)}>Sponsorlu ürün ekle</AppButton>}
      />

      {products.length === 0 ? (
        <EmptyState title="Sponsorlu ürün yok" description="Bu rol için sponsorlu ürün erişimi yok." />
      ) : (
        <div className="card-grid card-grid--two">
          {products.map((product) => {
            const conversion = (product.cartAddCount / Math.max(product.clickCount, 1)) * 100;
            return (
              <PanelCard key={product.id} className="sponsor-card">
                <div className="sponsor-card__top">
                  <img src={product.imageURL} alt="" />
                  <div>
                    <span className="page-header__eyebrow">{product.brandName}</span>
                    <h2>{product.productName}</h2>
                    <p>{product.category} · Öncelik {product.priority}</p>
                  </div>
                  <b className={product.isActive ? 'is-online' : 'is-offline'}>{product.isActive ? 'Aktif' : 'Pasif'}</b>
                </div>
                <div className="detail-grid">
                  <div className="detail-box">
                    <span>Gösterim</span>
                    <strong>{product.impressionCount.toLocaleString('tr-TR')}</strong>
                  </div>
                  <div className="detail-box">
                    <span>Tıklama</span>
                    <strong>{product.clickCount.toLocaleString('tr-TR')}</strong>
                  </div>
                  <div className="detail-box">
                    <span>Sepete ekleme</span>
                    <strong>{product.cartAddCount.toLocaleString('tr-TR')}</strong>
                  </div>
                  <div className="detail-box">
                    <span>Dönüşüm</span>
                    <strong>{percent(conversion)}</strong>
                  </div>
                </div>
                <div className="tag-row">
                  {product.placementTypes.map((placement) => <span key={placement}>{placement}</span>)}
                </div>
                <div className="modal-actions">
                  <strong>{currency(product.budget)} bütçe</strong>
                  <AppButton
                    variant={product.isActive ? 'secondary' : 'primary'}
                    onClick={() => {
                      const updated = sponsoredProductService.toggleActive(product.id);
                      setVersion((value) => value + 1);
                      onToast('Sponsorlu ürün güncellendi', `${updated?.productName} ${updated?.isActive ? 'aktif' : 'pasif'} durumda.`, 'success');
                    }}
                  >
                    {product.isActive ? 'Pasife al' : 'Aktif et'}
                  </AppButton>
                </div>
              </PanelCard>
            );
          })}
        </div>
      )}

      <SponsoredProductForm
        user={user}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={(product) => {
          setVersion((value) => value + 1);
          onToast('Sponsorlu ürün eklendi', `${product.productName} reklam vitrini için hazır.`, 'success');
        }}
      />
    </div>
  );
}
