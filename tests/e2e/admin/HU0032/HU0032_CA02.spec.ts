import { test, expect } from '@playwright/test';

/**
 * HU0032 — Copias de seguridad automáticas
 * CA2 — Notificación de respaldo
 * Contexto: finaliza un proceso de copia.
 * Evento: se completa o falla el respaldo.
 * Resultado esperado: el sistema notifica el resultado al administrador.
 */
test('al ejecutar un respaldo manual el sistema notifica el resultado al administrador', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-backups, [id="nav-backups"]').first().click();

  await expect(page.getByText('Copias de Seguridad')).toBeVisible({ timeout: 10_000 });

  await page.locator('#btn-run-backup').click();

  // Resultado esperado: aparece una notificación (toast) con el resultado
  // del respaldo (éxito o error) — no queda en silencio.
  await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 20_000 });
});
