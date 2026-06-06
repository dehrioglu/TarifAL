import { useState } from 'react';
import type { Campaign, CampaignType, PartnerUser } from '../types';
import { businessService } from '../services/businessService';
import { campaignService } from '../services/campaignService';
import { AppButton } from '../components/AppButton';
import { Modal } from '../components/Modal';

interface CampaignFormProps {
  user: PartnerUser;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (campaign: Campaign) => void;
}

export function CampaignForm({ user, isOpen, onClose, onCreated }: CampaignFormProps) {
  const firstBusiness = businessService.getBusinessesForUser(user)[0];
  const [title, setTitle] = useState('Yeni TarifAL Kampanyası');
  const [campaignType, setCampaignType] = useState<CampaignType>('cart_discount');
  const [discountValue, setDiscountValue] = useState(25);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstBusiness) {
      return;
    }

    const campaign = campaignService.addCampaign({
      businessId: firstBusiness.id,
      businessType: firstBusiness.businessType,
      title,
      description: 'Partner panelinden oluşturulan demo kampanya.',
      campaignType,
      discountType: campaignType === 'first_order' ? 'percentage' : 'fixed',
      discountValue,
      targetProducts: [],
      targetCategories: ['Pratik', 'Sepete Uygun'],
      startAt: new Date().toISOString().slice(0, 10),
      endAt: '2026-06-30',
      isActive: true,
    });

    onCreated(campaign);
    onClose();
  };

  return (
    <Modal title="Kampanya oluştur" description="Restoran, market veya marka hedefli demo kampanya oluşturulur." isOpen={isOpen} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Kampanya adı
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          Kampanya tipi
          <select value={campaignType} onChange={(event) => setCampaignType(event.target.value as CampaignType)}>
            <option value="product_discount">Ürün indirimi</option>
            <option value="menu_discount">Menü indirimi</option>
            <option value="sponsored_product">Sponsorlu ürün</option>
            <option value="cart_discount">Sepette indirim</option>
            <option value="recipe_category">Tarif kategorisi</option>
            <option value="first_order">İlk sipariş indirimi</option>
          </select>
        </label>
        <label>
          İndirim değeri
          <input type="number" value={discountValue} onChange={(event) => setDiscountValue(Number(event.target.value))} min={0} required />
        </label>
        <div className="modal-actions">
          <AppButton type="button" variant="secondary" onClick={onClose}>Vazgeç</AppButton>
          <AppButton type="submit">Kampanyayı oluştur</AppButton>
        </div>
      </form>
    </Modal>
  );
}
