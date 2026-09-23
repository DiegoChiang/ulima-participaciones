# ULima Participaciones

Aplicación web para registrar cursos, secciones, alumnos, grupos y participaciones individuales o grupales. Cada cuenta autenticada solo puede acceder a su propio árbol de datos.

## Stack

- React, TypeScript y Vite
- Supabase Auth y PostgreSQL con Row Level Security
- React Router
- Vitest, React Testing Library, pgTAP y Playwright
- Vercel

## Arquitectura

La interfaz se organiza por rutas y páginas de dominio. `src/lib/api.ts` concentra las llamadas a Supabase; `src/lib/supabase.ts` crea el cliente con variables públicas de Vite; los componentes de matriz reutilizan el ciclo de puntuación `0 → 1 → 2 → 3 → 0`.

```
src/
  auth/          sesión y rutas privadas
  components/    UI reutilizable, diálogos y matriz de puntos
  layout/        estructura general y navegación de sección
  pages/         cursos/secciones, alumnos, grupos y participaciones
  lib/           API, tipos, errores y reglas de puntuación
supabase/
  migrations/    esquema, RLS, funciones, triggers e índices versionados
  tests/         pruebas pgTAP de integridad y aislamiento
e2e/             flujos Playwright
```

## Datos y seguridad

Las entidades principales son `courses`, `sections`, `students`, `section_students`, `groups`, `group_memberships`, `participation_records`, `student_participation_scores` y `group_participation_scores`.

Las puntuaciones están normalizadas: hay una fila por entidad y oportunidad, con `opportunity_number` entre 1 y 12 y `points` entre 1 y 3. El cero se representa sin una fila. Las migraciones aplican foreign keys compuestas, checks, índices, triggers `updated_at` y RLS en todas las tablas públicas. Las políticas comparan el propietario con `auth.uid()`; el frontend nunca utiliza `service_role`.

## Configuración

```sh
cp .env.example .env.local
```

Completa únicamente estas variables en `.env.local`:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

`.env.local` está ignorado por Git. No uses ni expongas una clave `service_role` en variables `VITE_*`.

## Desarrollo

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

## Supabase local y migraciones

Docker Desktop debe estar iniciado.

```sh
npx supabase start
npx supabase db reset --local
npm run test:db
npx supabase db lint --local --schema public --fail-on error
```

Todas las modificaciones de esquema deben ser nuevas migraciones en `supabase/migrations/`. No apliques cambios exclusivamente desde Supabase Studio. Para un proyecto remoto previamente enlazado, revisa primero `npx supabase migration list --linked` y aplica solo migraciones pendientes con `npx supabase db push`; nunca uses `db reset` contra remoto.

## Testing

```sh
npm test
npm run test:db
npm run test:e2e
```

Las pruebas de interfaz cubren autenticación, rutas privadas, matrices y operaciones de participación. pgTAP verifica constraints y RLS entre dos usuarios. Playwright prueba el acceso público y el flujo autenticado en desktop, tablet y móvil. Para ejecutar flujos E2E contra el stack local sin cambiar `.env.local`, exporta temporalmente `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` con los valores que entrega `npx supabase status -o env`.

## Vercel

`vercel.json` define build de Vite, salida `dist` y el rewrite SPA. Conecta el repositorio de GitHub, configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` para Preview y Production, y deja `main` como branch de producción. No subas `.env.local`.

## Alcance

La aplicación no incluye dashboards, rankings, gráficos, analytics ni comparaciones de rendimiento.
