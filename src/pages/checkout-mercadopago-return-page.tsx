import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCheckoutOrderStatus } from '@/hooks/use-checkout-session';
import { useSeo } from '@/hooks/use-seo';

export function CheckoutMercadoPagoReturnPage() {
  useSeo({ title: 'Procesando pago | Haitech', robots: 'noindex,nofollow' });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const orderNumber = searchParams.get('order')?.trim() ?? '';

  const { data, isLoading } = useCheckoutOrderStatus(orderNumber, Boolean(orderNumber));

  useEffect(() => {
    if (!orderNumber) return;
    if (data?.order?.payment_status === 'paid') {
      navigate(
        `/mi-cuenta?tab=pedidos&orden=${encodeURIComponent(orderNumber)}`,
        { replace: true },
      );
    }
  }, [data?.order?.payment_status, navigate, orderNumber]);

  const paymentStatus = data?.order?.payment_status;
  const isPending = status === 'pending' || paymentStatus === 'pending';
  const isFailure = status === 'failure' || paymentStatus === 'failed';

  return (
    <div className="container max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isLoading || (isPending && !isFailure) ? (
              <Loader2 className="size-5 animate-spin text-red-600" aria-hidden="true" />
            ) : null}
            {isFailure ? 'Pago no completado' : 'Verificando pago'}
          </CardTitle>
          <CardDescription>
            {isFailure
              ? 'Tu pago con Mercado Pago no se completó. Puedes intentar nuevamente desde el checkout.'
              : 'Estamos confirmando tu pago con Mercado Pago. Esto puede tardar unos segundos.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {orderNumber ? (
            <p className="text-sm text-muted-foreground">
              Pedido: <span className="font-mono font-semibold">{orderNumber}</span>
            </p>
          ) : null}
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/checkout">Volver al checkout</Link>
          </Button>
          <Button asChild className="min-h-11 bg-red-600 hover:bg-red-500">
            <Link to="/tienda">Ir a la tienda</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
