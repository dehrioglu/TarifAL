import { demoOrders } from '../data/demoData';
import type { OrderStatus, PartnerOrder, PartnerUser } from '../types';
import { canAccessBusiness, canUpdateOrderStatus } from '../utils/access';
import { orderStatusLabels } from '../utils/format';

const statusOrder: OrderStatus[] = ['new', 'accepted', 'preparing', 'ready', 'on_the_way', 'completed', 'cancelled'];

export const orderService = {
  getOrdersForUser(user: PartnerUser): PartnerOrder[] {
    return demoOrders.filter((order) => canAccessBusiness(user, order.businessId));
  },

  getOrdersByStatus(user: PartnerUser, status: OrderStatus | 'all'): PartnerOrder[] {
    const orders = this.getOrdersForUser(user);
    if (status === 'all') {
      return orders;
    }

    return orders.filter((order) => order.status === status);
  },

  updateOrderStatus(user: PartnerUser, orderId: string, status: OrderStatus): PartnerOrder {
    if (!canUpdateOrderStatus(user.role)) {
      throw new Error('Bu rol sipariş durumunu güncelleyemez.');
    }

    const order = demoOrders.find((item) => item.id === orderId);
    if (!order || !canAccessBusiness(user, order.businessId)) {
      throw new Error('Sipariş bulunamadı veya yetkiniz yok.');
    }

    order.status = status;
    order.timeline.push({
      status,
      label: orderStatusLabels[status],
      time: new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    });

    return order;
  },

  nextStatus(current: OrderStatus): OrderStatus {
    const currentIndex = statusOrder.indexOf(current);
    if (currentIndex < 0 || current === 'completed' || current === 'cancelled') {
      return current;
    }

    return statusOrder[Math.min(currentIndex + 1, statusOrder.length - 2)];
  },
};
