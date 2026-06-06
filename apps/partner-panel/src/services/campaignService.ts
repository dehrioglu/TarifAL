import { demoCampaigns } from '../data/demoData';
import type { Campaign, PartnerUser } from '../types';
import { canAccessBusiness } from '../utils/access';

type CampaignDraft = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;

export const campaignService = {
  getCampaignsForUser(user: PartnerUser): Campaign[] {
    if (user.role === 'staff') {
      return [];
    }

    if (user.role === 'admin') {
      return demoCampaigns;
    }

    return demoCampaigns.filter((campaign) => canAccessBusiness(user, campaign.businessId));
  },

  addCampaign(draft: CampaignDraft): Campaign {
    const campaign: Campaign = {
      ...draft,
      id: `campaign-${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    demoCampaigns.unshift(campaign);
    return campaign;
  },

  toggleActive(campaignId: string): Campaign | undefined {
    const campaign = demoCampaigns.find((item) => item.id === campaignId);
    if (!campaign) {
      return undefined;
    }

    campaign.isActive = !campaign.isActive;
    campaign.updatedAt = new Date().toISOString();
    return campaign;
  },
};
