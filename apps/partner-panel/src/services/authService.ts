import { demoPartnerUsers } from '../data/demoData';
import type { PartnerRole, PartnerUser } from '../types';

const STORAGE_KEY = 'tarifal_partner_user_id';

export const authService = {
  getDemoUsers(): PartnerUser[] {
    return demoPartnerUsers;
  },

  loginWithRole(role: PartnerRole): PartnerUser {
    const user = demoPartnerUsers.find((partnerUser) => partnerUser.role === role);
    if (!user) {
      throw new Error('Bu rol için demo kullanıcı bulunamadı.');
    }

    localStorage.setItem(STORAGE_KEY, user.id);
    return user;
  },

  restoreSession(): PartnerUser | null {
    const userId = localStorage.getItem(STORAGE_KEY);
    if (!userId) {
      return null;
    }

    return demoPartnerUsers.find((user) => user.id === userId) ?? null;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
