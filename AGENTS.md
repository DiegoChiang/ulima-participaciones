# Guía para futuras ejecuciones

## Proyecto y raíz

Este repositorio es **ULima Participaciones**. Trabaja siempre en la raíz del repositorio actual; no crees un proyecto anidado ni copies archivos a otra carpeta como parte del desarrollo.

## Arquitectura

- React + TypeScript + Vite en `src/`.
- React Router protege las rutas con `ProtectedRoute`.
- `src/lib/api.ts` contiene las operaciones de dominio con Supabase.
- Las rutas de sección tienen exactamente cuatro pestañas: Alumnos, Grupos, Participaciones individuales y Participaciones grupales.
- No agregues dashboards, rankings, gráficos, analytics ni KPIs.

## Comandos

```sh
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
npm run test:db
npm run test:e2e
```

Para Supabase local usa `npx supabase start` y `npx supabase db reset --local`. Nunca ejecutes un reset contra un proyecto remoto.

## Supabase y seguridad

- Versiona todo cambio de base de datos en `supabase/migrations/`: tablas, índices, checks, funciones, triggers, RLS y policies.
- Todas las tablas públicas usan RLS y el ownership se deriva de `auth.uid()`.
- No confíes en filtros de React para autorización.
- No uses `service_role` en el frontend ni en variables `VITE_*`.
- `.env.local` es local, ignorado y jamás debe ir en un commit. `.env.example` contiene solo placeholders.

## Reglas del modelo

- `courses` y `sections` son entidades normalizadas. La combinación curso + sección se normaliza con trim/minúsculas y es única por propietario.
- `students` es global por usuario y `section_students` representa la matrícula. El código de alumno es único por propietario.
- `group_memberships` solo permite un grupo por alumno y sección; las foreign keys y triggers garantizan pertenencia a la misma sección.
- `participation_records` separa registros `individual` y `group`; sus tablas de scores respectivas preservan foreign keys reales.
- Hay exactamente 12 oportunidades. `opportunity_number` acepta 1 a 12 y `points` acepta 1 a 3. Un cero se guarda sin fila.
- La matriz debe conservar el ciclo accesible `0 → 1 → 2 → 3 → 0`, con mouse, touch, teclado, focus y scroll horizontal en móvil.

## Diseño y calidad

Respeta siempre la skill `ULIMA_DESIGN` disponible antes de modificar la interfaz. Conserva estados de carga, error, vacío, confirmaciones para acciones destructivas y objetivos táctiles adecuados. Ejecuta las pruebas relacionadas, typecheck, lint y build antes de cada commit relevante. Mantén commits pequeños, coherentes y sin secretos.
