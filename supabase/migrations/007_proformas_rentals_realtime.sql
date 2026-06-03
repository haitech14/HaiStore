-- Proformas, planes de alquiler y realtime (HaiStore ↔ HaiSupport vía Supabase compartido)

-- ---------------------------------------------------------------------------
-- Proformas (antes JSON efímero en server/data)
-- ---------------------------------------------------------------------------
create table if not exists public.store_proformas (
  id uuid primary key default gen_random_uuid(),
  document_number text not null,
  follow_up_status text not null default 'pending'
    check (follow_up_status in ('pending', 'contacted', 'negotiating', 'won', 'lost')),
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists store_proformas_document_number_idx
  on public.store_proformas (document_number);

create index if not exists store_proformas_follow_up_idx
  on public.store_proformas (follow_up_status, created_at desc);

create index if not exists store_proformas_updated_at_idx
  on public.store_proformas (updated_at desc);

alter table public.store_proformas enable row level security;

create policy "Admins gestionan proformas"
  on public.store_proformas for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Planes de alquiler (antes localStorage)
-- ---------------------------------------------------------------------------
create table if not exists public.store_rental_plans (
  id text primary key,
  label text not null,
  pages_per_month integer not null check (pages_per_month > 0),
  monthly_price_pen numeric(12, 2) not null check (monthly_price_pen >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_rental_plans_active_sort_idx
  on public.store_rental_plans (active, sort_order);

alter table public.store_rental_plans enable row level security;

create policy "Planes de alquiler visibles"
  on public.store_rental_plans for select
  using (active = true or public.is_admin());

create policy "Admins gestionan planes de alquiler"
  on public.store_rental_plans for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.store_rental_plans (id, label, pages_per_month, monthly_price_pen, active, sort_order)
values
  ('plan-3k', 'Plan 3,000 páginas', 3000, 349, true, 1),
  ('plan-5k', 'Plan 5,000 páginas', 5000, 399, true, 2),
  ('plan-8k', 'Plan 8,000 páginas', 8000, 449, true, 3),
  ('plan-10k', 'Plan 10,000 páginas', 10000, 499, true, 4)
on conflict (id) do update set
  label = excluded.label,
  pages_per_month = excluded.pages_per_month,
  monthly_price_pen = excluded.monthly_price_pen,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Realtime (HaiStore admin + HaiSupport en la misma BD)
-- ---------------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.store_customers;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.store_proformas;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.store_rental_plans;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.store_orders;
exception when duplicate_object then null;
end $$;

comment on table public.store_proformas is
  'Proformas TPV/web. Fuente compartida HaiStore–HaiSupport.';

comment on table public.store_rental_plans is
  'Planes mensuales de alquiler mostrados en ficha de producto.';
