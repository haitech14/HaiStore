-- Entidades compartidas HaiStore ↔ HaiSupport: servicios, alquileres, clientes ampliados

-- ---------------------------------------------------------------------------
-- Ampliar store_customers (campos espejo HaiSupport clients)
-- ---------------------------------------------------------------------------
alter table public.store_customers
  add column if not exists nombre_contacto text,
  add column if not exists direccion text,
  add column if not exists ciudad text,
  add column if not exists tipo_cliente text default 'public',
  add column if not exists source text not null default 'haistore'
    check (source in ('haistore', 'haisupport')),
  add column if not exists haisupport_client_id uuid;

create index if not exists store_customers_haisupport_client_id_idx
  on public.store_customers (haisupport_client_id)
  where haisupport_client_id is not null;

create index if not exists store_customers_source_idx
  on public.store_customers (source);

-- ---------------------------------------------------------------------------
-- Categorías de servicio
-- ---------------------------------------------------------------------------
create table if not exists public.store_service_categories (
  id text primary key,
  name text not null,
  description text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_service_categories enable row level security;

create policy "Categorías servicio visibles"
  on public.store_service_categories for select
  using (active = true or public.is_admin());

create policy "Admins gestionan categorías servicio"
  on public.store_service_categories for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.store_service_categories (id, name, description, active, sort_order)
values
  ('cat-mantenimiento', 'Mantenimiento preventivo', 'Revisiones programadas, limpieza y ajustes de equipos.', true, 1),
  ('cat-correctivo', 'Servicio correctivo', 'Reparación de fallas, atascos y errores en campo.', true, 2),
  ('cat-instalacion', 'Instalación', 'Puesta en marcha, red y capacitación básica.', true, 3),
  ('cat-remoto', 'Soporte remoto', 'Diagnóstico y configuración vía asistencia remota.', true, 4)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Solicitudes de servicio
-- ---------------------------------------------------------------------------
create table if not exists public.store_service_requests (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  client_id uuid references public.store_customers (id) on delete set null,
  haisupport_request_id uuid,
  customer_snapshot jsonb not null,
  category_id text not null references public.store_service_categories (id),
  category_label text not null,
  description text not null,
  status text not null default 'pending'
    check (status in ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_at timestamptz not null,
  technician text,
  address text,
  city text,
  source text not null default 'haistore'
    check (source in ('haistore', 'haisupport')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_service_requests_status_idx
  on public.store_service_requests (status, scheduled_at desc);

create index if not exists store_service_requests_client_idx
  on public.store_service_requests (client_id);

alter table public.store_service_requests enable row level security;

create policy "Admins gestionan solicitudes servicio"
  on public.store_service_requests for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Solicitudes de alquiler (contratos / leads)
-- ---------------------------------------------------------------------------
create table if not exists public.store_rental_requests (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  client_id uuid references public.store_customers (id) on delete set null,
  plan_id text not null references public.store_rental_plans (id),
  plan_label text not null,
  product_id text,
  product_name text,
  haisupport_rental_id uuid,
  customer_snapshot jsonb not null,
  pages_per_month integer not null check (pages_per_month > 0),
  monthly_price_pen numeric(12, 2) not null check (monthly_price_pen >= 0),
  start_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'quoted', 'active', 'ended', 'cancelled')),
  notes text,
  source text not null default 'haistore'
    check (source in ('haistore', 'haisupport')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_rental_requests_status_idx
  on public.store_rental_requests (status, created_at desc);

alter table public.store_rental_requests enable row level security;

create policy "Admins gestionan solicitudes alquiler"
  on public.store_rental_requests for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.store_service_categories;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.store_service_requests;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.store_rental_requests;
exception when duplicate_object then null;
end $$;

comment on table public.store_service_requests is
  'Solicitudes de servicio técnico. Fuente compartida HaiStore–HaiSupport.';

comment on table public.store_rental_requests is
  'Solicitudes/contratos de alquiler. Fuente compartida HaiStore–HaiSupport.';
