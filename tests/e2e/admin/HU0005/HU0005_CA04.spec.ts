import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';

/**
 * HU0005 — Gestión de roles y permisos
 * CA4 — Auditoría de cambios
 * Contexto: se modifican roles o permisos.
 * Evento: se guarda la actualización.
 * Resultado esperado: el sistema registra la acción en el historial.
 *
 * El endpoint `PUT /api/admin/users/{id}` (backend/app/routers/admin.py,
 * `update_user`) escribe una fila en `auditoria_acceso` con
 * accion="modificacion_rol_permisos" y el detalle del cambio ("rol: X -> Y")
 * cada vez que se modifica un rol o el estado activo de un usuario. Se
 * verifica cambiando el rol de un estudiante nuevo y aislado, y confirmando
 * que aparece en el módulo de Auditoría del Sistema.
 */
test('modificar el rol de un usuario queda registrado en el historial de auditoría', async ({ page, request }) => {
  test.setTimeout(60_000);

  const student = {
    email: uniqueTestEmail('hu0005-ca04'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Auditoria CA04',
    edad: 22,
  };
  const session = await ensureStudentSession(request, student);
  const userId = session.user.id;

  await page.goto('/');
  await page.getByRole('button', { name: 'Gestión de Usuarios' }).click();

  const roleSelect = page.getByTestId(`user-role-select-${userId}`);
  await expect(roleSelect).toBeVisible({ timeout: 15_000 });
  await roleSelect.selectOption('psicologo');
  await expect(page.getByText(/rol correctamente/i)).toBeVisible({ timeout: 10_000 });

  await page.locator('[data-testid="nav-audit"]').click();
  await expect(page.getByText('Auditoría del Sistema')).toBeVisible({ timeout: 10_000 });

  await page.locator('[data-testid="audit-filter-accion"]').fill('modificacion_rol_permisos');
  await page.locator('[data-testid="audit-filter-apply-btn"]').click();

  const table = page.locator('[data-testid="audit-log-table"]');
  await expect(table).toBeVisible({ timeout: 15_000 });
  await expect(table.getByText('modificacion_rol_permisos').first()).toBeVisible({ timeout: 15_000 });
});
