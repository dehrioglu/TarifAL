import { useState } from 'react';
import type { MarketProduct, PartnerUser } from '../types';
import { businessService } from '../services/businessService';
import { marketService } from '../services/marketService';
import { AppButton } from '../components/AppButton';
import { Modal } from '../components/Modal';

interface MarketProductFormProps {
  user: PartnerUser;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (product: MarketProduct) => void;
}

export function MarketProductForm({ user, isOpen, onClose, onCreated }: MarketProductFormProps) {
  const firstMarket = businessService.getBusinessesForUser(user).find((business) => business.businessType === 'market');
  const [productName, setProductName] = useState('Yeni TarifAL Ürünü');
  const [brandName, setBrandName] = useState('Demo Marka');
  const [price, setPrice] = useState(79.9);
  const [stockQuantity, setStockQuantity] = useState(24);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstMarket) {
      return;
    }

    const product = marketService.addProduct({
      businessId: firstMarket.id,
      productName,
      brandName,
      category: 'Temel Gıda',
      subCategory: 'Demo',
      price,
      unit: '1 adet',
      stockQuantity,
      imageURL: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop',
      barcode: `869${Date.now()}`,
      isAvailable: stockQuantity > 0,
      isSponsoredEligible: true,
    });

    onCreated(product);
    onClose();
  };

  return (
    <Modal title="Market ürünü ekle" description="Ürün demo stok listesine eklenir." isOpen={isOpen} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Ürün adı
          <input value={productName} onChange={(event) => setProductName(event.target.value)} required />
        </label>
        <label>
          Marka
          <input value={brandName} onChange={(event) => setBrandName(event.target.value)} required />
        </label>
        <label>
          Fiyat
          <input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} min={1} step="0.1" required />
        </label>
        <label>
          Stok
          <input type="number" value={stockQuantity} onChange={(event) => setStockQuantity(Number(event.target.value))} min={0} required />
        </label>
        <div className="modal-actions">
          <AppButton type="button" variant="secondary" onClick={onClose}>Vazgeç</AppButton>
          <AppButton type="submit">Ürünü ekle</AppButton>
        </div>
      </form>
    </Modal>
  );
}
