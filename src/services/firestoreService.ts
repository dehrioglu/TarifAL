import { Order } from '../types';
import { createOrder, getUserOrders } from './ordersService';

export const saveOrder = async (order: Order) => {
  await createOrder(order);
};

export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  return getUserOrders(userId);
};
