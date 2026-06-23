import type { CheckoutPaymentProvider } from '@/lib/build-checkout-session-payload';

export interface CheckoutSessionOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_provider: CheckoutPaymentProvider | string | null;
  total_usd: number;
  total_pen: number | null;
  currency: string;
  payment_method: string | null;
}

export interface CheckoutPaymentOptions {
  manual: boolean;
  culqi: boolean;
  mercadopago: boolean;
  culqiPublicKey: string | null;
}

export interface CheckoutSessionResponse {
  order: CheckoutSessionOrder;
  paymentOptions: CheckoutPaymentOptions;
}

export interface CheckoutOrderStatusResponse {
  order: {
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string | null;
    payment_provider: string | null;
    total_usd: number;
    total_pen: number | null;
    currency: string;
  };
}
