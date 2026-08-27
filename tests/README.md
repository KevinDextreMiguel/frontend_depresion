# E2E (Playwright) — MindCheck

Infraestructura de pruebas end-to-end. **No hay specs de negocio todavía** —
esta carpeta es solo la infraestructura (config, autenticación, estructura de
carpetas). Los specs se agregan en la siguiente fase, según el informe de
factibilidad de automatización (`docs/e2e-automatizacion-criterios.md`).

## Estructura

```
tests/
  fixtures/
    test-data.ts       # credenciales/datos de prueba (desde .env.test)
  helpers/
    auth.ts             # login/signup vía API, usado solo por setup/
  setup/
    auth.setup.ts        # proyecto "setup" de Playwright: genera storageState
                          # por rol en playwright/.auth/*.json (gitignored)
  e2e/
    public/               # sin sesión — landing, login, registro, cuestionario anónimo
    estudiante/           # sesión de estudiante
    psicologo/            # sesión de psicólogo
    admin/                # sesión de administrador
```

Cada carpeta de `e2e/` es un proyecto Playwright independiente (ver
`playwright.config.ts`), con su propio `storageState` cuando aplica. Un spec
en `e2e/psicologo/` arranca ya autenticado como psicólogo — no hace falta (ni
se debe) repetir el login ahí, salvo que el propio spec esté probando el
login en sí (HU0002), en cuyo caso va en `e2e/public/`.

## Requisitos antes de correr las pruebas

1. Backend corriendo aparte (`backend/run_backend.ps1` o equivalente),
   alcanzable en el puerto que usa el proxy de Vite (`vite.config.ts`,
   por defecto `http://127.0.0.1:8000`).
2. `cp .env.test.example .env.test` y completar credenciales de prueba. El
   `ADMIN_SIGNUP_CODE` debe coincidir con el del backend (`backend/.env`) o
   el setup de psicólogo/admin fallará con 403.
3. El frontend NO hace falta arrancarlo a mano: `playwright.config.ts` lo
   levanta solo (`webServer`) si no está corriendo ya.

## Comandos

```bash
npm run test:e2e            # corre toda la suite (headless)
npm run test:e2e:ui         # modo UI interactivo de Playwright
npm run test:e2e:headed     # con navegador visible
npm run test:e2e:report     # abre el último reporte HTML
```

Para correr solo un proyecto: `npx playwright test --project=psicologo`.

## Por qué autenticación vía API y no por UI

`tests/setup/auth.setup.ts` inicia sesión llamando directamente a
`POST /api/auth/login` (registrando la cuenta de prueba primero si no
existe) en vez de clickear el formulario. Es más rápido y no acopla cada
spec de negocio a la implementación del formulario de login — ese formulario
tiene sus propios specs dedicados en `e2e/public/` (HU0001/HU0002).
