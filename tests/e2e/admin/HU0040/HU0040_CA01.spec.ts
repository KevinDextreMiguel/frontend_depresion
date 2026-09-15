import { test, expect } from '@playwright/test';

/**
 * HU0040 — Gestión de usuarios, psicólogos y configuraciones generales
 * CA1 — Gestión de usuarios
 * Contexto: se requiere crear, editar o desactivar cuentas.
 * Evento: se realiza una acción administrativa (aquí: desactivar/activar una
 * cuenta).
 * Resultado esperado: el sistema actualiza la información correctamente.
 */
test('el administrador puede activar/desactivar una cuenta y el sistema actualiza el estado', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-users, [id="nav-users"]').first().click().catch(async () => {
    await page.getByText('Gestión de Usuarios').first().click();
  });

  await expect(page.getByText('Gestión de Usuarios').first()).toBeVisible({ timeout: 10_000 });

  const firstToggle = page.locator('[data-testid^="user-status-toggle-"]').first();
  await expect(firstToggle).toBeVisible({ timeout: 15_000 });
  const before = await firstToggle.isChecked();

  await firstToggle.click();

  // Resultado esperado: el estado del usuario cambió (persistido vía API).
  await expect(firstToggle).toBeChecked({ checked: !before, timeout: 10_000 });
});
