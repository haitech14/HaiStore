import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Building2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanySettings, useCompanySettingsMutation } from '@/hooks/use-company-settings';
import { DEFAULT_COMPANY_SETTINGS, type CompanySettings } from '@/types/company-settings';

export function SettingsPanel() {
  const { data, isLoading, isError } = useCompanySettings();
  const saveSettings = useCompanySettingsMutation();
  const [form, setForm] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateField = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateField('logoUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await saveSettings.mutateAsync(form);
      setMessage('Configuración guardada correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la configuración.');
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Cargando configuración…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Datos de la empresa y diseño de cotizaciones PDF. Los cambios se reflejan al generar nuevas
          cotizaciones.
        </p>
      </header>

      {isError && (
        <p role="alert" className="text-sm text-amber-700">
          No se pudo cargar la configuración del servidor. Se muestran valores por defecto.
        </p>
      )}

      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-8">
        <section className="rounded-xl border p-5">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="size-5 text-red-600" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Datos de la empresa</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="companyName">Nombre comercial</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(event) => updateField('companyName', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="legalName">Razón social</Label>
              <Input
                id="legalName"
                value={form.legalName}
                onChange={(event) => updateField('legalName', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="businessDescription">Descripción del negocio</Label>
              <textarea
                id="businessDescription"
                value={form.businessDescription}
                onChange={(event) => updateField('businessDescription', event.target.value)}
                rows={2}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tagline">Eslogan corto</Label>
              <Input
                id="tagline"
                value={form.tagline}
                onChange={(event) => updateField('tagline', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC</Label>
              <Input
                id="ruc"
                value={form.ruc}
                onChange={(event) => updateField('ruc', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(event) => updateField('website', event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(event) => updateField('address', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border p-5">
          <h3 className="mb-4 text-lg font-semibold">Proforma / Cotización PDF</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="logoUrl">Logo (URL o archivo)</Label>
              <Input
                id="logoUrl"
                value={form.logoUrl.startsWith('data:') ? '' : form.logoUrl}
                placeholder="/logo.png"
                onChange={(event) => updateField('logoUrl', event.target.value)}
              />
              <Input
                id="logoFile"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="cursor-pointer"
              />
              {form.logoUrl && (
                <img
                  src={form.logoUrl}
                  alt="Vista previa del logo"
                  className="mt-2 h-14 w-auto rounded border bg-white object-contain p-2"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteDocumentLabel">Etiqueta del documento</Label>
              <Input
                id="quoteDocumentLabel"
                value={form.quoteDocumentLabel}
                onChange={(event) => updateField('quoteDocumentLabel', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteNumberPrefix">Prefijo de cotización</Label>
              <Input
                id="quoteNumberPrefix"
                value={form.quoteNumberPrefix}
                onChange={(event) => updateField('quoteNumberPrefix', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteNextNumber">Próximo número</Label>
              <Input
                id="quoteNextNumber"
                type="number"
                min={1}
                value={form.quoteNextNumber}
                onChange={(event) => updateField('quoteNextNumber', Number(event.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currencyLabel">Moneda</Label>
              <Input
                id="currencyLabel"
                value={form.currencyLabel}
                onChange={(event) => updateField('currencyLabel', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultClientType">Tipo de cliente por defecto</Label>
              <Input
                id="defaultClientType"
                value={form.defaultClientType}
                onChange={(event) => updateField('defaultClientType', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportUrl">URL de soporte (QR)</Label>
              <Input
                id="supportUrl"
                type="url"
                value={form.supportUrl}
                onChange={(event) => updateField('supportUrl', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Color principal</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={form.primaryColor}
                  onChange={(event) => updateField('primaryColor', event.target.value)}
                  className="h-10 w-16 cursor-pointer p-1"
                />
                <Input
                  value={form.primaryColor}
                  onChange={(event) => updateField('primaryColor', event.target.value)}
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteValidityDays">Validez (días)</Label>
              <Input
                id="quoteValidityDays"
                type="number"
                min={1}
                value={form.quoteValidityDays}
                onChange={(event) => updateField('quoteValidityDays', Number(event.target.value) || 3)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bankAccountsText">Cuentas bancarias (una por línea)</Label>
              <textarea
                id="bankAccountsText"
                value={form.bankAccountsText}
                onChange={(event) => updateField('bankAccountsText', event.target.value)}
                rows={4}
                className="flex min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="quoteTermsText">Términos y condiciones (una por línea)</Label>
              <textarea
                id="quoteTermsText"
                value={form.quoteTermsText}
                onChange={(event) => updateField('quoteTermsText', event.target.value)}
                rows={4}
                className="flex min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="quoteFooterText">Mensaje legal del pie</Label>
              <Input
                id="quoteFooterText"
                value={form.quoteFooterText}
                onChange={(event) => updateField('quoteFooterText', event.target.value)}
              />
            </div>
          </div>
        </section>

        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saveSettings.isPending}
            className="gap-2 bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600"
          >
            <Save className="size-4" aria-hidden="true" />
            {saveSettings.isPending ? 'Guardando…' : 'Guardar configuración'}
          </Button>
        </div>
      </form>
    </div>
  );
}
