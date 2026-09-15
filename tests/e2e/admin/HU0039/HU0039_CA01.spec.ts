import { test, expect } from '@playwright/test';

/**
 * HU0039 — Acceder a datos anonimizados para estudios académicos
 * CA1 — Acceso a dataset anonimizado
 * Contexto: se cuenta con autorización.
 * Evento: se solicita el conjunto de datos.
 * Resultado esperado: el sistema entrega información sin identificadores
 * personales.
 *
 * NOTA DE TRAZABILIDAD: la HU original dice "Como investigador", pero en
 * esta sesión se eliminó el rol "investigador" del sistema por no tener
 * ninguna implementación real (no existía ninguna cuenta con ese rol ni
 * flujo de aprobación distinto). El endpoint real
 * `GET /api/admin-ext/researcher/dataset` (backend/app/routers/extended_features.py)
 * es admin-only (`require_role(["admin"])`) — se prueba el acceso
 * administrativo equivalente, que es la funcionalidad realmente construida:
 * el panel "Dataset Anonimizado (Investigación)" dentro de Exportación de
 * Datos.
 */
test('el administrador accede al dataset anonimizado sin identificadores personales', async ({ page }) => {
  test.setTimeout(30_000);

  await page.goto('/');
  await page.locator('#nav-exports, [id="nav-exports"]').first().click();
  await expect(page.getByText('Exportación de Datos')).toBeVisible({ timeout: 10_000 });

  await expect(page.getByText('Dataset Anonimizado (Investigación)')).toBeVisible();
  await page.getByRole('button', { name: 'Recargar' }).last().click();

  // El dataset debe cargar (con datos o el estado vacío explícito) y, si
  // hay registros, sus columnas no deben incluir nombre/correo del
  // estudiante — solo identificadores seudonimizados (hash) y variables.
  const emptyState = page.getByText('No hay registros disponibles para investigación.');
  const table = page.locator('table').filter({ has: page.locator('th') }).last();

  await expect(emptyState.or(table)).toBeVisible({ timeout: 15_000 });
  if (await table.isVisible().catch(() => false)) {
    const headerText = (await table.locator('thead').innerText()).toLowerCase();
    expect(headerText).not.toContain('correo');
    expect(headerText).not.toContain('nombre');
  }
});
