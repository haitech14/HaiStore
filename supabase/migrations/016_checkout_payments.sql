-- Checkout: campos de pago en pedidos y auditoría de webhooks

alter table public.store_orders
  add column if not exists payment_provider text,
  add column if not exists external_payment_id text,
  add column if not exists payment_intent_token text,
  add column if not exists payment_metadata jsonb;

create index if not exists store_orders_external_payment_id_idx
  on public.store_orders (external_payment_id)
  where external_payment_id is not null;

create index if not exists store_orders_payment_provider_idx
  on public.store_orders (payment_provider)
  where payment_provider is not null;

create table if not exists public.store_payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.store_orders (id) on delete cascade,
  provider text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists store_payment_events_order_id_idx
  on public.store_payment_events (order_id, created_at desc);

alter table public.store_payment_events enable row level security;

create policy "Admins leen eventos de pago"
  on public.store_payment_events for select
  using (public.is_admin());

create policy "Admins insertan eventos de pago"
  on public.store_payment_events for insert
  with check (public.is_admin());
