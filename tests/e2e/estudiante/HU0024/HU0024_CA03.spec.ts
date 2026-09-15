import { test, expect } from '@playwright/test';

/**
 * HU0024 — Panel con pacientes asignados
 * CA3 — Acceso seguro al panel
 * Contexto: el usuario no tiene rol de psicólogo.
 * Evento: intenta acceder.
 * Resultado esperado: el sistema restringe el acceso.
 *
 * Corre en el proyecto "estudiante" (sesión de estudiante ya autenticada).
 * La UI no ofrece ningún enlace "Portal Admin" / "Pacientes Asignados" a un
 * estudiante, y el backend protege "/api/admin/assigned-patients" con
 * require_role(["admin", "psicologo"]) — un estudiante que llame el endpoint
 * directamente recibe 403.
 */
test('un estudiante no ve el acceso al panel clínico y el backend rechaza la llamada directa', async ({ page, request }) => {
  await page.goto('/');
  await page.reload();

  await expect(page.getByText('Portal Admin')).toHaveCount(0);

  const stored = await page.evaluate(() => localStorage.getItem('mindcheck_access_token'));
  const response = await request.get('/api/admin/assigned-patients', {
    headers: stored ? { Authorization: `Bearer ${stored}` } : {},
  });
  expect(response.status()).toBe(403);
});
