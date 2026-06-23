import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';

import { CheckoutCulqiForm } from '@/components/checkout/checkout-culqi-form';
import { CheckoutManualInstructions } from '@/components/checkout/checkout-manual-instructions';
import { CheckoutMercadoPagoButton } from '@/components/checkout/checkout-mercadopago-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type CheckoutPaymentProvider,
  type ManualPaymentMethodId,
} from '@/lib/build-checkout-session-payload';
import { cn } from '@/lib/utils';
import type { CheckoutPaymentOptions } from '@/types/checkout';

const MANUAL_METHODS: Array<{ id: ManualPaymentMethodId; label: string }> = [
  { id: 'transferencia', label: 'Transferencia bancaria / depósito' },
  { id: 'yape-plin', label: 'Yape / Plin' },
  { id: 'contra-entrega', label: 'Pago contra entrega (Lima)' },
];

interface CheckoutStepPaymentProps {
  paymentProvider: CheckoutPaymentProvider;
  manualMethod: ManualPaymentMethodId;
  paymentOptions: CheckoutPaymentOptions | undefined;
  email: string;
  totalPen: number;
  orderNumber: string | null;
  isSubmitting: boolean;
  error: string | null;
  onPaymentProviderChange: (provider: CheckoutPaymentProvider) => void;
  onManualMethodChange: (method: ManualPaymentMethodId) => void;
  onBack: () => void;
  onConfirmManual: () => void;
  onCulqiToken: (token: string) => void;
  onCulqiError: (message: string) => void;
  onMercadoPago: () => void;
}

export function CheckoutStepPayment({
  paymentProvider,
  manualMethod,
  paymentOptions,
  email,
  totalPen,
  orderNumber,
  isSubmitting,
  error,
  onPaymentProviderChange,
  onManualMethodChange,
  onBack,
  onConfirmManual,
  onCulqiToken,
  onCulqiError,
  onMercadoPago,
}: CheckoutStepPaymentProps) {
  const providerOptions = useMemo(() => {
    const options: Array<{ id: CheckoutPaymentProvider; label: string; enabled: boolean }> = [
      { id: 'manual', label: 'Pago manual', enabled: paymentOptions?.manual !== false },
      { id: 'culqi', label: 'Tarjeta de crédito/débito', enabled: Boolean(paymentOptions?.culqi) },
      {
        id: 'mercadopago',
        label: 'Mercado Pago',
        enabled: Boolean(paymentOptions?.mercadopago),
      },
    ];
    return options.filter((option) => option.enabled);
  }, [paymentOptions]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Forma de pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset>
            <legend className="sr-only">Seleccione forma de pago</legend>
            <div className="space-y-2">
              {providerOptions.map((option) => {
                const selected = paymentProvider === option.id;
                return (
                  <label
                    key={option.id}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                      selected
                        ? 'border-red-600 bg-red-50/60'
                        : 'border-border hover:bg-muted/30',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment-provider"
                      value={option.id}
                      checked={selected}
                      onChange={() => onPaymentProviderChange(option.id)}
                      className="size-4 accent-red-600"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {paymentProvider === 'manual' ? (
            <div className="space-y-3">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-foreground">Método manual</legend>
                <div className="space-y-2">
                  {MANUAL_METHODS.map((method) => {
                    const selected = manualMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className={cn(
                          'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm',
                          selected ? 'border-red-600/60 bg-muted/30' : 'border-border',
                        )}
                      >
                        <input
                          type="radio"
                          name="manual-method"
                          value={method.id}
                          checked={selected}
                          onChange={() => onManualMethodChange(method.id)}
                          className="size-4 accent-red-600"
                        />
                        <span>{method.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <CheckoutManualInstructions method={manualMethod} />
            </div>
          ) : null}

          {paymentProvider === 'culqi' && paymentOptions?.culqiPublicKey && orderNumber ? (
            <CheckoutCulqiForm
              publicKey={paymentOptions.culqiPublicKey}
              email={email}
              amountPen={totalPen}
              orderNumber={orderNumber}
              onToken={onCulqiToken}
              onError={onCulqiError}
              disabled={isSubmitting}
            />
          ) : null}

          {paymentProvider === 'mercadopago' ? (
            <CheckoutMercadoPagoButton
              onPay={onMercadoPago}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          ) : null}
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack} className="min-h-11 flex-1">
          Volver
        </Button>
        {paymentProvider === 'manual' ? (
          <Button
            type="button"
            onClick={onConfirmManual}
            disabled={isSubmitting}
            className="min-h-11 flex-1 bg-red-600 font-semibold hover:bg-red-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Procesando…
              </>
            ) : (
              'Confirmar pedido'
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
