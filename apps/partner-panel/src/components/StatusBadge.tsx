import type { OrderStatus, PaymentStatus } from '../types';
import { orderStatusLabels, paymentStatusLabels } from '../utils/format';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

interface PaymentStatusBadgeProps {
  paymentStatus: PaymentStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <span className={`status-badge status-badge--${status}`}>{orderStatusLabels[status]}</span>;
}

export function PaymentStatusBadge({ paymentStatus }: PaymentStatusBadgeProps) {
  return <span className={`payment-badge payment-badge--${paymentStatus}`}>{paymentStatusLabels[paymentStatus]}</span>;
}
