import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createEmptyLineItem, type ShipmentLineItemForm } from '@/lib/shipment-form';

interface ShipmentLineItemsEditorProps {
  items: ShipmentLineItemForm[];
  onChange: (items: ShipmentLineItemForm[]) => void;
}

export function ShipmentLineItemsEditor({ items, onChange }: ShipmentLineItemsEditorProps) {
  const updateItem = (id: string, patch: Partial<ShipmentLineItemForm>) => {
    onChange(items.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((row) => row.id !== id));
  };

  return (
    <fieldset className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <legend className="px-1 text-sm font-semibold">📕 Pedido</legend>
      <ul className="space-y-2">
        {items.map((row, index) => (
          <li
            key={row.id}
            className="grid gap-2 rounded-md border bg-background p-2 sm:grid-cols-[1fr_5rem_4rem_4rem_auto]"
          >
            <div className="space-y-1 sm:col-span-1">
              <Label htmlFor={`line-desc-${row.id}`} className="sr-only">
                Producto {index + 1}
              </Label>
              <Input
                id={`line-desc-${row.id}`}
                value={row.description}
                onChange={(e) => updateItem(row.id, { description: e.target.value })}
                placeholder="Ej. Toner Original IM 430F"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`line-usd-${row.id}`} className="text-xs">
                USD
              </Label>
              <Input
                id={`line-usd-${row.id}`}
                type="number"
                min={0}
                step={0.01}
                value={row.unitPriceUsd}
                onChange={(e) => updateItem(row.id, { unitPriceUsd: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`line-qty-${row.id}`} className="text-xs">
                Cant.
              </Label>
              <Input
                id={`line-qty-${row.id}`}
                type="number"
                min={1}
                step={1}
                value={row.quantity}
                onChange={(e) => updateItem(row.id, { quantity: e.target.value })}
              />
            </div>
            <div className="flex items-end pb-0.5 text-xs font-medium text-muted-foreground">
              = $
              {(
                (Number(row.unitPriceUsd) || 0) * Math.max(1, Number(row.quantity) || 1)
              ).toFixed(0)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 self-end"
              disabled={items.length <= 1}
              aria-label={`Quitar línea ${index + 1}`}
              onClick={() => removeItem(row.id)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => onChange([...items, createEmptyLineItem()])}
      >
        <Plus className="size-4" aria-hidden="true" />
        Agregar producto
      </Button>
    </fieldset>
  );
}
