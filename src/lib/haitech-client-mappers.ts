import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import { storeCustomerToTpvCustomer } from '@/lib/tpv-customer';
import type { HaitechClient } from '@/types/haitech-domain';
import type { StoreCustomerSearchResult } from '@/types/store-customer';
import type { TpvCustomer, TpvCurrency } from '@/types/tpv';

export function searchResultToHaitechClient(row: StoreCustomerSearchResult): HaitechClientFormValues {
  const tpv = storeCustomerToTpvCustomer(row);
  return {
    storeCustomerId: row.id,
    haisupportClientId: row.source === 'haisupport' ? row.id : null,
    nombre: tpv.razonSocial,
    nombreContacto: tpv.atencion,
    rucDni: tpv.documento,
    telefono: tpv.celular,
    direccion: tpv.direccion,
    ciudad: tpv.ciudad ?? 'Lima',
    tipoCliente: tpv.priceList,
    email: row.email ?? '',
    notas: '',
  };
}

export function haitechFormToClient(values: HaitechClientFormValues): HaitechClient {
  return {
    storeCustomerId: values.storeCustomerId ?? null,
    haisupportClientId: values.haisupportClientId ?? null,
    nombre: values.nombre.trim(),
    nombreContacto: values.nombreContacto.trim(),
    rucDni: values.rucDni.trim(),
    telefono: values.telefono.trim(),
    direccion: values.direccion.trim(),
    ciudad: values.ciudad.trim(),
    tipoCliente: values.tipoCliente,
    email: values.email?.trim() || null,
    notas: values.notas?.trim() || null,
    source: 'haistore',
  };
}

export function haitechFormToTpvCustomer(
  values: HaitechClientFormValues,
  currency: TpvCurrency = 'PEN',
): TpvCustomer {
  return {
    storeCustomerId: values.storeCustomerId ?? null,
    razonSocial: values.nombre.trim(),
    documento: values.rucDni.trim(),
    atencion: values.nombreContacto.trim(),
    celular: values.telefono.trim(),
    direccion: values.direccion.trim(),
    ciudad: values.ciudad.trim(),
    priceList: values.tipoCliente,
    currency,
  };
}

export function tpvCustomerToHaitechForm(customer: TpvCustomer): HaitechClientFormValues {
  return {
    storeCustomerId: customer.storeCustomerId ?? null,
    haisupportClientId: null,
    nombre: customer.razonSocial,
    nombreContacto: customer.atencion,
    rucDni: customer.documento,
    telefono: customer.celular,
    direccion: customer.direccion,
    ciudad: customer.ciudad ?? 'Lima',
    tipoCliente: customer.priceList,
    email: '',
    notas: '',
  };
}

export function quoteFormToHaitechClient(values: {
  razonSocial: string;
  ruc: string;
  atencion: string;
  celular: string;
  ciudad: string;
}): HaitechClient {
  return {
    nombre: values.razonSocial.trim(),
    nombreContacto: values.atencion.trim(),
    rucDni: values.ruc.trim(),
    telefono: values.celular.trim(),
    direccion: values.ciudad.trim(),
    ciudad: values.ciudad.trim(),
    tipoCliente: 'public',
    source: 'haistore',
  };
}
