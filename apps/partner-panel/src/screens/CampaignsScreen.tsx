import { useMemo, useState } from 'react';
import type { PartnerUser } from '../types';
import { campaignService } from '../services/campaignService';
import { campaignTypeLabels, dateTime } from '../utils/format';
import { AppButton } from '../components/AppButton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { CampaignForm } from './CampaignForm';

interface CampaignsScreenProps {
  user: PartnerUser;
  onToast: (title: string, message: string, tone?: 'success' | 'info' | 'warning' | 'danger') => void;
}

export function CampaignsScreen({ user, onToast }: CampaignsScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const campaigns = useMemo(() => campaignService.getCampaignsForUser(user), [user, version]);

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow="Kampanya yönetimi"
        title="İndirim ve hedefleme"
        description="Sepet, ürün, menü, sponsorlu ürün ve tarif kategorisi kampanyalarını yönetin."
        action={<AppButton onClick={() => setIsFormOpen(true)}>Kampanya oluştur</AppButton>}
      />

      {campaigns.length === 0 ? (
        <EmptyState title="Kampanya yok" description="Bu rol için kampanya erişimi yok." />
      ) : (
        <PanelCard title="Aktif kampanyalar" subtitle={`${campaigns.length} kampanya listeleniyor.`}>
          <div className="campaign-list">
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="campaign-row">
                <div>
                  <span>{campaignTypeLabels[campaign.campaignType]}</span>
                  <strong>{campaign.title}</strong>
                  <p>{campaign.description}</p>
                </div>
                <div>
                  <strong>{campaign.discountValue}{campaign.discountType === 'percentage' ? '%' : ' TL'}</strong>
                  <span>{campaign.usageCount} kullanım</span>
                </div>
                <div>
                  <span>{dateTime(campaign.createdAt)}</span>
                  <b className={campaign.isActive ? 'is-online' : 'is-offline'}>{campaign.isActive ? 'Aktif' : 'Pasif'}</b>
                </div>
                <AppButton
                  size="sm"
                  variant={campaign.isActive ? 'secondary' : 'primary'}
                  onClick={() => {
                    const updated = campaignService.toggleActive(campaign.id);
                    setVersion((value) => value + 1);
                    onToast('Kampanya güncellendi', `${updated?.title} ${updated?.isActive ? 'aktif' : 'pasif'} durumda.`, 'success');
                  }}
                >
                  {campaign.isActive ? 'Pasife al' : 'Aktif et'}
                </AppButton>
              </article>
            ))}
          </div>
        </PanelCard>
      )}

      <CampaignForm
        user={user}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={(campaign) => {
          setVersion((value) => value + 1);
          onToast('Kampanya oluşturuldu', `${campaign.title} yayın için hazır.`, 'success');
        }}
      />
    </div>
  );
}
