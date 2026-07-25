# CollectorDex

Aplicación web local para gestionar una colección física de videojuegos Pokémon (línea principal), con wishlist, anuncios manuales, historial de precios y análisis de progreso.

> MVP en construcción. Completadas las fases 0–3 (bootstrap, auth/seed, dashboard/catálogo, colección + componentes).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui + Lucide
- PostgreSQL + Prisma
- Auth.js (Credentials)
- Zod, React Hook Form
- Vitest + Testing Library + Playwright
- Docker Compose (PostgreSQL)

## Requisitos

- Node.js 22+
- Docker (recomendado) **o** PostgreSQL 16 local

## Arranque rápido

```bash
# 1) Base de datos
docker compose up -d
# (alternativa sin Docker: PostgreSQL local con la URL de .env.example)

# 2) Entorno
cp .env.example .env

# 3) Dependencias y schema
npm install
npx prisma migrate dev
npm run db:seed

# 4) Desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Credenciales demo

- Correo: `demo@collectordex.local`
- Contraseña: `collectordex`

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run db:migrate` | Migraciones Prisma |
| `npm run db:seed` | Seed editable |

## Notas

- Los precios del seed son **orientativos**, no datos de mercado en tiempo real.
- No hay scraping ni APIs privadas de marketplaces en el MVP.
- Las portadas usan placeholders locales (`public/placeholders`).
- El modelo es multiusuario; el seed crea un usuario demo.
- Hay un índice único parcial en PostgreSQL (`owned_copies_one_primary_per_user_edition`) que garantiza como máximo una copia principal por usuario y edición. Prisma no puede declararlo en el schema; está en la migración SQL.
