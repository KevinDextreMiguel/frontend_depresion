import { test, expect } from '@playwright/test';

/**
 * HU0005 — Gestión de roles y permisos
 * CA3 — Acceso restringido
 * Contexto: un usuario no tiene permisos suficientes.
 * Evento: intenta acceder a un módulo restringido.
 * Resultado esperado: el sistema deniega el acceso y muestra una alerta.
 *
 * El módulo de gestión de usuarios (`/api/admin/users`) requiere
 * específicamente el rol "admin" — un psicólogo autenticado (rol con más
 * privilegios que un estudiante, pero sin acceso a este módulo) también debe
 * ser rechazado. Se verifica a nivel de API porque es ahí donde el control de
 * acceso real se aplica (`require_role(["admin"])` en
 * backend/app/routers/admin.py); el frontend refleja este error mostrando la
 * alerta "Acceso restringido: el sistema deniega el acceso por permisos
 * insuficientes..." (ver AdminPanel.tsx `loadUsersData`).
 *
 * Corre en el proyecto "psicologo" (storageState de un usuario SIN permisos
 * de administrador para este módulo específico).
 */
test('un usuario sin permisos de administrador recibe acceso denegado (403) al módulo restringido de usuarios', async ({ page }) => {
  const response = await page.request.get('/api/admin/users');
  expect(response.status()).toBe(403);
});
