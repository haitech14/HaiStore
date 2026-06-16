import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { useAdminInventory } from '@/hooks/use-products';
import {
  buildAttributeNameCatalog,
  formatAttributeLabel,
  normalizeAttributes,
} from '@/lib/inventory-attributes';
import { cn } from '@/lib/utils';
import type { ProductAttribute } from '@/types/product';

import { InventoryAttributesEditor } from './inventory-attributes-editor';

interface InventoryAttributesCellProps {
  attributes: ProductAttribute[];
  onSave: (attributes: ProductAttribute[]) => void | Promise<void>;
}

const VISIBLE_COUNT = 2;
const TEXT_SAVE_MS = 350;

function AttributesPreview({ attributes }: { attributes: ProductAttribute[] }) {
  if (attributes.length === 0) {
    return <span className="text-xs text-muted-foreground">Sin atributos</span>;
  }

  const visible = attributes.slice(0, VISIBLE_COUNT);
  const rest = attributes.length - visible.length;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      {visible.map((attribute) => (
        <Badge
          key={attribute.id}
          variant="outline"
          className="max-w-full justify-start truncate font-normal"
          title={formatAttributeLabel(attribute)}
        >
          {formatAttributeLabel(attribute)}
        </Badge>
      ))}
      {rest > 0 && (
        <span className="text-[0.65rem] text-muted-foreground">+{rest} más</span>
      )}
    </div>
  );
}

export function InventoryAttributesCell({ attributes, onSave }: InventoryAttributesCellProps) {
  const { data: products = [] } = useAdminInventory();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(attributes);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const saveTimerRef = useRef<number | null>(null);
  const savedTimerRef = useRef<number | null>(null);
  const draftRef = useRef(draft);
  const wasOpenRef = useRef(false);

  const normalized = useMemo(() => normalizeAttributes(attributes), [attributes]);

  const displayAttributes = useMemo(
    () => (open ? normalizeAttributes(draft) : normalized),
    [open, draft, normalized],
  );

  const nameOptions = useMemo(() => {
    const catalog = buildAttributeNameCatalog(products);
    for (const row of draft) {
      const name = row.name?.trim();
      if (name && !catalog.includes(name)) catalog.push(name);
    }
    return catalog.sort((a, b) => a.localeCompare(b, 'es'));
  }, [products, draft]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(normalized);
    }
    wasOpenRef.current = open;
  }, [open, normalized]);

  useEffect(() => {
    if (!open) setDraft(normalized);
  }, [normalized, open]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
    };
  }, []);

  const persist = useCallback(
    async (next: ProductAttribute[]) => {
      setSaveState('saving');
      try {
        await onSave(normalizeAttributes(next));
        setSaveState('saved');
        if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
        savedTimerRef.current = window.setTimeout(() => setSaveState('idle'), 1500);
      } catch {
        setSaveState('error');
      }
    },
    [onSave],
  );

  const scheduleSave = useCallback(
    (next: ProductAttribute[], immediate = false) => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      if (immediate) {
        void persist(next);
        return;
      }
      saveTimerRef.current = window.setTimeout(() => {
        void persist(next);
      }, TEXT_SAVE_MS);
    },
    [persist],
  );

  const handleDraftChange = (next: ProductAttribute[], immediate = false) => {
    setDraft(next);
    scheduleSave(next, immediate);
  };

  const flushSave = useCallback(async () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    await persist(draftRef.current);
  }, [persist]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && open) {
      void flushSave();
    }
    setOpen(nextOpen);
  };

  const saveHint =
    saveState === 'saving'
      ? 'Guardando…'
      : saveState === 'saved'
        ? 'Guardado'
        : saveState === 'error'
          ? 'Error al guardar'
          : null;

  return (
    <div className="group relative min-h-9 min-w-0 pr-7">
      <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
        <PopoverAnchor asChild>
          <button
            type="button"
            className={cn(
              'min-h-9 w-full cursor-pointer rounded-sm text-left outline-none',
              'hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring',
            )}
            onClick={() => setOpen(true)}
            aria-label="Editar atributos"
          >
            <AttributesPreview attributes={displayAttributes} />
          </button>
        </PopoverAnchor>
        <PopoverContent
          className="z-[200] w-[min(100vw-2rem,22rem)] p-3"
          align="start"
          side="bottom"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Atributos del producto</p>
            {saveHint ? (
              <span
                className={cn(
                  'text-[0.65rem] font-medium',
                  saveState === 'error' ? 'text-destructive' : 'text-muted-foreground',
                )}
                role="status"
                aria-live="polite"
              >
                {saveHint}
              </span>
            ) : null}
          </div>
          <InventoryAttributesEditor
            attributes={draft}
            onChange={handleDraftChange}
            nameOptions={nameOptions}
            products={products}
            idPrefix="table-attr"
          />
          <div className="mt-3 flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute top-1/2 z-10 size-6 min-h-6 min-w-6 -translate-y-1/2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 right-0"
        onClick={() => setOpen(true)}
        aria-label="Editar atributos"
      >
        <Pencil className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
