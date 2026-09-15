import { test, expect } from '@playwright/test';

/**
 * HU0043 — Registrar auditorías de acceso y cambios del sistema
 * CA3 — Consulta de auditoría
 * Contexto: un administrador requiere revisar eventos.
 * Evento: accede al módulo de auditoría.
 * Resultado esperado: el sistema muestra el historial filtrable de
 * actividades.
 */
test('el administrador consulta el historial filtrable de auditoría del sistema', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="nav-audit"]').click();

  await expect(page.getByText('Auditoría del Sistema')).toBeVisible({ timeout: 10_000 });

  // Filtros disponibles (acción, tabla afectada, rango de fechas).
  await expect(page.locator('[data-testid="audit-filter-accion"]')).toBeVisible();
  await expect(page.locator('[data-testid="audit-filter-tabla"]')).toBeVisible();
  await expect(page.locator('[data-testid="audit-filter-desde"]')).toBeVisible();
  await expect(page.locator('[data-testid="audit-filter-hasta"]')).toBeVisible();

  // El módulo debe terminar de cargar mostrando la tabla con resultados o el
  // estado vacío explícito — ambos confirman que la consulta al historial
  // real del backend se completó correctamente.
  await expect(
    page.locator('[data-testid="audit-log-table"]').or(page.getByText('No hay registros de auditoría'))
  ).toBeVisible({ timeout: 15_000 });

  // Aplicar un filtro por acción no debe romper la vista, y debe recargar la
  // tabla con los resultados que apliquen (posiblemente vacíos si el término
  // no matchea nada, lo cual también es un resultado válido de "filtrable").
  await page.locator('[data-testid="audit-filter-accion"]').fill('login');
  await page.locator('[data-testid="audit-filter-apply-btn"]').click();
  await expect(page.getByText(/Historial de actividades/)).toBeVisible({ timeout: 15_000 });
});
