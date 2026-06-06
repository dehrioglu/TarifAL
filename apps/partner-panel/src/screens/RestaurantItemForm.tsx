import { useState } from 'react';
import type { PartnerUser, RestaurantItem } from '../types';
import { businessService } from '../services/businessService';
import { restaurantService } from '../services/restaurantService';
import { AppButton } from '../components/AppButton';
import { Modal } from '../components/Modal';

interface RestaurantItemFormProps {
  user: PartnerUser;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (item: RestaurantItem) => void;
}

export function RestaurantItemForm({ user, isOpen, onClose, onCreated }: RestaurantItemFormProps) {
  const firstRestaurant = businessService.getBusinessesForUser(user).find((business) => business.businessType === 'restaurant');
  const [name, setName] = useState('Günün Taze Menüsü');
  const [category, setCategory] = useState('Ana Yemek');
  const [price, setPrice] = useState(165);
  const [preparationTime, setPreparationTime] = useState(24);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstRestaurant) {
      return;
    }

    const item = restaurantService.addItem({
      businessId: firstRestaurant.id,
      name,
      description: 'Partner panelinden eklenen demo yemek.',
      category,
      price,
      imageURL: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=900&auto=format&fit=crop',
      preparationTime,
      ingredients: ['Ana malzeme', 'baharat', 'sos'],
      allergens: [],
      calories: 420,
      isAvailable: true,
      isPopular: false,
    });

    onCreated(item);
    onClose();
  };

  return (
    <Modal title="Yemek ekle" description="Demo menü ürünü oluşturulur; ileride Firestore'a yazılabilir." isOpen={isOpen} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Yemek adı
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Kategori
          <input value={category} onChange={(event) => setCategory(event.target.value)} required />
        </label>
        <label>
          Fiyat
          <input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} min={1} required />
        </label>
        <label>
          Hazırlama süresi
          <input type="number" value={preparationTime} onChange={(event) => setPreparationTime(Number(event.target.value))} min={1} required />
        </label>
        <div className="modal-actions">
          <AppButton type="button" variant="secondary" onClick={onClose}>Vazgeç</AppButton>
          <AppButton type="submit">Yemeği ekle</AppButton>
        </div>
      </form>
    </Modal>
  );
}
