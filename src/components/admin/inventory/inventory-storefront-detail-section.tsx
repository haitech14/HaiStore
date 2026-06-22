import { useCallback, useEffect, useMemo } from 'react';
import { ArrowDownUp, LayoutGrid, ListChecks, RefreshCw } from 'lucide-react';

import { InventoryFormSection } from '@/components/admin/inventory/inventory-form-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateDefaultStorefrontDetail, isPrinterEquipment } from '@/lib/build-product-detail';
import {
  descriptionTextToHeroBullets,
  heroBulletsToDescriptionText,
  normalizeStorefrontFeatureBar,
  normalizeStorefrontHeroBullets,
  resolveStorefrontIcon,
  STOREFRONT_ICON_KEYS,
  STOREFRONT_ICON_LABELS,
} from '@/lib/product-storefront-detail';
import { cn } from '@/lib/utils';
import type { InventoryProduct, Product } from '@/types/product';
import type { StoredFeatureBarItem, StoredHeroBullet } from '@/types/product-storefront';

interface InventoryStorefrontDetailSectionProps {
  form: InventoryProduct;
  onChange: (patch: Partial<InventoryProduct>) => void;
}

function inventoryProductAsCatalogProduct(form: InventoryProduct): Product {
  return {
    ...form,
    price: form.prices.public ?? 0,
    description: form.description ?? null,
  };
}

const EMPTY_FEATURE_SLOT: StoredFeatureBarItem = {
  icon: 'Printer',
  title: '',
  subtitle: '',
};

function ensureFeatureBarSlots(items: StoredFeatureBarItem[]): StoredFeatureBarItem[] {
  const normalized = normalizeStorefrontFeatureBar(items);
  const slots = [...normalized];
  while (slots.length < 6) {
    slots.push({ ...EMPTY_FEATURE_SLOT });
  }
  return slots.slice(0, 6);
}

