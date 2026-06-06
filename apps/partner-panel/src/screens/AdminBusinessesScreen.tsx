import { useState } from 'react';
import type { PartnerUser } from '../types';
import { businessService } from '../services/businessService';
import { businessTypeLabels, dateTime } from '../utils/format';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';

interface AdminBusinessesScreenProps {
  user: PartnerUser;
  onToast: (title: string, message: string, tone?: 'success' | 'info' | 'warning' | 'danger') => void;
}

export function AdminBusinessesScreen({ user, onToast }: AdminBusinessesScreenProps) {
  const [version, setVersion] = useState(0);
  const businesses = user.role === 'admin' ? businessService.getAllBusinesses() : businessService.getBusinessesForUser(user);

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Admin"
        title="İşletme yönetimi"
        description="Restoran, market ve markaların aktiflik durumunu ve kapsamını kontrol edin."
      />

      {businesses.length === 0 ? (
        <EmptyState title="İşletme yok" description="Gösterilecek işletme bulunamadı." />
      ) : (
        <PanelCard title="İşletmeler" subtitle={`${businesses.length} kayıt listeleniyor.`}>
          <div className="business-table">
            {businesses.map((business) => (
              <article key={business.id} className="business-row">
                <img src={business.logoURL} alt="" />
                <div>
                  <strong>{business.businessName}</strong>
                  <span>{businessTypeLabels[business.businessType]} · {business.city} / {business.district}</span>
                </div>
                <div>
                  <span>{business.email}</span>
                  <span>{business.phone}</span>
                </div>
                <div>
                  <b className={business.isActive ? 'is-online' : 'is-offline'}>{business.isActive ? 'Aktif' : 'Pasif'}</b>
                  <span>{dateTime(business.updatedAt)}</span>
                </div>
                <AppButton
                  size="sm"
                  variant={business.isActive ? 'secondary' : 'primary'}
                  onClick={() => {
                    const updated = businessService.toggleBusinessStatus(business.id);
                    setVersion((value) => value + 1);
                    onToast('İşletme durumu güncellendi', `${updated?.businessName} ${updated?.isActive ? 'aktif' : 'pasif'} oldu.`, 'success');
                  }}
                >
                  {business.isActive ? 'Pasife al' : 'Aktif et'}
                </AppButton>
              </article>
            ))}
          </div>
        </PanelCard>
      )}
    </div>
  );
}
