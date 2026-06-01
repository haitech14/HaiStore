-- Destacados en vitrina y contador de visitas al detalle
alter table public.products
  add column if not exists is_featured boolean not null default false,
  add column if not exists view_count integer not null default 0 check (view_count >= 0);

create index if not exists products_is_featured_idx on public.products (is_featured)
  where is_featured = true;

create index if not exists products_view_count_idx on public.products (view_count desc);

comment on column public.products.is_featured is
  'Si true, aparece en el carrusel «Productos destacados» del inicio.';

comment on column public.products.view_count is
  'Visitas acumuladas a la ficha del producto (fallback del carrusel destacado).';
