import { test, expect } from '@playwright/test';

/**
 * HU0032 — Copias de seguridad automáticas
 * CA3 — Restauración de respaldo
 * Contexto: se requiere recuperar información.
 * Evento: se selecciona un punto de restauración y se confirma la acción.
 * Resultado esperado: el sistema permite restaurar los datos de forma segura
 * (pide confirmación explícita antes de ejecutar la restauración).
 *
 * Corre en el proyecto "admin" (storageState del administrador).
 */
test('el administrador restaura un punto de respaldo previa confirmación explícita', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-backups, [id="nav-backups"]').first().click();

  await expect(page.getByText('Copias de Seguridad')).toBeVisible({ timeout: 10_000 });

  // Asegurar que exista al menos un punto de restauración disponible.
  await page.locator('#btn-run-backup').click();
  await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 20_000 });

  const restoreButton = page.getByTitle('Restaurar base de datos a este punto').first();
  await expect(restoreButton).toBeVisible({ timeout: 10_000 });
  await restoreButton.click();

  // Resultado esperado: el sistema exige confirmación explícita antes de restaurar.
  await expect(page.getByText('¿Confirmar?')).toBeVisible({ timeout: 5_000 });
  const confirmButton = page.getByRole('button', { name: 'Sí, restaurar' });
  await expect(confirmButton).toBeVisible();

  await confirmButton.click();

  // Resultado esperado: la restauración se ejecuta de forma segura y el
  // sistema notifica el resultado al administrador.
  await expect(page.locator('[data-sonner-toast]').last()).toBeVisible({ timeout: 20_000 });
});
