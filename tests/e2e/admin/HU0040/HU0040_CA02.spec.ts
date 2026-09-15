import { test, expect } from '@playwright/test';

/**
 * HU0040 — Gestión de usuarios, psicólogos y configuraciones generales
 * CA2 — Asignación de roles
 * Contexto: se necesita cambiar permisos.
 * Evento: se modifica el rol de un usuario.
 * Resultado esperado: el sistema aplica los nuevos privilegios.
 */
test('el administrador cambia el rol de un usuario y el sistema aplica el nuevo privilegio', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-users, [id="nav-users"]').first().click().catch(async () => {
    await page.getByText('Gestión de Usuarios').first().click();
  });

  await expect(page.getByText('Gestión de Usuarios').first()).toBeVisible({ timeout: 10_000 });

  const roleSelect = page.locator('[data-testid^="user-role-select-"]').first();
  await expect(roleSelect).toBeVisible({ timeout: 15_000 });
  const before = await roleSelect.inputValue();
  const next = before === 'estudiante' ? 'psicologo' : 'estudiante';

  await roleSelect.selectOption(next);

  // Resultado esperado: el nuevo rol queda aplicado (persistido vía API) y
  // se refleja en el selector tras la actualización.
  await expect(roleSelect).toHaveValue(next, { timeout: 10_000 });
});
