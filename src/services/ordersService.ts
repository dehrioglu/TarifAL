import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { Order, OrderStatus } from '../types';
import { COLLECTIONS, db } from './firebase';

type FirestoreTimestampLike = {
  toDate?: () => Date;
};

type StoredOrder = Omit<Order, 'createdAt' | 'updatedAt' | 'completedAt'> & {
  createdAt?: FirestoreTimestampLike | string;
  updatedAt?: FirestoreTimestampLike | string;
  completedAt?: FirestoreTimestampLike | string | null;
};

export type OrderStats = {
  todayOrders: number;
  totalOrders: number;
  newOrders: number;
  preparingOrders: number;
  onTheWayOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageBasket: number;
  totalDemoRevenue: number;
};

const emptyStats: OrderStats = {
  todayOrders: 0,
  totalOrders: 0,
  newOrders: 0,
  preparingOrders: 0,
  onTheWayOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
  averageBasket: 0,
  totalDemoRevenue: 0,
};

const timestampToString = (value?: FirestoreTimestampLike | string | null) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.toDate?.().toISOString();
};

const cleanOrder = (order: Order) => JSON.parse(JSON.stringify(order)) as Order;

const normalizeOrder = (id: string, data: StoredOrder): Order => ({
  ...data,
  id,
  orderId: data.orderId ?? id,
  orderNumber: data.orderNumber ?? id.replace('order-', 'ORD-'),
  status: normalizeOrderStatus(data.status),
  createdAt: timestampToString(data.createdAt) ?? new Date().toISOString(),
  updatedAt: timestampToString(data.updatedAt),
  completedAt: timestampToString(data.completedAt) ?? null,
});

export const normalizeOrderStatus = (status?: string): OrderStatus => {
  if (status === 'preparing' || status === 'on_the_way' || status === 'completed' || status === 'cancelled') {
    return status;
  }

  return 'new';
};

export const createOrder = async (order: Order) => {
  if (!db) {
    return order;
  }

  const clean = cleanOrder({
    ...order,
    orderId: order.orderId ?? order.id,
    orderNumber: order.orderNumber ?? order.id.replace('order-', 'ORD-'),
    status: normalizeOrderStatus(order.status),
    isDemoOrder: order.isDemoOrder ?? true,
    isPaid: order.isPaid ?? false,
    paymentStatus: order.paymentStatus ?? 'demo',
    discount: order.discount ?? 0,
    updatedAt: order.updatedAt ?? order.createdAt,
    completedAt: order.completedAt ?? null,
  });

  await setDoc(doc(db, COLLECTIONS.orders, clean.id), {
    ...clean,
    orderId: clean.orderId ?? clean.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: clean.completedAt ?? null,
  });

  return clean;
};

export const getOrders = async (): Promise<Order[]> => {
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.orders), orderBy('createdAt', 'desc')),
  );

  return snapshot.docs.map((orderDoc) => normalizeOrder(orderDoc.id, orderDoc.data() as StoredOrder));
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, COLLECTIONS.orders, orderId));

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeOrder(snapshot.id, snapshot.data() as StoredOrder);
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.orders), where('userId', '==', userId)),
  );

  return snapshot.docs
    .map((orderDoc) => normalizeOrder(orderDoc.id, orderDoc.data() as StoredOrder))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  if (!db) {
    return;
  }

  await updateDoc(doc(db, COLLECTIONS.orders, orderId), {
    status,
    updatedAt: serverTimestamp(),
    completedAt: status === 'completed' ? serverTimestamp() : null,
  });
};

export const getOrderStats = (orders: Order[]): OrderStats => {
  if (orders.length === 0) {
    return emptyStats;
  }

  const today = new Date().toLocaleDateString('tr-TR');
  const todayOrders = orders.filter(
    (order) => new Date(order.createdAt).toLocaleDateString('tr-TR') === today,
  ).length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return {
    todayOrders,
    totalOrders: orders.length,
    newOrders: orders.filter((order) => order.status === 'new').length,
    preparingOrders: orders.filter((order) => order.status === 'preparing').length,
    onTheWayOrders: orders.filter((order) => order.status === 'on_the_way').length,
    completedOrders: orders.filter((order) => order.status === 'completed').length,
    cancelledOrders: orders.filter((order) => order.status === 'cancelled').length,
    averageBasket: Math.round(totalRevenue / orders.length),
    totalDemoRevenue: Math.round(
      orders.filter((order) => order.isDemoOrder ?? true).reduce((sum, order) => sum + order.total, 0),
    ),
  };
};

export const subscribeToOrders = (
  onNext: (orders: Order[]) => void,
  onError?: (error: Error) => void,
) => {
  if (!db) {
    onNext([]);
    return () => undefined;
  }

  return onSnapshot(
    query(collection(db, COLLECTIONS.orders), orderBy('createdAt', 'desc')),
    (snapshot) => {
      onNext(snapshot.docs.map((orderDoc) => normalizeOrder(orderDoc.id, orderDoc.data() as StoredOrder)));
    },
    (error) => {
      onError?.(error);
    },
  );
};
