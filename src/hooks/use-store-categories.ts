import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import {
  fetchStoreCategoriesTreeWithFallback,
  STORE_CATEGORIES_QUERY_KEY,
} from '@/lib/store-categories-fetch';
import { buildStaticStoreCategoryTree } from '@/lib/static-store-category-tree';
import type {
  StoreCategory,
  StoreCategoryReorderItem,
  StoreCategoryTreeNode,
} from '@/types/store-category';

/** Referencia estable para evitar bucles de render cuando la query aún no tiene datos. */
export const EMPTY_STORE_CATEGORY_TREE: StoreCategoryTreeNode[] = [];

export function useStoreCategoriesTree() {
  return useQuery({
    queryKey: [STORE_CATEGORIES_QUERY_KEY],
    queryFn: fetchStoreCategoriesTreeWithFallback,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
    placeholderData: (previous) => previous ?? buildStaticStoreCategoryTree(),
  });
}

export function useStoreCategoriesMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [STORE_CATEGORIES_QUERY_KEY] });
  };

  const syncFromInventory = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; tree: StoreCategoryTreeNode[] }>('/api/categories/sync-inventory', {
        method: 'POST',
      }),
    onSuccess: invalidate,
  });

  const createCategory = useMutation({
    mutationFn: (payload: Partial<StoreCategory>) =>
      apiFetch<StoreCategory>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<StoreCategory> }) =>
      apiFetch<StoreCategory>(`/api/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>(`/api/categories/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const reorderCategories = useMutation({
    mutationFn: (items: StoreCategoryReorderItem[]) =>
      apiFetch<{ ok: boolean; tree: StoreCategoryTreeNode[] }>('/api/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      }),
    onSuccess: invalidate,
  });

  return {
    syncFromInventory,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
