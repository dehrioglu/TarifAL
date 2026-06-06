import { useMemo, useState } from 'react';
import type { PartnerUser } from '../types';
import { marketService } from '../services/marketService';
import { currency } from '../utils/format';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { MarketProductForm } from './MarketProductForm';

interface MarketProductsScreenProps {
  user: PartnerUser;
  onToast: (title: string, message: string, tone?: 'success' | 'info' | 'warning' | 'danger') => void;
}

export function MarketProductsScreen({ user, onToast }: MarketProductsScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const products = useMemo(() => marketService.getProductsForUser(user), [user, version]);

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Ürün yönetimi"
        title="Market ürünleri ve stoklar"
        description="Ürün fiyatı, indirimli fiyat, stok miktarı ve sponsor uygunluğunu yönetin."
        action={<AppButton onClick={() => setIsFormOpen(true)}>Ürün ekle</AppButton>}
      />

      {products.length === 0 ? (
        <EmptyState title="Ürün bulunamadı" description="Bu rol için market ürünü görüntülenemiyor." />
      ) : (
        <PanelCard title="Ürün listesi" subtitle={`${products.length} ürün listeleniyor.`}>
          <div className="product-list">
            {products.map((product) => (
              <article key={product.id} className="product-row">
                <img src={product.imageURL} alt="" />
                <div>
                  <span>{product.category} · {product.subCategory}</span>
                  <strong>{product.brandName} {product.productName}</strong>
                  <p>{product.unit} · Barkod {product.barcode}</p>
                </div>
                <div>
                  <strong>{currency(product.discountedPrice ?? product.price)}</strong>
                  {product.discountedPrice ? <span className="old-price">{currency(product.price)}</span> : null}
                </div>
                <div>
                  <b className={product.stockQuantity <= 6 ? 'stock stock--low' : 'stock'}>{product.stockQuantity} stok</b>
                  <span>{product.isAvailable ? 'Satışta' : 'Stokta yok'}</span>
                </div>
                <div className="table-actions">
                  <AppButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const updated = marketService.updateStock(product.id, product.stockQuantity + 5);
                      setVersion((value) => value + 1);
                      onToast('Stok güncellendi', `${updated?.productName} stoğu ${updated?.stockQuantity} oldu.`, 'success');
                    }}
                  >
                    +5 stok
                  </AppButton>
                  <AppButton
                    size="sm"
                    variant={product.stockQuantity > 0 ? 'danger' : 'primary'}
                    onClick={() => {
                      const updated = marketService.updateStock(product.id, product.stockQuantity > 0 ? 0 : 10);
                      setVersion((value) => value + 1);
                      onToast('Ürün durumu değişti', `${updated?.productName} ${updated?.isAvailable ? 'satışa açıldı' : 'stok dışı oldu'}.`, 'success');
                    }}
                  >
                    {product.stockQuantity > 0 ? 'Stok dışı' : 'Satışa aç'}
                  </AppButton>
                </div>
              </article>
            ))}
          </div>
        </PanelCard>
      )}

      <MarketProductForm
        user={user}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={(product) => {
          setVersion((value) => value + 1);
          onToast('Ürün eklendi', `${product.productName} stok listesine eklendi.`, 'success');
        }}
      />
    </div>
  );
}
