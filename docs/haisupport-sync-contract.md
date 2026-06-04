# Contrato de sincronización HaiStore ↔ HaiSupport

Este documento describe el contrato HTTP y de datos compartidos entre **HaiStore** y **HaiSupport**.

## Canales

| Canal | Dirección | Endpoint |
|-------|-----------|----------|
| Outbound sync | HaiStore → HaiSupport | `POST {HAISUPPORT_API_URL}/sync/{entity}` |
| Inbound webhook | HaiSupport → HaiStore | `POST {HAISTORE_URL}/api/integrations/haisupport/webhook` |
| Supabase bridge | Bidireccional (proyectos separados) | Escritura directa vía service role |
| Supabase compartido | Bidireccional (mismo proyecto) | Realtime + tablas `store_*` |

### Headers

**Outbound (HaiStore → HaiSupport):**
```
Authorization: Bearer {HAISUPPORT_API_KEY}
Content-Type: application/json
```

**Inbound (HaiSupport → HaiStore):**
```
X-HaiSupport-Secret: {HAISUPPORT_WEBHOOK_SECRET}
Content-Type: application/json
```

### Payload outbound

```json
{
  "action": "create|update|delete|upsert",
  "payload": {},
  "source": "haistore",
  "sentAt": "2026-06-02T12:00:00.000Z"
}
```

### Payload inbound (webhook)

```json
{
  "entity": "products|customers|proformas|rental_plans|service_requests|rental_requests|orders",
  "action": "create|update|delete|upsert",
  "payload": {}
}
```

## Entidades

| entity | Tabla HaiStore | Tabla HaiSupport (bridge) |
|--------|----------------|---------------------------|
| `products` | `products` | inventario / productos |
| `customers` | `store_customers` | `clients` |
| `proformas` | `store_proformas` | — |
| `rental_plans` | `store_rental_plans` | — |
| `service_requests` | `store_service_requests` | `service_requests` |
| `rental_requests` | `store_rental_requests` | `rental_requests` |
| `orders` | `store_orders` + `store_order_items` | — |

## Cliente canónico (formulario compartido)

Campos alineados a HaiSupport `clients`:

| UI | Campo JSON | HaiSupport |
|----|------------|------------|
| Razón social | `nombre` | `nombre` |
| Contacto | `nombreContacto` | `nombre_contacto` |
| RUC/DNI | `rucDni` | `ruc_dni` |
| Teléfono | `telefono` | `telefono` |
| Dirección | `direccion` | `direccion` |
| Ciudad | `ciudad` | `ciudad` |
| Tipo cliente | `tipoCliente` | `tipo_cliente` |

Componente UI: `src/components/admin/shared/haitech-client-form.tsx`

## Autenticación

Usar el **mismo** proyecto Supabase que HaiStore (`SUPABASE_URL`). Cuentas: [`docs/haitech-auth-unified.md`](./haitech-auth-unified.md).

## Variables de entorno

```env
HAISUPPORT_API_URL=https://xxx.supabase.co
HAISUPPORT_API_KEY=service_role_key
HAISUPPORT_SYNC_ENABLED=true
HAISUPPORT_WEBHOOK_SECRET=secreto-largo-compartido
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
HAISTORE_CATALOG_SOURCE=supabase
```

## Migraciones requeridas (HaiStore)

- `007_proformas_rentals_realtime.sql`
- `008_haisupport_sync_entities.sql`

## Implementación pendiente en HaiSupport

1. Receptor `POST /sync/{entity}` para todas las entidades listadas.
2. Emisor de webhook en cada cambio local con el secreto compartido.
3. Tablas `service_requests` y `rental_requests` con esquema compatible (o mapeo en el receptor).

## Estado de integración

Consultar: `GET /api/integrations/haisupport/status` (requiere admin).
