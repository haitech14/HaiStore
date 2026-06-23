import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import { isPriceRole } from '@/lib/roles';

export interface CheckoutAccountClientResponse {
  checkoutClient?: Partial<HaitechClientFormValues> | null;
}

/** Rellena solo campos vacíos del formulario con datos de cuenta. */
export function applyCheckoutClientPrefill(
  current: HaitechClientFormValues,
  partial: Partial<HaitechClientFormValues>,
): HaitechClientFormValues {
  const next = { ...current };

  const assignIfEmpty = <K extends keyof HaitechClientFormValues>(
    key: K,
    value: HaitechClientFormValues[K] | undefined | null,
  ) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && !value.trim()) return;

    const existing = next[key];
    const existingEmpty =
      existing === null ||
      existing === undefined ||
      (typeof existing === 'string' && !existing.trim());

    if (!existingEmpty) return;
    next[key] = value;
  };

  assignIfEmpty('storeCustomerId', partial.storeCustomerId ?? null);
  assignIfEmpty('haisupportClientId', partial.haisupportClientId ?? null);
  assignIfEmpty('nombre', partial.nombre);
  assignIfEmpty('nombreContacto', partial.nombreContacto);
  assignIfEmpty('rucDni', partial.rucDni);
  assignIfEmpty('telefono', partial.telefono);
  assignIfEmpty('direccion', partial.direccion);
  assignIfEmpty('ciudad', partial.ciudad);
  assignIfEmpty('email', partial.email);
  assignIfEmpty('notas', partial.notas);

  if (partial.tipoCliente && isPriceRole(partial.tipoCliente) && next.tipoCliente === 'public') {
    next.tipoCliente = partial.tipoCliente;
  }

  return next;
}

export function normalizeCheckoutAccountClient(
  raw: Partial<HaitechClientFormValues> | null | undefined,
): Partial<HaitechClientFormValues> | null {
  if (!raw || typeof raw !== 'object') return null;

  const normalized: Partial<HaitechClientFormValues> = {};

  if (raw.storeCustomerId) normalized.storeCustomerId = String(raw.storeCustomerId);
  if (raw.haisupportClientId) normalized.haisupportClientId = String(raw.haisupportClientId);
  if (raw.nombre?.trim()) normalized.nombre = raw.nombre.trim();
  if (raw.nombreContacto?.trim()) normalized.nombreContacto = raw.nombreContacto.trim();
  if (raw.rucDni?.trim()) normalized.rucDni = raw.rucDni.trim();
  if (raw.telefono?.trim()) normalized.telefono = raw.telefono.trim();
  if (raw.direccion?.trim()) normalized.direccion = raw.direccion.trim();
  if (raw.ciudad?.trim()) normalized.ciudad = raw.ciudad.trim();
  if (raw.email?.trim()) normalized.email = raw.email.trim();
  if (raw.notas?.trim()) normalized.notas = raw.notas.trim();
  if (raw.tipoCliente && isPriceRole(raw.tipoCliente)) {
    normalized.tipoCliente = raw.tipoCliente;
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}
