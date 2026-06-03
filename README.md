# HaiStore

Tienda online construida con un stack moderno de React, enfocada en rendimiento,
accesibilidad (WCAG 2.1 AA) y diseño mobile-first.

## Stack

**Frontend**

- [Vite](https://vite.dev/) — bundler y dev server
- React 18 + TypeScript (modo strict)
- [React Router](https://reactrouter.com/) — enrutado
- [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) (Radix) — UI
- [TanStack React Query](https://tanstack.com/query) — datos del servidor / caché
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — formularios y validación
- [Recharts](https://recharts.org/), [Embla Carousel](https://www.embla-carousel.com/), [Lucide](https://lucide.dev/) / MDI — gráficos, carruseles, iconos

**Backend / datos**

- [Supabase](https://supabase.com/) — base de datos, auth y API (`@supabase/supabase-js`)
- Node + Express en `server/` — API admin local (puerto 3080, integración HaiSupport)

**Herramientas**

- ESLint + TypeScript strict
- PostCSS / Autoprefixer
- Sharp — optimización de imágenes en build (`vite-plugin-image-optimizer`)

## Requisitos

- Node.js >= 18

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env   # en Windows: copy .env.example .env
# Edita .env con tus credenciales de Supabase

# 3. Arrancar frontend + API admin a la vez
npm run dev:all
```

- Frontend: http://localhost:5173
- API admin: http://localhost:3080 (proxied en `/api`)

### Acceso desde móvil u otro PC en la red

1. Arranca con `npm run dev:all`.
2. Copia la URL **Network** que muestra Vite (ej. `http://192.168.1.2:5173`).
3. Si no carga desde el teléfono, abre el firewall (PowerShell **como administrador**):

   ```bash
   npm run dev:lan
   ```

   Luego vuelve a ejecutar `npm run dev:all`.

4. No uses `localhost` en el móvil; usa la IP de red que imprime Vite.
5. Si el puerto 5173 está ocupado, Vite usará 5174: revisa la consola y usa ese puerto.

## Scripts

| Script              | Descripción                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Dev server de Vite                           |
| `npm run dev:lan`   | Abre puertos 5173/3080 en firewall (Windows, admin) |
| `npm run server`    | API admin Node (`server/`) con `--watch`     |
| `npm run dev:all`   | Frontend + API admin en paralelo             |
| `npm run build`     | Type-check + build de producción             |
| `npm run preview`   | Sirve el build de producción                 |
| `npm run lint`      | ESLint                                       |
| `npm run typecheck` | Comprobación de tipos sin emitir             |

## Estructura

```
.
├── .cursor/rules/        # Reglas mobile-first y accesibilidad WCAG
├── server/               # API admin Node/Express (HaiSupport, Supabase admin)
│   ├── index.js
│   ├── lib/
│   └── routes/
├── src/
│   ├── components/
│   │   ├── ui/           # Componentes Shadcn (Radix)
│   │   └── layout/
│   ├── context/          # Estado global ligero (Context API)
│   ├── hooks/            # Hooks con React Query
│   ├── lib/              # supabase, utils
│   ├── pages/            # Rutas
│   ├── types/
│   ├── providers.tsx     # React Query + Context
│   ├── router.tsx
│   ├── App.tsx
│   └── main.tsx
└── ...configs (vite, tailwind, tsconfig, eslint, postcss)
```

## Convenciones

- Componentes funcionales y alias de importación `@/` → `src/`.
- Estado global ligero con Context API + caché de servidor con React Query (no Redux).
- Diseño mobile-first y accesibilidad WCAG 2.1 AA (ver `.cursor/rules`).

## Base de datos (Supabase)

La tienda espera una tabla `products`. Ejemplo de esquema:

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  currency text not null default 'EUR',
  image_url text,
  stock int not null default 0,
  category text,
  created_at timestamptz not null default now()
);
```

Mientras la tabla no exista o esté vacía, la app muestra datos demo.
