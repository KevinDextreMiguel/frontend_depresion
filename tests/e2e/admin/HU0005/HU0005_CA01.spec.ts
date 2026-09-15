import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';

/**
 * HU0005 — Gestión de roles y permisos
 * CA1 — Asignación de roles
 * Contexto: existe un usuario registrado.
 * Evento: el administrador asigna un rol.
 * Resultado esperado: el sistema actualiza el rol correctamente.
 *
 * Corre en el proyecto "admin" (storageState del administrador). Se crea un
 * estudiante nuevo y aislado para no interferir con otros specs que dependen
 * del rol de la cuenta de estudiante compartida.
 */
test('el administrador asigna un nuevo rol a un usuario y el sistema lo actualiza', async ({ page, request }) => {
  const student = {
    email: uniqueTestEmail('hu0005-ca01'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Rol CA01',
    edad: 23,
  };
  const session = await ensureStudentSession(request, student);
  const userId = session.user.id;

  await page.goto('/');
  await page.getByRole('button', { name: 'Gestión de Usuarios' }).click();

  const roleSelect = page.getByTestId(`user-role-select-${userId}`);
  await expect(roleSelect).toBeVisible({ timeout: 15_000 });

  await roleSelect.selectOption('psicologo');

  await expect(page.getByText(/rol correctamente/i)).toBeVisible({ timeout: 10_000 });
  await expect(roleSelect).toHaveValue('psicologo');
});
