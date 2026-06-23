import { HaitechClientForm } from '@/components/admin/shared/haitech-client-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { haitechClientSchema, type HaitechClientFormValues } from '@/lib/haitech-client-schema';

interface CheckoutStepShippingProps {
  client: HaitechClientFormValues;
  onClientChange: (client: HaitechClientFormValues) => void;
  onBack: () => void;
  onContinue: () => void;
  error: string | null;
  prefilledFromAccount?: boolean;
}

export function CheckoutStepShipping({
  client,
  onClientChange,
  onBack,
  onContinue,
  error,
  prefilledFromAccount = false,
}: CheckoutStepShippingProps) {
  const handleContinue = () => {
    const withEmail = { ...client, email: client.email?.trim() || '' };
    const parsed = haitechClientSchema.safeParse(withEmail);
    if (!parsed.success) {
      return;
    }
    if (!parsed.data.email?.trim()) {
      return;
    }
    onContinue();
  };

  const parsed = haitechClientSchema.safeParse({
    ...client,
    email: client.email?.trim() || '',
  });
  const validationError =
    !client.email?.trim()
      ? 'El correo electrónico es obligatorio para confirmar tu pedido.'
      : parsed.success
        ? null
        : (parsed.error.issues[0]?.message ?? 'Datos inválidos');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Datos de facturación y envío</CardTitle>
          <CardDescription>
            Usaremos estos datos para la entrega y la confirmación del pedido.
            {prefilledFromAccount ? (
              <span className="mt-1 block text-emerald-700">
                Datos cargados desde tu cuenta. Puedes editarlos antes de continuar.
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HaitechClientForm
            value={client}
            onChange={onClientChange}
            idPrefix="checkout"
            showEmail
          />
        </CardContent>
      </Card>

      {error || validationError ? (
        <p role="alert" className="text-sm text-red-600">
          {error ?? validationError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack} className="min-h-11 flex-1">
          Volver
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={Boolean(validationError)}
          className="min-h-11 flex-1 bg-red-600 font-semibold hover:bg-red-500"
        >
          Continuar al pago
        </Button>
      </div>
    </div>
  );
}
