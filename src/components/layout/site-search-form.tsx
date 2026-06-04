import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { useProducts } from '@/hooks/use-products';
import { buildCategorySelectOptions } from '@/lib/inventory-category-options';
import {
  filterProductsBySearch,
  MIN_PRODUCT_SEARCH_LENGTH,
  PRODUCT_SEARCH_SUGGESTION_LIMIT,
} from '@/lib/product-search';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { cn, formatUsd } from '@/lib/utils';

const ALL_CATEGORIES_VALUE = 'all';

type SiteSearchFormProps = {
  className?: string;
  onNavigate?: () => void;
};

export function SiteSearchForm({ className, onNavigate }: SiteSearchFormProps) {
  const navigate = useNavigate();
  const fieldId = useId();
  const categoryFieldId = `${fieldId}-category`;
  const inputFieldId = `${fieldId}-query`;
  const listboxId = `${fieldId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useProducts();
  const { data: categoryTree = [] } = useStoreCategoriesTree();

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES_VALUE);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const categoryOptions = useMemo(() => {
    const fromTree = buildCategorySelectOptions(categoryTree);
    return [{ value: ALL_CATEGORIES_VALUE, label: 'Categorías' }, ...fromTree];
  }, [categoryTree]);

  const suggestions = useMemo(
    () =>
      filterProductsBySearch(products, query, {
        categoryFilter,
        categoryTree,
        limit: PRODUCT_SEARCH_SUGGESTION_LIMIT,
      }),
    [products, query, categoryFilter, categoryTree],
  );

  const showSuggestions =
    panelOpen && query.trim().length >= MIN_PRODUCT_SEARCH_LENGTH && !isLoading;

  const totalMatches = useMemo(
    () =>
      filterProductsBySearch(products, query, {
        categoryFilter,
        categoryTree,
      }).length,
    [products, query, categoryFilter, categoryTree],
  );

  useEffect(() => {
    if (!showSuggestions) {
      setActiveIndex(-1);
    }
  }, [showSuggestions, suggestions.length]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const goToSearchResults = (searchText: string, category: string) => {
    const trimmed = searchText.trim();
    if (trimmed.length < MIN_PRODUCT_SEARCH_LENGTH) return;

    const params = new URLSearchParams();
    params.set('buscar', trimmed);
    if (category !== ALL_CATEGORIES_VALUE) {
      params.set('cat', category);
    }
    setPanelOpen(false);
    onNavigate?.();
    void navigate(`/tienda?${params.toString()}`);
  };

  const goToProduct = (productId: string) => {
    setPanelOpen(false);
    onNavigate?.();
    void navigate(`/tienda/producto/${productId}`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    goToSearchResults(query, categoryFilter);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
      return;
    }

    if (event.key === 'Escape') {
      setPanelOpen(false);
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      goToProduct(suggestions[activeIndex].id);
    }
  };

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <form
        role="search"
        className="flex w-full items-stretch overflow-hidden rounded-xl border border-input bg-background shadow-sm"
        onSubmit={handleSubmit}
      >
        <label htmlFor={categoryFieldId} className="sr-only">
          Categoría
        </label>
        <select
          id={categoryFieldId}
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="h-11 max-w-[6.75rem] shrink-0 border-0 border-r border-input bg-muted/40 px-2.5 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:max-w-[8.5rem] sm:text-sm"
          aria-label="Filtrar por categoría"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor={inputFieldId} className="sr-only">
          Buscar productos
        </label>
        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            id={inputFieldId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPanelOpen(true);
            }}
            onFocus={() => setPanelOpen(true)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={showSuggestions ? listboxId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 && suggestions[activeIndex]
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            placeholder="Buscar productos, marcas y más..."
            autoComplete="off"
            className="h-11 w-full border-0 border-r border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-4"
          />
        </div>

        <button
          type="submit"
          aria-label="Buscar"
          className="flex h-11 w-12 shrink-0 items-center justify-center border-0 bg-red-600 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset"
        >
          <Search className="size-5" aria-hidden="true" />
        </button>
      </form>

      {showSuggestions ? (
        <div
          className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
          role="presentation"
        >
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground" role="status">
              No hay productos que coincidan con «{query.trim()}».
            </p>
          ) : (
            <>
              <ul id={listboxId} role="listbox" aria-label="Sugerencias de productos">
                {suggestions.map((product, index) => {
                  const imageUrl = resolveProductImageUrl(product);
                  const isActive = index === activeIndex;

                  return (
                    <li key={product.id} role="presentation">
                      <button
                        id={`${listboxId}-option-${index}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                          isActive ? 'bg-accent' : 'hover:bg-muted/60',
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => goToProduct(product.id)}
                      >
                        <img
                          src={imageUrl}
                          alt=""
                          className="size-11 shrink-0 rounded-md border border-border/60 bg-muted object-contain p-0.5"
                          loading="lazy"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 font-medium text-foreground">
                            {product.name}
                          </span>
                          {product.category ? (
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {product.category}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                          {formatUsd(product.price)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {totalMatches > suggestions.length ? (
                <div className="border-t border-border/80 px-3 py-2">
                  <button
                    type="button"
                    className="w-full rounded-md py-2 text-center text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    onClick={() => goToSearchResults(query, categoryFilter)}
                  >
                    Ver todos los resultados ({totalMatches})
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
