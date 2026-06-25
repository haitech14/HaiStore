import { apiFetch } from '@/lib/api';
import { buildStaticStoreCategoryTree } from '@/lib/static-store-category-tree';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export const STORE_CATEGORIES_QUERY_KEY = 'store-categories';
export const STORE_CATEGORIES_STATIC_URL = '/catalog/store-categories-tree.json';
const STORE_CATEGORIES_STORAGE_KEY = 'haistore_categories_tree_v1';

function readStoredStoreCategoriesTree(): StoreCategoryTreeNode[] | undefined {
  try {
    const raw = sessionStorage.getItem(STORE_CATEGORIES_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoreCategoryTreeNode[];
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function storeCategoriesTree(tree: StoreCategoryTreeNode[]): void {
  try {
    sessionStorage.setItem(STORE_CATEGORIES_STORAGE_KEY, JSON.stringify(tree));
  } catch {
    /* quota / privado */
  }
}

async function fetchStaticStoreCategoriesTree(): Promise<StoreCategoryTreeNode[] | null> {
  try {
    const response = await fetch(STORE_CATEGORIES_STATIC_URL, {
      cache: 'default',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as StoreCategoryTreeNode[];
    return Array.isArray(payload) ? payload : null;
  } catch {
    return null;
  }
}

/**
 * API con respaldo en JSON estático, sessionStorage y árbol embebido.
 */
export async function fetchStoreCategoriesTreeWithFallback(): Promise<StoreCategoryTreeNode[]> {
  const staticTree = buildStaticStoreCategoryTree();

  try {
    const tree = await apiFetch<StoreCategoryTreeNode[]>('/api/categories');
    storeCategoriesTree(tree);
    return tree;
  } catch {
    const snapshot = await fetchStaticStoreCategoriesTree();
    if (snapshot?.length) {
      storeCategoriesTree(snapshot);
      return snapshot;
    }

    const cached = readStoredStoreCategoriesTree();
    if (cached?.length) return cached;

    return staticTree;
  }
}
