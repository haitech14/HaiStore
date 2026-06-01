# Esquema Supabase — HaiStore

Aplicar migraciones en orden (Supabase → SQL Editor o `supabase db push`):

1. `001_profiles_auth.sql` — usuarios y roles (`profiles`)
2. `002_products.sql` — catálogo (`products`)
3. `003_store_customers_orders.sql` — categorías, clientes y pedidos
4. `004_fix_category_slug_upsert.sql` — slugs de categoría (idempotente)
5. `005_products_catalog_fields.sql` — gallery, sort_order, snapshot inventario

## Sincronizar local → Supabase → Vercel

```bash
# 1. Subir inventario de server/data/inventory.json a Supabase
npm run sync:supabase

# 2. Variables de entorno en Vercel (mismas que .env)
npm run sync:vercel-env

# 3. Desplegar
vercel deploy --prod
```

En Vercel, `HAISTORE_CATALOG_SOURCE=supabase` y las claves `SUPABASE_*` hacen que el panel admin
lea y escriba el catálogo en Supabase (no en disco efímero).

## Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfil de auth (rol, email, nombre) |
| `products` | Catálogo con precios por rol (`prices` jsonb) |
| `store_product_categories` | Categorías normalizadas (`slug`, `name`) |
| `store_customers` | Cliente de tienda; `profile_id` opcional |
| `store_orders` | Pedidos con totales USD/PEN y estados |
| `store_order_items` | Líneas con snapshot del producto |

## Estados de pedido (`store_order_status`)

- `pending_payment` — pendiente de pago
- `confirmed` — confirmado
- `processing` — en preparación
- `shipped` — enviado
- `delivered` — entregado
- `cancelled` — cancelado

## Pago (`store_payment_status`)

`pending` | `paid` | `failed` | `refunded`

## API admin (Express)

- `GET /api/orders/admin/dashboard?from=&to=` — KPIs y series
- `GET /api/orders/admin/recent?limit=10`
- `GET /api/customers/admin/all`

Requiere `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en el servidor admin.
