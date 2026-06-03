import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  HaitechClientForm,
} from '@/components/admin/shared/haitech-client-form';
import {
  haitechFormToTpvCustomer,
  tpvCustomerToHaitechForm,
} from '@/lib/haitech-client-mappers';
import type { HaitechClientFormValues } from '@/lib/haitech-client-schema';
import type { TpvCurrency, TpvCustomer } from '@/types/tpv';

interface TpvCustomerFormProps {
  customer: TpvCustomer;
  onChange: (customer: TpvCustomer) => void;
}

export function TpvCustomerForm({ customer, onChange }: TpvCustomerFormProps) {
  const handleClientChange = (values: HaitechClientFormValues) => {
    onChange(haitechFormToTpvCustomer(values, customer.currency));
  };

  return (
    <div className="space-y-3">
      <HaitechClientForm
        value={tpvCustomerToHaitechForm(customer)}
        onChange={handleClientChange}
        idPrefix="tpv"
      />

      <div className="space-y-1.5">
        <Label htmlFor="tpv-currency">Moneda</Label>
        <Select
          value={customer.currency}
          onValueChange={(v) => onChange({ ...customer, currency: v as TpvCurrency })}
        >
          <SelectTrigger id="tpv-currency" className="w-full">
            <SelectValue placeholder="Moneda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PEN">Soles (PEN)</SelectItem>
            <SelectItem value="USD">Dólares (USD)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
