import type { StoreOrderStatus, StorePaymentStatus } from '@/types/store';

export interface UpdateSaleOrderPayload {
  status?: StoreOrderStatus;
  payment_status?: StorePaymentStatus;
  payment_method?: string | null;
  notes?: string | null;
}
