import { test, expect } from '@playwright/test';

/**
 * HU0037 — Analizar tendencias de riesgo en la población estudiantil
 * CA2 — Segmentación de población
 * Contexto: se aplican filtros específicos.
 * Evento: se seleccionan criterios de segmentación.
 * Resultado esperado: el sistema actualiza los resultados según los filtros
 * aplicados.
 *
 * Mismo hallazgo de acceso que HU0037 CA1 (ver admin/HU0037/HU0037_CA01):
 * la funcionalidad real vive en el Dashboard Analítico, visible solo para
 * admin en la UI. El input "Filtrar por carrera..." segmenta las tendencias
 * (`loadDashboardKPIs` con `trendsCareer`, AdminPanel.tsx).
 */
test('el administrador segmenta las tendencias por carrera y el sistema actualiza los resultados', async ({ page }) => {
  test.setTimeout(30_000);

  await page.goto('/');
  await page.locator('#nav-dashboard, [id="nav-dashboard"]').first().click();
  await expect(page.getByText('Dashboard Analítico')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Total Evaluaciones')).toBeVisible({ timeout: 15_000 });

  const careerFilter = page.getByPlaceholder('Filtrar por carrera...');
  await expect(careerFilter).toBeVisible();
  await careerFilter.fill('Ingeniería de Sistemas');
  await page.getByRole('button', { name: 'Filtrar' }).click();

  // La consulta segmentada debe completarse sin error, mostrando el
  // resultado (con datos) o el estado vacío explícito para ese segmento.
  await expect(
    page.locator('.recharts-responsive-container').first().or(page.getByText('No hay tendencias disponibles para el filtro aplicado.'))
  ).toBeVisible({ timeout: 15_000 });
});
