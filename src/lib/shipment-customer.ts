import type { StoreCustomerSearchResult } from '@/types/store-customer';

function billingField<T>(billing: Record<string, unknown> | null | undefined, key: string): T | undefined {
  if (!billing || typeof billing !== 'object') return undefined;
  return billing[key] as T | undefined;
}

export function shipmentCustomerDisplayName(row: StoreCustomerSearchResult): string {
  return row.company_name?.trim() || row.full_name?.trim() || row.email;
}

export function shipmentCustomerDistrict(row: StoreCustomerSearchResult): string {
  const billing = row.default_billing;
  const district = billingField<string>(billing, 'district')?.trim();
  if (district) return district;

  const city = billingField<string>(billing, 'city')?.trim();
  if (city) return city;

  const address = billingField<string>(billing, 'address')?.trim();
  if (!address) return '';

  const firstPart = address.split(',')[0]?.trim();
  return firstPart ?? '';
}

export function shipmentCustomerPhone(row: StoreCustomerSearchResult): string {
  return row.phone?.trim() ?? '';
}
