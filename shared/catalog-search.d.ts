import type { Product } from '../src/types/product';

export function normalizeCatalogSearchText(value: string): string;
export function compactSearchText(value: string): string;
export function productSearchHaystack(product: Product): string;
export function scoreProductSearchRelevance(product: Product, query: string): number;
export function compareProductSearchRelevance(a: Product, b: Product, query: string): number;
export function sortProductsBySearchRelevance(products: Product[], query: string): Product[];
export function productMatchesSearchQuery(product: Product, query: string): boolean;
