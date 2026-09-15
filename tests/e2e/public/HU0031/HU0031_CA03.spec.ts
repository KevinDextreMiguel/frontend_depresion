import { test, expect } from '@playwright/test';

/**
 * HU0031 — Gestión de políticas de privacidad y consentimiento informado
 * CA3 — Registro de consentimiento
 * Contexto: un usuario acepta las políticas.
 * Evento: confirma su consentimiento.
 * Resultado esperado: el sistema almacena fecha, hora y versión aceptada.
 *
 * `POST /api/admin-ext/tc-accept` (backend/app/routers/extended_features.py)
 * inserta una fila en `terminos_aceptacion` con la versión aceptada y la
 * fecha (`fecha_aceptacion` por defecto de la tabla). Se acepta desde un
 * contexto anónimo (sin sesión) y se confirma, consultando el estado por IP,
 * que queda registrada la fecha y la versión.
 */
test('al aceptar las políticas, el sistema almacena la fecha y la versión aceptada', async ({ request }) => {
  const statusBefore = await request.get('/api/admin-ext/tc-status');
  expect(statusBefore.ok()).toBeTruthy();
  const { version } = await statusBefore.json();

  const acceptRes = await request.post('/api/admin-ext/tc-accept', {
    data: { version },
  });
  expect(acceptRes.ok()).toBeTruthy();
  const acceptBody = await acceptRes.json();
  expect(acceptBody.success).toBeTruthy();

  const statusAfter = await request.get('/api/admin-ext/tc-status');
  expect(statusAfter.ok()).toBeTruthy();
  const afterBody = await statusAfter.json();
  expect(afterBody.version).toBe(version);
  expect(afterBody.accepted).toBeTruthy();
  expect(afterBody.fecha_aceptacion).toBeTruthy();
});
