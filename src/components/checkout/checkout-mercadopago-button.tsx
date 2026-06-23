import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CheckoutMercadoPagoButtonProps {
  onPay: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function CheckoutMercadoPagoButton({
  onPay,
  disabled,
  loading,
}: CheckoutMercadoPagoButtonProps) {
  return (
    <Button
      type="button"
      className="min-h-11 w-full bg-[#009ee3] font-semibold text-white hover:bg-[#008ecf]"
      disabled={disabled || loading}
      onClick={onPay}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      Pagar con Mercado Pago
    </Button>
  );
}
