-- Espejo HaiSales (ERP) en la misma base que HaiStore.
-- El ERP o los scripts de importación escriben aquí; HaiStore sincroniza hacia store_customers e imported_sale_documents.
-- Si falta auth/perfiles, aplica también supabase/migrations/001_profiles_auth.sql (completo).

-- Bootstrap mínimo de perfiles (migración 001) para is_admin() y RLS.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'public' check (
    role in (
      'public',
      'corporativo',
      'tecnico',
      'mayorista',
      'distribuidor',
      'vip',
      'admin'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create table if not exists public.haisales_persona (
  numero_documento text primary key,
  tipo_documento text not null default '',
  nombre_razon_social text not null default '',
  direccion text not null default '',
  referencia text not null default '',
  correo_principal text not null default '',
  correo_secundario text not null default '',
  telefono_principal text not null default '',
  ubigeo text not null default '',
  pais_emisor text not null default '',
  estado text not null default '',
  tipo_sunat text not null default '',
  tipo_persona text not null default '',
  tipo_precio text not null default '',
  categoria text not null default '',
  canal_ruta text not null default '',
  frecuencia_visita text not null default '',
  dia_visita text not null default '',
  linea_credito text not null default '',
  fecha_nacimiento text not null default '',
  contacto text not null default '',
  vendedor text not null default '',
  observaciones text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists haisales_persona_nombre_idx on public.haisales_persona (nombre_razon_social);

create table if not exists public.haisales_ventas (
  external_key text primary key,
  invoice_date timestamptz not null,
  report_period_month date not null,
  payload jsonb not null default '{}'::jsonb,
  source_filename text,
  updated_at timestamptz not null default now()
);

create index if not exists haisales_ventas_invoice_date_idx
  on public.haisales_ventas (invoice_date desc);

create index if not exists haisales_ventas_period_month_idx
  on public.haisales_ventas (report_period_month desc);

comment on table public.haisales_persona is 'Clientes ERP HaiSales (reporte Persona)';
comment on table public.haisales_ventas is 'Comprobantes ERP HaiSales (reporte Ventas, payload con columnas del Excel)';

alter table public.haisales_persona enable row level security;
alter table public.haisales_ventas enable row level security;

drop policy if exists "Admins gestionan haisales_persona" on public.haisales_persona;
create policy "Admins gestionan haisales_persona"
  on public.haisales_persona for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins gestionan haisales_ventas" on public.haisales_ventas;
create policy "Admins gestionan haisales_ventas"
  on public.haisales_ventas for all
  using (public.is_admin())
  with check (public.is_admin());
