# Fase 3 — Plan del piloto E2E (HU0001, HU0002, HU0003, HU0004, HU0009)

## Paso 1 — Estrategia de pruebas

| Categoría | Definición | Cuándo se usa aquí |
|---|---|---|
| **E2E Playwright** | El criterio se verifica completamente desde la interfaz: llenar un formulario, hacer clic, verificar un mensaje/redirección/estado visual. | Mayoría de los CA del piloto. |
| **E2E + API** | Playwright conduce el flujo de usuario, pero la aserción final necesita datos del backend que la UI no expone directamente (ej. confirmar que una cuenta quedó realmente creada, o preparar un estado previo vía API antes de la parte visible). | HU0001-CA2 (sembrar la cuenta "ya registrada" antes de probar el rechazo); HU0009-CA3 (confirmar vía sesión de psicólogo, que es UI, no API — no aplica aquí en realidad, ver nota). |
| **API / pytest** | No es razonable ni correcto verificarlo desde el navegador (BD directa, criptografía, procesos de servidor). | Ninguno del piloto cae aquí — los 5 HU seleccionados son, por diseño, altamente observables desde la UI. |
| **Manual / documental** | Juicio subjetivo o requiere evidencia externa (correo real recibido). | HU0003-CA1 (confirmar que el correo *llegó* — fuera de este piloto, ver Paso 8). |

Ninguno de los 18 criterios del piloto requirió forzar Playwright donde no corresponde — es precisamente por eso que estas 5 HU se eligieron primero.

## Paso 2 — Matriz de cobertura del piloto (con resultado real de ejecución)

| HU | CA | Tipo | Test | Rol | Prioridad | Resultado |
|----|----|------|------|-----|-----------|--------|
| HU0001 | CA1 | E2E | HU0001_CA01 | Estudiante | P1 | ✅ PASS |
| HU0001 | CA2 | E2E+API | HU0001_CA02 | Estudiante | P1 | ✅ PASS |
| HU0001 | CA3 | E2E | HU0001_CA03 | Estudiante | P1 | ✅ PASS |
| HU0001 | CA4 | E2E | HU0001_CA04 | Estudiante | P1 | ✅ PASS |
| HU0002 | CA1 | E2E+API | HU0002_CA01 | Estudiante | P1 | ✅ PASS |
| HU0002 | CA2 | E2E | HU0002_CA02 | Estudiante | P1 | ✅ PASS |
| HU0002 | CA3 | E2E | HU0002_CA03 | Estudiante | P1 | ✅ PASS |
| HU0002 | CA4 | E2E | HU0002_CA04 | Estudiante | P2 | ✅ PASS |
| HU0003 | CA1 | Manual/E2E parcial | HU0003_CA01 | Estudiante | P1 | ⏭ SKIP (justificado, ver Paso 8) |
| HU0003 | CA2 | E2E | HU0003_CA02 | Estudiante | P1 | ✅ PASS |
| HU0003 | CA3 | E2E+API | HU0003_CA03 | Estudiante | P2 | ⏭ SKIP (justificado, ver Paso 8) |
| HU0003 | CA4 | E2E | HU0003_CA04 | Estudiante | P1 | ✅ PASS |
| HU0004 | CA1 | E2E | HU0004_CA01 | Estudiante + Admin | P1 | ✅ PASS (2/2 roles) |
| HU0004 | CA2 | E2E | HU0004_CA02 | Estudiante + Admin | P1 | ✅ PASS (2/2 roles) |
| HU0004 | CA3 | E2E | HU0004_CA03 | Estudiante + Admin | P1 | ⚠️ PASS admin / **FAIL estudiante** (evidencia real de brecha, ver informe) |
| HU0009 | CA1 | E2E | HU0009_CA01 | Estudiante | P0 | ✅ PASS |
| HU0009 | CA2 | E2E | HU0009_CA02 | Estudiante | P0 | ✅ PASS |
| HU0009 | CA3 | E2E+API | HU0009_CA03 | Estudiante + Psicólogo | P0 | ✅ PASS |
| HU0009 | CA4 | E2E | HU0009_CA04 | Estudiante | P0 | ✅ PASS |
| HU0009 | CA5 | API/pytest | — | — | — | **No incluido** (no observable desde UI, ver auditoría T-013) |
| HU0009 | CA6 | E2E | HU0009_CA06 | Psicólogo | P0 | ✅ PASS |

