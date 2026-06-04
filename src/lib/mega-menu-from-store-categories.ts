import type { LucideIcon } from 'lucide-react';
import {
  Copy,
  Cog,
  Droplets,
  Headphones,
  KeyRound,
  Laptop,
  Monitor,
  Package,
  PackageOpen,
  Printer,
  Ruler,
  ScanLine,
  Wrench,
} from 'lucide-react';

import { categoryPath } from '@/lib/category-path';
import type { MegaMenuSectionId } from '@/data/mega-menu';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export interface MegaMenuNavItem {
  slug: string;
  name: string;
  icon: LucideIcon;
  href: string;
  productCount: number;
}

export interface MegaMenuNavColumn {
  id: MegaMenuSectionId;
  title: string;
  items: MegaMenuNavItem[];
}

const SECTION_ROOT_IDS: Record<Exclude<MegaMenuSectionId, 'destacados'>, string[]> = {
  impresion: [
    'cat-multifuncionales',
    'cat-impresoras',
    '54e448b6-6573-4c4b-9d35-a9f7eaf1c829',
    'cat-escaneres',
  ],
  suministros: ['cat-toner', 'cat-repuestos', 'cat-servicio-tecnico'],
  tecnologia: ['cat-tecnologia'],
};

const SECTION_TITLES: Record<Exclude<MegaMenuSectionId, 'destacados'>, string> = {
  impresion: 'Impresión',
  suministros: 'Suministros',
  tecnologia: 'Tecnología',
};

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  multifuncionales: Copy,
  'multifuncionales-nuevas': Copy,
  'multifuncionales-seminuevas': Copy,
  'multifuncionales-remanufacturadas': Copy,
  impresoras: Printer,
  'impresoras-laser-nuevas': Printer,
  'impresoras-laser-seminuevas': Printer,
  'impresoras-laser-remanufacturadas': Printer,
  'formato-ancho': Ruler,
  escaneres: ScanLine,
  'toner-suministros': PackageOpen,
  toner: Droplets,
  'toner-originales': Droplets,
  suministros: Package,
  'accesorios-toner': Package,
  accesorios: Headphones,
  repuestos: Cog,
  alquiler: KeyRound,
  'alquiler-laptops': Laptop,
  'alquiler-computadoras': Monitor,
  'alquiler-proyectores': Monitor,
  'alquiler-impresoras': Printer,
  'alquiler-plotters': Ruler,
  'alquiler-escaneres': ScanLine,
  'servicio-tecnico': Wrench,
  tecnologia: Laptop,
  'computadoras-laptop': Laptop,
  laptops: Laptop,
  monitores: Monitor,
  'soluciones-colaboracion': Monitor,
  'soluciones-negocio': Monitor,
  audio: Headphones,
  smartphones: Laptop,
  smartwatches: Laptop,
};

const DEFAULT_ICON = Package;

function findNodeById(
  nodes: StoreCategoryTreeNode[],
  id: string,
): StoreCategoryTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const nested = findNodeById(node.children ?? [], id);
    if (nested) return nested;
  }
  return undefined;
}

function iconForSlug(slug: string): LucideIcon {
  return ICON_BY_SLUG[slug] ?? DEFAULT_ICON;
}

function hasProducts(node: StoreCategoryTreeNode): boolean {
  return (node.productCount ?? 0) > 0;
}

function collectMenuItemsForRoot(root: StoreCategoryTreeNode): MegaMenuNavItem[] {
  const items: MegaMenuNavItem[] = [];
  const children = (root.children ?? []).filter(hasProducts);

  const pushItem = (node: StoreCategoryTreeNode, parentSlug: string, subSlug?: string) => {
    items.push({
      slug: node.slug,
      name: node.name,
      icon: iconForSlug(node.slug),
      href: categoryPath(parentSlug, subSlug ?? null),
      productCount: node.productCount ?? 0,
    });
  };

  if (children.length === 0) {
    if (hasProducts(root)) {
      pushItem(root, root.slug);
    }
    return items;
  }

  for (const child of children) {
    const grandChildren = (child.children ?? []).filter(hasProducts);
    if (grandChildren.length > 0) {
      for (const grand of grandChildren) {
        pushItem(grand, root.slug, grand.slug);
      }
    } else if (hasProducts(child)) {
      pushItem(child, root.slug, child.slug);
    }
  }

  if (items.length === 0 && hasProducts(root)) {
    pushItem(root, root.slug);
  }

  return items;
}

export function buildMegaMenuFromStoreCategories(
  tree: StoreCategoryTreeNode[],
): { columns: MegaMenuNavColumn[]; sidebarSectionIds: MegaMenuSectionId[] } {
  const columns: MegaMenuNavColumn[] = [];

  for (const sectionId of ['impresion', 'suministros', 'tecnologia'] as const) {
    const items: MegaMenuNavItem[] = [];

    for (const rootId of SECTION_ROOT_IDS[sectionId]) {
      const root = findNodeById(tree, rootId);
      if (!root) continue;
      items.push(...collectMenuItemsForRoot(root));
    }

    if (items.length > 0) {
      columns.push({
        id: sectionId,
        title: SECTION_TITLES[sectionId],
        items,
      });
    }
  }

  const sidebarSectionIds: MegaMenuSectionId[] = [
    ...columns.map((column) => column.id),
    'destacados',
  ];

  return { columns, sidebarSectionIds };
}
