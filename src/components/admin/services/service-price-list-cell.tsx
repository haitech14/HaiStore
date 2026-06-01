import type { KeyboardEvent, ReactNode } from 'react';

import { InventoryInlineField } from '@/components/admin/inventory/inventory-inline-field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  isServicePriceListPriceColumn,
  type ServicePriceListColumnId,
} from '@/lib/service-price-list-columns';
import { cn } from '@/lib/utils';
import { PRICE_ROLE_LABELS, type PriceRole } from '@/types/product';
import { updateServicePriceItem } from '@/lib/services-storage';
import type { ServiceCategory, ServicePriceItem } from '@/types/service';

function formatPen(value: number | undefined): string {
  const amount = Number.isFinite(value) ? (value as number) : 0;
  return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface ServicePriceListCellProps {
  row: ServicePriceItem;
  columnId: ServicePriceListColumnId;
  categories: ServiceCategory[];
  categoryName: (id: string) => string;
  activeFieldId: string | null;
  onActivate: (fieldId: string) => void;
  onDeactivate: () => void;
  onPatch: (patch: Parameters<typeof updateServicePriceItem>[1]) => void;
  showMobileCategory?: boolean;
}

function stopEditKeys(
  event: KeyboardEvent<HTMLInputElement>,
  onDeactivate: () => void,
): void {
  if (event.key === 'Escape') {
    onDeactivate();
  }
}

function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-3 py-2', className)}>{children}</td>;
}

interface CategoryFieldProps {
  row: ServicePriceItem;
  categories: ServiceCategory[];
  categoryName: (id: string) => string;
  fieldId: string;
  activeFieldId: string | null;
  onActivate: (fieldId: string) => void;
  onDeactivate: () => void;
  onPatch: (patch: Parameters<typeof updateServicePriceItem>[1]) => void;
}

function ServicePriceCategoryField({
  row,
  categories,
  categoryName,
  fieldId,
  activeFieldId,
  onActivate,
  onDeactivate,
  onPatch,
}: CategoryFieldProps) {
  return (
    <InventoryInlineField
      fieldId={fieldId}
      activeFieldId={activeFieldId}
      onActivate={() => onActivate(fieldId)}
      onClose={onDeactivate}
      display={
        <span className="flex min-h-9 max-w-[12rem] items-center truncate text-muted-foreground">
          {categoryName(row.categoryId)}
        </span>
      }
      edit={
        <Select
          defaultValue={row.categoryId}
          onValueChange={(value) => {
            onPatch({ categoryId: value });
            onDeactivate();
          }}
        >
          <SelectTrigger className="h-9 max-w-[12rem]" aria-label="Categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    />
  );
}

export function ServicePriceListCell({
  row,
  columnId,
  categories,
  categoryName,
  activeFieldId,
  onActivate,
  onDeactivate,
  onPatch,
  showMobileCategory = false,
}: ServicePriceListCellProps) {
  const fieldId = `${row.id}:${columnId}`;
  const categoryFieldId = `${row.id}:category`;

  if (columnId === 'code') {
    return (
      <TableCell>
        <InventoryInlineField
          fieldId={fieldId}
          activeFieldId={activeFieldId}
          onActivate={() => onActivate(fieldId)}
          onClose={onDeactivate}
          display={
            <span className="flex min-h-9 items-center font-mono text-xs">{row.code}</span>
          }
          edit={
            <Input
              defaultValue={row.code}
              className="h-9 min-w-[6.5rem] font-mono text-xs"
              autoFocus
              aria-label="Código"
              onBlur={(event) => {
                onPatch({ code: event.target.value });
                onDeactivate();
              }}
              onKeyDown={(event) => {
                stopEditKeys(event, onDeactivate);
                if (event.key === 'Enter') event.currentTarget.blur();
              }}
            />
          }
        />
      </TableCell>
    );
  }

  if (columnId === 'name') {
    return (
      <TableCell>
        <InventoryInlineField
          fieldId={fieldId}
          activeFieldId={activeFieldId}
          onActivate={() => onActivate(fieldId)}
          onClose={onDeactivate}
          display={<span className="flex min-h-9 items-center">{row.name}</span>}
          edit={
            <Input
              defaultValue={row.name}
              className="h-9 min-w-[10rem]"
              autoFocus
              aria-label="Nombre del servicio"
              onBlur={(event) => {
                onPatch({ name: event.target.value });
                onDeactivate();
              }}
              onKeyDown={(event) => {
                stopEditKeys(event, onDeactivate);
                if (event.key === 'Enter') event.currentTarget.blur();
              }}
            />
          }
        />
        {showMobileCategory ? (
          <div className="mt-1 md:hidden">
            <ServicePriceCategoryField
              row={row}
              categories={categories}
              categoryName={categoryName}
              fieldId={categoryFieldId}
              activeFieldId={activeFieldId}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              onPatch={onPatch}
            />
          </div>
        ) : null}
      </TableCell>
    );
  }

  if (columnId === 'category') {
    return (
      <TableCell className="hidden md:table-cell">
        <ServicePriceCategoryField
          row={row}
          categories={categories}
          categoryName={categoryName}
          fieldId={fieldId}
          activeFieldId={activeFieldId}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onPatch={onPatch}
        />
      </TableCell>
    );
  }

  if (isServicePriceListPriceColumn(columnId)) {
    const role = columnId as PriceRole;
    const price = row.prices?.[role] ?? 0;
    return (
      <TableCell className="text-right">
        <InventoryInlineField
          fieldId={fieldId}
          activeFieldId={activeFieldId}
          onActivate={() => onActivate(fieldId)}
          onClose={onDeactivate}
          align="end"
          display={
            <span className="flex min-h-9 items-center justify-end tabular-nums">
              {formatPen(price)}
            </span>
          }
          edit={
            <div className="relative inline-block w-[5.75rem]">
              <span
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground"
                aria-hidden="true"
              >
                S/
              </span>
              <Input
                type="number"
                min={0}
                step={0.01}
                inputMode="decimal"
                defaultValue={price}
                className="h-9 w-full pl-7 pr-2 text-right text-sm tabular-nums"
                autoFocus
                aria-label={`${PRICE_ROLE_LABELS[role]} en soles`}
                onBlur={(event) => {
                  const value = Number.parseFloat(event.target.value);
                  onPatch({
                    prices: {
                      [role]: Number.isFinite(value) ? value : 0,
                    } as Partial<Record<PriceRole, number>>,
                  });
                  onDeactivate();
                }}
                onKeyDown={(event) => {
                  stopEditKeys(event, onDeactivate);
                  if (event.key === 'Enter') event.currentTarget.blur();
                }}
              />
            </div>
          }
        />
      </TableCell>
    );
  }

  return null;
}
