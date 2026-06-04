# Autenticación unificada Haitech

HaiStore, **HaiSupport** y **HaiSales** comparten las mismas cuentas y el mismo proyecto **Supabase Auth**.

## Fuente de verdad

Archivo: [`shared/haitech-auth-credentials.json`](../shared/haitech-auth-credentials.json)

| Correo | Contraseña | Rol | Apps |
|--------|------------|-----|------|
| admin@haitech.pe | admin123 | admin | HaiStore, HaiSupport, HaiSales |
| soporte@haitech.pe | soporte123 | admin | HaiStore, HaiSupport, HaiSales |
| ventas@haitech.pe | demo123 | admin | HaiStore, HaiSales |
| mayorista@haitech.pe | demo123 | mayorista | HaiStore |
| distribuidor@haitech.pe | demo123 | distribuidor | HaiStore |
| corporativo@haitech.pe | demo123 | corporativo | HaiStore |
| tecnico@haitech.pe | demo123 | tecnico | HaiStore, HaiSupport |
| vip@haitech.pe | demo123 | vip | HaiStore |
| publico@haitech.pe | demo123 | public | HaiStore |

## Variables de entorno (mismo proyecto)

```env
# Cliente (HaiStore y frontends que usen el mismo login)
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Servidor HaiStore
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# HaiSupport — mismo origen que SUPABASE_URL
HAISUPPORT_API_URL=https://TU_PROYECTO.supabase.co
HAISUPPORT_API_KEY=<mismo SERVICE_ROLE_KEY>

# HaiSales — por defecto reutiliza SUPABASE_* (no hace falta duplicar)
# HAISALES_API_URL=https://TU_PROYECTO.supabase.co
# HAISALES_API_KEY=<mismo SERVICE_ROLE_KEY>
```

En HaiSupport (repo aparte), configura el cliente Supabase con **las mismas** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

## Sembrar usuarios en Supabase

Tras aplicar `001_profiles_auth.sql`:

```bash
npm run auth:seed
```

Crea o actualiza usuarios en **Auth** y filas en **`profiles`** con la contraseña del JSON.

## Modo demo local (sin Supabase)

Si no hay `VITE_SUPABASE_*`, el login usa las mismas cuentas vía `POST /api/auth/login-demo`.

## API de referencia

`GET /api/auth/haitech-accounts` — listado de correos/roles (sin contraseñas) y avisos si las URLs de Supabase no coinciden.

## Copiar credenciales a otros repos

Copia `shared/haitech-auth-credentials.json` a HaiSupport/HaiSales o importa el mismo archivo por ruta relativa en sus scripts de seed.