export function InventoryStorefrontDetailSection({
  form,
  onChange,
}: InventoryStorefrontDetailSectionProps) {
  const isPrinter = isPrinterEquipment(inventoryProductAsCatalogProduct(form));

  const featureBar = useMemo(
    () => ensureFeatureBarSlots(form.storefront_feature_bar ?? []),
    [form.storefront_feature_bar],
  );

  const heroBullets = useMemo(
    () => normalizeStorefrontHeroBullets(form.storefront_hero_bullets),
    [form.storefront_hero_bullets],
  );

  const syncFromAttributes = useCallback(() => {
    const catalogProduct = inventoryProductAsCatalogProduct(form);
    const generated = generateDefaultStorefrontDetail(catalogProduct);
    onChange({
      storefront_feature_bar: generated.featureBar,
      storefront_hero_bullets: generated.heroBullets,
      description:
        form.description?.trim() ||
        heroBulletsToDescriptionText(generated.heroBullets) ||
        form.description,
    });
  }, [form, onChange]);

  useEffect(() => {
    if (!isPrinter) return;
    const hasFeatureBar = normalizeStorefrontFeatureBar(form.storefront_feature_bar).some(
      (item) => item.title && item.subtitle,
    );
    const hasBullets = normalizeStorefrontHeroBullets(form.storefront_hero_bullets).length > 0;
    const hasDescription = Boolean(form.description?.trim());
    if (hasFeatureBar || hasBullets || hasDescription) return;

    const generated = generateDefaultStorefrontDetail(inventoryProductAsCatalogProduct(form));
    if (generated.featureBar.length === 0 && generated.heroBullets.length === 0) return;

    onChange({
      storefront_feature_bar: generated.featureBar,
      storefront_hero_bullets: generated.heroBullets,
      description: heroBulletsToDescriptionText(generated.heroBullets),
    });
  }, [form.id, isPrinter, onChange]);

  const updateFeatureBarItem = (index: number, patch: Partial<StoredFeatureBarItem>) => {
    const next = featureBar.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange({ storefront_feature_bar: normalizeStorefrontFeatureBar(next) });
  };

  const updateHeroBullet = (index: number, patch: Partial<StoredHeroBullet>) => {
    const next = heroBullets.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange({ storefront_hero_bullets: normalizeStorefrontHeroBullets(next) });
  };

  const addHeroBullet = () => {
    onChange({
      storefront_hero_bullets: [
        ...heroBullets,
        { icon: 'Printer', text: '' },
      ],
    });
  };

  const removeHeroBullet = (index: number) => {
    onChange({
      storefront_hero_bullets: heroBullets.filter((_, i) => i !== index),
    });
  };

  const applyBulletsToDescription = () => {
    const text = heroBulletsToDescriptionText(heroBullets);
    if (!text) return;
    onChange({ description: text });
  };

  const importBulletsFromDescription = () => {
    const imported = descriptionTextToHeroBullets(form.description, heroBullets);
    if (imported.length === 0) return;
    onChange({ storefront_hero_bullets: imported });
  };

  if (!isPrinter) {
    return (
      <InventoryFormSection
        id="inv-storefront-detail"
        title="Ficha de tienda"
        icon={LayoutGrid}
        description="Disponible para equipos de impresión (multifuncionales, impresoras)."
      >
        <p className="text-sm text-muted-foreground">
          Selecciona una categoría de equipo de impresión para editar la barra de características y
          la lista de especificaciones del hero.
        </p>
      </InventoryFormSection>
    );
  }

  return (
    <InventoryFormSection
      id="inv-storefront-detail"
      title="Ficha de tienda"
      icon={LayoutGrid}
      description="Barra de características y bullets del hero. Se sincronizan con atributos y descripción."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={syncFromAttributes}>
            <RefreshCw className="mr-1.5 size-3.5" aria-hidden="true" />
            Sincronizar todo desde atributos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyBulletsToDescription}
            disabled={heroBullets.length === 0}
          >
            <ArrowDownUp className="mr-1.5 size-3.5" aria-hidden="true" />
            Copiar bullets → descripción
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={importBulletsFromDescription}
            disabled={!form.description?.trim()}
          >
            <ArrowDownUp className="mr-1.5 size-3.5" aria-hidden="true" />
            Importar bullets ← descripción
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="size-4 text-muted-foreground" aria-hidden="true" />
            <h4 className="text-sm font-semibold text-foreground">Barra de características (6 ítems)</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Icono, título y subtítulo visibles bajo la galería en la ficha del producto.
          </p>

          <div className="overflow-x-auto rounded-lg border border-border/70 bg-muted/20">
            <div className="grid min-w-[640px] grid-cols-6 divide-x divide-border/60">
              {featureBar.map((item, index) => {
                const Icon = resolveStorefrontIcon(item.icon);
                const filled = Boolean(item.title.trim() && item.subtitle.trim());
                return (
                  <div
                    key={`feature-${index}`}
                    className={cn(
                      'space-y-2 p-3',
                      filled ? 'bg-background' : 'bg-muted/10',
                    )}
                  >
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="flex size-9 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="text-[0.65rem] font-medium text-muted-foreground">
                        Ítem {index + 1}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-[0.65rem]">Icono</Label>
                        <Select
                          value={item.icon}
                          onValueChange={(value) => updateFeatureBarItem(index, { icon: value })}
                        >
                          <SelectTrigger className="h-8 bg-background text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STOREFRONT_ICON_KEYS.map((key) => (
                              <SelectItem key={key} value={key}>
                                {STOREFRONT_ICON_LABELS[key]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[0.65rem]">Título</Label>
                        <Input
                          className="h-8 bg-background text-xs"
                          value={item.title}
                          onChange={(event) =>
                            updateFeatureBarItem(index, { title: event.target.value })
                          }
                          placeholder="Ej. 32 ppm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[0.65rem]">Subtítulo</Label>
                        <Input
                          className="h-8 bg-background text-xs"
                          value={item.subtitle}
                          onChange={(event) =>
                            updateFeatureBarItem(index, { subtitle: event.target.value })
                          }
                          placeholder="Ej. Velocidad de impresión"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-border/60 pt-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-muted-foreground" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-foreground">
                Especificaciones del hero (lista con iconos)
              </h4>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addHeroBullet}>
              Añadir línea
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Debe coincidir con el campo Descripción (una línea por ítem). Si la descripción está
            vacía, se rellena automáticamente al sincronizar.
          </p>

          {heroBullets.length === 0 ? (
            <p className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
              Sin bullets personalizados. Usa «Sincronizar todo desde atributos» o importa desde la
              descripción.
            </p>
          ) : (
            <ul className="space-y-2">
              {heroBullets.map((bullet, index) => {
                const Icon = resolveStorefrontIcon(bullet.icon);
                return (
                  <li
                    key={`bullet-${index}`}
                    className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background p-3 sm:flex-row sm:items-end"
                  >
                    <div className="flex items-center gap-2 sm:w-36">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 text-red-600">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <Label className="text-[0.65rem]">Icono</Label>
                        <Select
                          value={bullet.icon}
                          onValueChange={(value) => updateHeroBullet(index, { icon: value })}
                        >
                          <SelectTrigger className="h-8 bg-background text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STOREFRONT_ICON_KEYS.map((key) => (
                              <SelectItem key={key} value={key}>
                                {STOREFRONT_ICON_LABELS[key]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <Label className="text-[0.65rem]">Texto</Label>
                      <Input
                        className="h-9 bg-background text-sm"
                        value={bullet.text}
                        onChange={(event) =>
                          updateHeroBullet(index, { text: event.target.value })
                        }
                        placeholder="Ej. Imprime hasta 32 ppm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() => removeHeroBullet(index)}
                    >
                      Quitar
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </InventoryFormSection>
  );
}
