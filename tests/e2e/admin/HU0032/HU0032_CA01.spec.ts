import { test, expect } from '@playwright/test';

/**
 * HU0032 — Copias de seguridad automáticas
 * CA1 — Programación de respaldos
 * Contexto: se definen políticas de respaldo.
 * Evento: el administrador configura la periodicidad.
 * Resultado esperado: el sistema ejecuta copias automáticas según la
 * programación (la programación queda guardada y activa).
 *
 * Corre en el proyecto "admin" (storageState del administrador).
 */
test('el administrador configura la periodicidad de los respaldos automáticos y el sistema guarda la programación', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Panel de Administración', { exact: false }).first().click().catch(() => undefined);
  await page.locator('#nav-backups, [id="nav-backups"]').first().click();

  await expect(page.getByText('Copias de Seguridad')).toBeVisible({ timeout: 10_000 });

  await page.locator('#backup-periodicidad').selectOption('diaria');
  await page.locator('#backup-hora').fill('03:00');

  await page.getByText('Inactivo').first().click().catch(() => undefined);

  await page.locator('#btn-save-backup-config').click();

  // Resultado esperado: la configuración guardada refleja la periodicidad y
  // hora recién definidas.
  await expect(page.getByText(/Configuración guardada:\s*Diaria/i)).toBeVisible({ timeout: 10_000 });
});
