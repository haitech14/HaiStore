import { LayoutGrid, List, Search, SlidersHorizontal, Table2 } from 'lucide-react';

import { CategoryToolbarFiltersPopover } from '@/components/category/category-toolbar-filters-popover';
import type { QuickFilterChip } from '@/components/category/category-quick-filters';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MIN_PRODUCT_SEARCH_LENGTH } from '@/lib/product-search';
import { cn } from '@/lib/utils';

export type CategorySortValue = 'price-asc' | 'price-desc' | 'name-asc';
export type CatalogViewMode = 'grid' | 'list' | 'table';

interface CategoryCatalogToolbarProps {
  productCount: number;
  pageTitle: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortBy: CategorySortValue;
  onSortChange: (value: CategorySortValue) => void;
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
  filtersOpen: boolean;
  filtersSheetOpen: boolean;
  hasSidebarFilters: boolean;
  onToggleSidebarFilters: () => void;
  tipoFilters: QuickFilterChip[];
  productionFilters: QuickFilterChip[];
  showProductionFilters: boolean;
  selectedAttributes: string[];
  selectedProduction: string | null;
  onSelectAllQuickFilters: () => void;
  onToggleAttribute: (key: string) => void;
  onToggleProduction: (key: string) => void;
}

const viewToggleClass = (active: boolean) =>
  cn(
    'inline-flex size-9 items-center justify-center rounded-md transition-colors sm:size-10',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    active
      ? 'bg-red-600 text-white shadow-sm'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  );

export function CategoryCatalogToolbar({
  productCount,
  pageTitle,
  searchQuery,
  onSearchQueryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filtersOpen,
  filtersSheetOpen,
  hasSidebarFilters,
  onToggleSidebarFilters,
  tipoFilters,
  productionFilters,
  showProductionFilters,
  selectedAttributes,
  selectedProduction,
  onSelectAllQuickFilters,
  onToggleAttribute,
  onToggleProduction,
}: CategoryCatalogToolbarProps) {
  const searchHint =
    searchQuery.trim().length > 0 && searchQuery.trim().length < MIN_PRODUCT_SEARCH_LENGTH
      ? `Escribe al menos ${MIN_PRODUCT_SEARCH_LENGTH} caracteres`
      : null;

  const resultsLabel =
    productCount === 1 ? '1 producto encontrado' : `${productCount} productos encontrados`;

  const contextLabel =
    searchQuery.trim().length >= MIN_PRODUCT_SEARCH_LENGTH
      ? `${pageTitle} · «${searchQuery.trim()}»`
      : pageTitle;

  return (
    <div className="mb-4 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
        <button
          type="button"
          onClick={onToggleSidebarFilters}
          aria-expanded={filtersSheetOpen || filtersOpen}
          aria-controls="category-filters-panel"
          aria-label={
            filtersOpen ? 'Ocultar filtros del catálogo' : 'Mostrar filtros del catálogo'
          }
          className={cn(
            'relative inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors sm:size-11',
            'hover:bg-muted hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
            (filtersSheetOpen || filtersOpen || hasSidebarFilters) &&
              'border-red-200 bg-red-50/50',
          )}
        >
          <SlidersHorizontal className="size-5" aria-hidden="true" />
          {hasSidebarFilters ? (
            <span
              className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-600"
              aria-hidden="true"
            />
          ) : null}
        </button>

        <div
          className="min-w-0 shrink-0 leading-tight sm:max-w-[11rem] md:max-w-[13rem]"
          aria-live="polite"
        >
          <p className="truncate text-sm font-semibold text-foreground">{resultsLabel}</p>
          <p className="truncate text-xs text-muted-foreground">
            <span className="sr-only">Mostrando resultados en </span>
            {contextLabel}
          </p>
          {searchHint ? (
            <p id="category-search-hint" className="truncate text-xs text-muted-foreground">
              {searchHint}
            </p>
          ) : null}
        </div>

        <div className="relative min-w-0 w-full flex-1 basis-[10rem] lg:min-w-[12rem]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Buscar en esta categoría…"
            aria-label={`Buscar productos en ${pageTitle}`}
            aria-describedby={searchHint ? 'category-search-hint' : undefined}
            className="h-10 border-border bg-background pl-9 pr-3 text-sm"
            autoComplete="off"
          />
        </div>

        <CategoryToolbarFiltersPopover
          tipoFilters={tipoFilters}
          productionFilters={productionFilters}
          showProduction={showProductionFilters}
          selectedAttributes={selectedAttributes}
          selectedProduction={selectedProduction}
          onSelectAll={onSelectAllQuickFilters}
          onToggleAttribute={onToggleAttribute}
          onToggleProduction={onToggleProduction}
        />

        <label className="flex min-w-0 shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
          <span className="sr-only">Ordenar por:</span>
          <span className="hidden shrink-0 md:inline" aria-hidden="true">
            Ordenar por:
          </span>
          <Select
            value={sortBy}
            onValueChange={(value) => onSortChange(value as CategorySortValue)}
          >
            <SelectTrigger className="h-10 w-full min-w-[10.5rem] bg-background sm:min-w-[11rem] sm:w-[12.5rem]">
              <SelectValue placeholder="Selecciona orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-desc">Precio: mayor a mayor</SelectItem>
              <SelectItem value="name-asc">Nombre A-Z</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <div
          className="flex shrink-0 items-center gap-0.5 rounded-md border border-border bg-background p-1"
          role="group"
          aria-label="Modo de vista del catálogo"
        >
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Vista de grilla"
            className={viewToggleClass(viewMode === 'grid')}
          >
            <LayoutGrid className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="Vista de lista"
            className={viewToggleClass(viewMode === 'list')}
          >
            <List className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            aria-pressed={viewMode === 'table'}
            aria-label="Vista de tabla"
            className={viewToggleClass(viewMode === 'table')}
          >
            <Table2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
