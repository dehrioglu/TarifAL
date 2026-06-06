import { demoNotifications } from '../data/demoData';
import type { PartnerNotification, PartnerUser } from '../types';
import { canAccessBusiness } from '../utils/access';

export const notificationService = {
  getNotificationsForUser(user: PartnerUser): PartnerNotification[] {
    return demoNotifications.filter((notification) => {
      const roleMatch = notification.roleScope.includes(user.role);
      const businessMatch = user.role === 'admin' || canAccessBusiness(user, notification.businessId);
      return roleMatch && businessMatch;
    });
  },

  markAsRead(notificationId: string): PartnerNotification | undefined {
    const notification = demoNotifications.find((item) => item.id === notificationId);
    if (!notification) {
      return undefined;
    }

    notification.isRead = true;
    return notification;
  },

  markAllAsRead(user: PartnerUser): PartnerNotification[] {
    const notifications = this.getNotificationsForUser(user);
    notifications.forEach((notification) => {
      notification.isRead = true;
    });
    return notifications;
  },
};
