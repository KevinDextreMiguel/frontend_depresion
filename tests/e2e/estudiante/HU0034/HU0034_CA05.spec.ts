import { test, expect } from '@playwright/test';

/**
 * HU0034 — Consentimiento informado específico para salud mental (Ley N.° 29733)
 * CA5 — Consulta de consentimiento otorgado
 * Contexto: el estudiante requiere revisar las condiciones aceptadas.
 * Evento: accede a la sección de privacidad y consentimiento.
 * Resultado esperado: el sistema muestra el historial y detalle del
 * consentimiento registrado.
 *
 * Corre en el proyecto "estudiante" (storageState ya autenticado, cuenta
 * compartida que ya completó al menos una evaluación en otros specs y por lo
 * tanto tiene consentimiento registrado).
 */
test('el estudiante puede consultar el historial y detalle de su consentimiento registrado', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacidad', exact: true }).first().click();

  await expect(page.getByText('Privacidad y Consentimiento').first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Tratamiento de Datos Personales (Ley N.° 29733)')).toBeVisible();

  // Resultado esperado: se muestra el detalle de al menos una evidencia de
  // consentimiento (versión, fecha de aceptación, IP e identificador del
  // documento aceptado).
  await expect(page.getByText(/Consentimiento Salud Mental/).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/F\. Aceptación:/).first()).toBeVisible();
  await expect(page.getByText(/IP Origen:/).first()).toBeVisible();
});
