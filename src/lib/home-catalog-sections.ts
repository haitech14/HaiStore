import { categories } from '@/data/categories';
import type { CatalogFamilySlug } from '@/lib/product-condition';
import { findCategoryBySlug, getCategoryProductLabels } from '@/lib/category-product-labels';

export interface HomeCatalogSectionConfig {
  id: CatalogFamilySlug;
  title: string;
  subtitle: string;
  /** Slug de ruta `/categoria/:slug` para «Ver todo». */
  categoryPathSlug: string;
  /** Slugs de `categories` cuyas etiquetas de inventario alimentan la sección. */
  inventoryCategorySlugs: string[];
}

export const HOME_CATALOG_SECTIONS: HomeCatalogSectionConfig[] = [
  {
    id: 'multifuncionales',
    title: 'Multifuncionales',
    subtitle: 'Imprime, escanea y copia en un solo equipo',
    categoryPathSlug: 'multifuncionales',
    inventoryCategorySlugs: ['multifuncionales'],
  },
  {
    id: 'impresoras',
    title: 'Impresoras',
    subtitle: 'Láser, inkjet y soluciones de impresión',
    categoryPathSlug: 'impresoras',
    inventoryCategorySlugs: ['impresoras'],
  },
  {
    id: 'toner-suministros',
    title: 'Toner y Suministros',
    subtitle: 'Consumibles originales y compatibles para tu equipo',
    categoryPathSlug: 'toner-suministros',
    inventoryCategorySlugs: ['toner-suministros'],
  },
  {
    id: 'repuestos',
    title: 'Repuestos',
    subtitle: 'Partes y componentes para impresoras',
    categoryPathSlug: 'repuestos',
    inventoryCategorySlugs: ['repuestos'],
  },
];

export function resolveHomeSectionInventoryLabels(section: HomeCatalogSectionConfig): string[] {
  const labels = new Set<string>();

  for (const slug of section.inventoryCategorySlugs) {
    const category = findCategoryBySlug(slug) ?? categories.find((entry) => entry.slug === slug);
    if (!category) continue;
    for (const label of getCategoryProductLabels(category)) {
      labels.add(label);
    }
  }

  return [...labels];
}
