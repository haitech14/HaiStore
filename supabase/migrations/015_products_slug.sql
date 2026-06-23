-- Slug legible para URLs de producto (SEO)
alter table public.products
  add column if not exists slug text;

create unique index if not exists products_slug_unique_idx
  on public.products (slug)
  where slug is not null;

comment on column public.products.slug is 'Slug público para /tienda/producto/:slug';