**Resultado final de ejecución** (23 casos de prueba del piloto, sin contar los 3 tests de `setup`): **20 PASS, 1 FAIL, 2 SKIP**. Ver el informe completo en `docs/e2e-fase3-piloto-informe.md`.

## Paso 3 — Verificación de testeabilidad antes de escribir cada test

Antes de crear cada spec, se confirmó contra el código actual (no contra el enunciado ideal de la HU):

- **HU0001**: formulario "Crear Cuenta" en `UnifiedAuthFlow.tsx` (modo `student-register`) — accesible, campos confirmados uno por uno.
- **HU0002**: formulario "Iniciar Sesión" (modo `student-login`) — accesible; CA4 (sesión activa → redirige) se prueba con `storageState` inyectado, sin repetir el login por UI.
- **HU0003**: se verificó que `ForgotPassword.tsx`/`ResetPassword.tsx` **ya no son código muerto** — fueron conectados en una sesión anterior de esta misma auditoría (enlace "¿Olvidaste tu contraseña?" en el login + detección de `#access_token` en `App.tsx`). El hallazgo de auditoría que menciona el Paso 8 está **desactualizado**; se documenta la discrepancia en la sección de resultados.
- **HU0004**: se confirmó en `App.tsx` que el timer de inactividad de 15 min solo aplica `if (currentScreen === "admin-panel")` — el estudiante **no** tiene timeout de inactividad. El test de CA3 se escribió para el alcance real de la HU (genérico, "Como usuario"), no ajustado a lo que ya funciona.
- **HU0009**: se verificó que todos los campos demográficos tienen valores por defecto que ya satisfacen `isDemographicsValid()`, que las opciones de MSPSS/PHQ-9 son botones con texto único por pantalla (accesibles por rol+nombre sin necesitar `data-testid`), y que el checkbox de consentimiento (paso 2, pregunta 9) está correctamente envuelto en su `<label>` (nombre accesible real).

## Selectores y mejoras mínimas de testabilidad (Paso 6)

Los formularios de autenticación (`UnifiedAuthFlow.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`) tienen `<label>` visual **sin** asociación programática (`htmlFor`/`id`) con su `<input>`, y dos campos de contraseña comparten el mismo placeholder (`••••••••`) — por lo tanto `getByLabel`/`getByPlaceholder` no los distingue de forma confiable. Se agregaron los siguientes `data-testid` (única modificación de `src/` en este piloto, sin tocar lógica funcional):

`login-email`, `login-password`, `login-submit`, `link-forgot-password`,
`register-nombre`, `register-email`, `register-edad`, `register-carrera`, `register-universidad`, `register-password`, `register-confirm-password`, `register-submit`,
`forgot-email`, `forgot-submit`, `forgot-error`,
`reset-password`, `reset-confirm-password`, `reset-submit`, `reset-error`.

El resto de la aplicación (checkboxes de consentimiento, botones de opciones del cuestionario, botones de navegación) ya tiene nombres accesibles reales — no se tocó nada ahí.

## Datos de prueba (Paso 7)

Todos los specs importan desde `tests/fixtures/test-data.ts`. Sin literales hardcodeados en los `.spec.ts`. Para HU0001-CA1 (requiere una cuenta que no exista) se usa `uniqueTestEmail()`, determinista en forma y único en valor por corrida. Para HU0001-CA2 (requiere una cuenta que sí exista) se usa `EXISTING_STUDENT`, sembrada vía API en `beforeAll` con `ensureStudentSession` antes de reintentar el registro por UI.
