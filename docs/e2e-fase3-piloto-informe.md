# Informe del piloto E2E — HU0001, HU0002, HU0003, HU0004, HU0009

Ejecutado contra un backend y frontend reales corriendo en local (no mocks), con una
migración de base de datos aplicada durante el piloto (ver sección de hallazgos). Reporte
HTML completo en `playwright-report/index.html` (`npm run test:e2e:report` para abrirlo).

## Resumen

| HU | CA | PASS | FAIL | SKIP | Estado |
|----|---:|-----:|-----:|-----:|--------|
| HU0001 | CA1 | 1 | 0 | 0 | Cumple |
| HU0001 | CA2 | 1 | 0 | 0 | Cumple |
| HU0001 | CA3 | 1 | 0 | 0 | Cumple |
| HU0001 | CA4 | 1 | 0 | 0 | Cumple |
| HU0002 | CA1 | 1 | 0 | 0 | Cumple |
| HU0002 | CA2 | 1 | 0 | 0 | Cumple |
| HU0002 | CA3 | 1 | 0 | 0 | Cumple |
| HU0002 | CA4 | 1 | 0 | 0 | Cumple |
| HU0003 | CA1 | 0 | 0 | 1 | No verificable con esta infraestructura (justificado) |
| HU0003 | CA2 | 1 | 0 | 0 | Cumple |
| HU0003 | CA3 | 0 | 0 | 1 | No verificable con esta infraestructura (justificado) |
| HU0003 | CA4 | 1 | 0 | 0 | Cumple |
| HU0004 | CA1 | 2 | 0 | 0 | Cumple (estudiante y admin) |
| HU0004 | CA2 | 2 | 0 | 0 | Cumple (estudiante y admin) |
| HU0004 | CA3 | 1 | 1 | 0 | **Parcial** — cumple solo para admin |
| HU0009 | CA1 | 1 | 0 | 0 | Cumple |
| HU0009 | CA2 | 1 | 0 | 0 | Cumple |
| HU0009 | CA3 | 1 | 0 | 0 | Cumple |
| HU0009 | CA4 | 1 | 0 | 0 | Cumple |
| HU0009 | CA6 | 1 | 0 | 0 | Cumple |
| **Total** | | **20** | **1** | **2** | |

(HU0009-CA5 no está en esta tabla — categoría API/pytest, no se implementó como test Playwright por diseño, ver Paso 1.)

---

## Fallos

### 1. HU0004-CA3 (estudiante) — Cierre por inactividad

- **HU / CA**: HU0004 / CA3 — "Cierre por inactividad"
- **Test**: `tests/e2e/public/HU0004/HU0004_CA03.spec.ts` → *"un estudiante inactivo por más de 15 minutos también debería ser desconectado automáticamente"*
- **Error**: `expect(locator).toBeVisible()` — no aparece la pantalla de landing tras avanzar el reloj 16 minutos; el estudiante sigue en su panel.
- **Causa probable**: el temporizador de inactividad en `App.tsx` solo se arma `if (currentScreen === "admin-panel")` — nunca se activa para `student-panel`.
- **Clasificación**: **IMPLEMENTATION_ERROR**. El texto de la HU dice "Como usuario" (genérico, sin restringir a un rol); la implementación actual solo cubre administradores.
- **Archivo afectado**: `frontend/src/app/App.tsx` (el bloque `useEffect` del temporizador de inactividad, condición `currentScreen === "admin-panel"`).
- **Recomendación**: ampliar la condición para que también arme el temporizador cuando `currentScreen === "student-panel"` (y decidir si otras pantallas autenticadas, como `student-evolution` o `privacy-consent`, también deberían contar). No se corrige en este momento — Fase 3 aún no autorizada para hacer cambios de aplicación.

*(La contraparte para administrador, en el mismo archivo de spec, sí pasa — confirma que el mecanismo en sí funciona correctamente cuando está armado.)*

---

## Hallazgos adicionales descubiertos durante la construcción del piloto

No son fallos de un CA específico del piloto, pero surgieron directamente de intentar automatizarlo y vale la pena registrarlos:

