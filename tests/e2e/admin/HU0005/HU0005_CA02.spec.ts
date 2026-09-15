import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';

/**
 * HU0005 — Gestión de roles y permisos
 * CA2 — Modificación de permisos
 * Contexto: un rol requiere cambios.
 * Evento: el administrador actualiza permisos.
 * Resultado esperado: el sistema guarda la nueva configuración.
 *
 * NOTA DE TRAZABILIDAD: en MindCheck los permisos del sistema están
 * definidos enteramente por el rol asignado (no existe una matriz de
 * permisos independiente del rol) — por eso este CA se verifica reutilizando
 * el mismo control de "Rol" y confirmando que la nueva configuración persiste
 * tras recargar la página (no solo en el estado local del componente).
 */
test('el administrador modifica la configuración de rol/permisos y el sistema la conserva tras recargar', async ({ page, request }) => {
  const student = {
    email: uniqueTestEmail('hu0005-ca02'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Permisos CA02',
    edad: 24,
  };
  const session = await ensureStudentSession(request, student);
  const userId = session.user.id;

  await page.goto('/');
  await page.getByRole('button', { name: 'Gestión de Usuarios' }).click();

  const roleSelect = page.getByTestId(`user-role-select-${userId}`);
  await expect(roleSelect).toBeVisible({ timeout: 15_000 });
  await roleSelect.selectOption('psicologo');
  await expect(page.getByText(/rol correctamente/i)).toBeVisible({ timeout: 10_000 });

  // Confirmamos que la nueva configuración fue guardada por el sistema
  // (no solo reflejada en el estado local) recargando la página.
  await page.reload();
  await page.getByRole('button', { name: 'Gestión de Usuarios' }).click();
  await expect(page.getByTestId(`user-role-select-${userId}`)).toHaveValue('psicologo', { timeout: 15_000 });
});
