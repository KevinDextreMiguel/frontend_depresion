import { test, expect } from '@playwright/test';

/**
 * HU0039 — Acceder a datos anonimizados para estudios académicos
 * CA2 — Validación de permisos
 * Contexto: el acceso requiere aprobación.
 * Evento: se intenta descargar los datos.
 * Resultado esperado: el sistema valida sus permisos antes de habilitar la
 * descarga.
 *
 * NOTA DE TRAZABILIDAD: el rol "investigador" de la HU original fue
 * descartado por no tener implementación real (ver admin/HU0039/HU0039_CA01).
 * `GET /api/admin-ext/researcher/dataset` es admin-only
 * (`require_role(["admin"])`, backend/app/routers/extended_features.py). Se
 * verifica que un usuario autenticado SIN ese permiso (psicólogo) recibe un
 * rechazo explícito antes de poder acceder al dataset.
 *
 * Corre en el proyecto "psicologo" (storageState de un psicólogo sin
 * permisos de administrador para este recurso).
 */
test('un usuario sin permisos de administrador no puede acceder al dataset anonimizado de investigación', async ({ page }) => {
  const response = await page.request.get('/api/admin-ext/researcher/dataset');
  expect(response.status()).toBe(403);
});
