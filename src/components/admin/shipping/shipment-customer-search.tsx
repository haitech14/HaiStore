import { useId, useState } from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTpvCustomerSearch } from '@/hooks/use-tpv-customers';
import { applyStoreCustomerToForm, type ShipmentFormState } from '@/lib/shipment-form';
import { customerDisplayLabel } from '@/lib/tpv-customer';
import { cn } from '@/lib/utils';
import type { StoreCustomerSearchResult } from '@/types/store-customer';

interface ShipmentCustomerSearchProps {
  form: ShipmentFormState;
  onFormChange: (form: ShipmentFormState) => void;
}

export function ShipmentCustomerSearch({ form, onFormChange }: ShipmentCustomerSearchProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(form.razonSocial);

  const searchTerm =
    form.taxId.trim().length >= 2
      ? form.taxId
      : form.razonSocial.trim().length >= 2
        ? form.razonSocial
        : query;

  const { data: suggestions = [], isFetching } = useTpvCustomerSearch(searchTerm);

  const applyCustomer = (row: StoreCustomerSearchResult) => {
    const next = applyStoreCustomerToForm(form, row);
    onFormChange(next);
    setQuery(next.razonSocial);
    setOpen(false);
  };

  const showList = open && searchTerm.trim().length >= 2 && (isFetching || suggestions.length > 0);

  return (
    <div className="relative space-y-1.5">
      <Label htmlFor="shipment-razon">Razón social</Label>
      <Input
        id="shipment-razon"
        value={form.razonSocial}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={showList}
        placeholder="Buscar por nombre, RUC o correo…"
        onChange={(event) => {
          const value = event.target.value;
          onFormChange({ ...form, razonSocial: value });
          setQuery(value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
        >
          {isFetching && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Buscando…</li>
          ) : null}
          {suggestions.map((row) => (
            <li key={row.id} role="option">
              <button
                type="button"
                className={cn(
                  'flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyCustomer(row)}
              >
                <span className="font-medium">{customerDisplayLabel(row)}</span>
                {row.email && <span className="text-xs text-muted-foreground">{row.email}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