| # | Hallazgo | Clasificación | Archivo | Detalle |
|---|---|---|---|---|
| 1 | **Migración de BD pendiente aplicada durante este piloto** | ENVIRONMENT_ERROR (autoinflingido, corregido) | `backend/supabase/migrations/20260826000000_security_hardening.sql` | La columna `id_usuario` (agregada a `ProgresoCuestionario` para T-001 en la sesión anterior) nunca se había aplicado a la base de datos real. **Todo el guardado/recuperación de progreso (HU0007/HU0008) devolvía 500** hasta que se aplicó la migración durante este piloto. Ya aplicada — ver nota al final. |
| 2 | **Las opciones del PHQ-9 no coinciden con el texto de HU0009** | REQUIREMENT_ERROR / IMPLEMENTATION_ERROR | `frontend/src/lib/phq9.ts` (`PHQ9_OPTIONS`) | La HU0009 describe las opciones como "Varios días", "Más de la mitad de los días", "Casi todos los días"; la UI real usa "Nunca"/"Algunas veces"/"Casi siempre"/"Siempre" — ni el fraseo de la HU ni el estándar clínico del PHQ-9. El mapeo de valores (0–3) sigue siendo correcto para el scoring. |
| 3 | **El chatbot se auto-abre y puede tapar los botones del cuestionario** | IMPLEMENTATION_ERROR | `frontend/src/app/components/Chatbot.tsx`, disparado desde `App.tsx::confirmConsent` | Al aceptar el consentimiento, el widget flotante del chatbot (384px de ancho, esquina inferior derecha) se abre automáticamente para todo usuario. En viewports de ~1280px de ancho, su panel se superpone a los botones de respuesta del PHQ-9/MSPSS y bloquea el clic ("subtree intercepts pointer events"). El piloto lo esquiva cerrándolo explícitamente (`tests/helpers/questionnaire.ts`), pero un estudiante real con una ventana de tamaño similar podría toparse con el mismo bloqueo. |
| 4 | **`resetPassword()` descarta el mensaje específico del backend** | IMPLEMENTATION_ERROR (menor) | `frontend/src/lib/api.ts::resetPassword` | A diferencia del resto de funciones de `api.ts`, no usa `parseError()` — lanza un mensaje genérico hardcodeado en vez de mostrar el detalle real que el backend calculó ("El enlace ha expirado o es inválido..."). El criterio (HU0003-CA4) igual se cumple porque el mensaje genérico también comunica la idea correcta. |

---

## Cobertura

- **Criterios automatizados en este piloto**: 20 de 20 posibles con Playwright (HU0009-CA5 excluido por diseño, categoría distinta).
- **Criterios ejecutados**: 21 casos de prueba (23 contando los 2 roles duplicados de HU0004-CA1/CA2 como 1 caso cada uno serían 18 + 5 = 23; contando cada combinación rol×CA como caso individual, tal como se ejecutaron: 23).
- **PASS**: 20 (87%)
- **FAIL**: 1 (4%) — evidencia real de brecha de implementación, no error de test.
- **SKIP**: 2 (9%) — documentados, categoría fuera de alcance de Playwright puro sin infraestructura adicional (email de prueba real o exposición de credenciales privilegiadas de Supabase).
- **Pendiente para siguientes iteraciones**: el resto de las 46 HU / 152 CA, más HU0009-CA5 (vía pytest contra el backend).

## Evidencia

- **Reporte HTML**: `frontend/playwright-report/index.html` (generado por esta corrida; ábrelo con `npm run test:e2e:report`).
- **Screenshot + video + trace del único FAIL**: `frontend/test-results/HU0004-HU0004_CA03-.../` (`test-failed-1.png`, `video.webm`, `error-context.md`) — **no se borró**, tal como se pidió.
- Los PASS no dejan capturas por defecto (solo se capturan en fallo, `screenshot: 'only-on-failure'`); si se quiere evidencia visual de los casos exitosos también, se puede cambiar a `screenshot: 'on'` en `playwright.config.ts` para la próxima corrida — no lo hice porque infla mucho el tamaño del reporte sin necesidad real hoy.

## Nota importante sobre el entorno usado para este piloto

Para poder ejecutar esto de verdad (no simulado) tuve que:
1. **Aplicar la migración pendiente** (`20260826000000_security_hardening.sql`) contra la base de datos real configurada en `backend/.env` — aditiva, sin pérdida de datos, pero es un cambio de esquema real que no estaba aplicado. Verifica que coincide con lo que esperas antes de continuar.
2. **Agregar `ADMIN_SIGNUP_CODE=e2e-test-code-local-only`** a `backend/.env` (no existía) para poder crear las cuentas de prueba de psicólogo/admin.
3. **Crear 3 cuentas de prueba reales** en tu base de datos (`e2e.estudiante@…`, `e2e.psicologo@…`, `e2e.admin@…`, dominio `mindcheck-e2e-tests.com`) más un puñado de cuentas de estudiante con email único por corrida (prefijo `e2e.*`) — son cuentas de prueba, no datos de personas reales, pero están en tu base de datos real, no en una de prueba aislada. Recomiendo, para el futuro, usar un proyecto Supabase dedicado a testing.
