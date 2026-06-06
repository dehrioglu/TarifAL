import { useState } from 'react';
import type { PartnerUser, SponsoredProduct } from '../types';
import { businessService } from '../services/businessService';
import { sponsoredProductService } from '../services/sponsoredProductService';
import { AppButton } from '../components/AppButton';
import { Modal } from '../components/Modal';

interface SponsoredProductFormProps {
  user: PartnerUser;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (product: SponsoredProduct) => void;
}

export function SponsoredProductForm({ user, isOpen, onClose, onCreated }: SponsoredProductFormProps) {
  const firstBrand = businessService.getBusinessesForUser(user).find((business) => business.businessType === 'brand');
  const [productName, setProductName] = useState('Sponsorlu Demo Ürün');
  const [category, setCategory] = useState('Temel Gıda');
  const [price, setPrice] = useState(89.9);
  const [budget, setBudget] = useState(15000);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstBrand) {
      return;
    }

    const product = sponsoredProductService.addSponsoredProduct({
      brandId: firstBrand.id,
      brandName: firstBrand.businessName,
      productName,
      category,
      imageURL: firstBrand.logoURL,
      price,
      targetIngredients: ['makarna', 'salata'],
      targetRecipeCategories: ['Pratik', 'Sepete Uygun'],
      targetKeywords: ['sponsorlu', 'kampanya'],
      placementTypes: ['recipe_detail', 'missing_items', 'cart'],
      priority: 70,
      budget,
      campaignStartAt: new Date().toISOString().slice(0, 10),
      campaignEndAt: '2026-06-30',
      isActive: true,
    });

    onCreated(product);
    onClose();
  };

  return (
    <Modal title="Sponsorlu ürün ekle" description="Ürün hedef tarif ve sepet alanlarına demo olarak bağlanır." isOpen={isOpen} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Ürün adı
          <input value={productName} onChange={(event) => setProductName(event.target.value)} required />
        </label>
        <label>
          Kategori
          <input value={category} onChange={(event) => setCategory(event.target.value)} required />
        </label>
        <label>
          Fiyat
          <input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} min={1} step="0.1" required />
        </label>
        <label>
          Kampanya bütçesi
          <input type="number" value={budget} onChange={(event) => setBudget(Number(event.target.value))} min={1000} required />
        </label>
        <div className="modal-actions">
          <AppButton type="button" variant="secondary" onClick={onClose}>Vazgeç</AppButton>
          <AppButton type="submit">Sponsorlu ürünü ekle</AppButton>
        </div>
      </form>
    </Modal>
  );
}
