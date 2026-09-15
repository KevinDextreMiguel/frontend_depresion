import { test, expect } from '@playwright/test';

/**
 * HU0007 — Responder el PHQ-9 desde cualquier dispositivo
 * CA2 — Diseño responsive
 * Contexto: el usuario utiliza un celular o tablet.
 * Evento: visualiza el cuestionario.
 * Resultado esperado: el contenido se ajusta correctamente al tamaño de la
 * pantalla.
 */
test.describe('el contenido del cuestionario se ajusta a distintos tamaños de pantalla', () => {
  const viewports: Array<{ name: string; width: number; height: number }> = [
    { name: 'celular', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'escritorio', width: 1440, height: 900 },
  ];

  for (const viewport of viewports) {
    test(`el cuestionario no genera scroll horizontal en ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.getByText('Nueva Evaluación').first().click();
      await expect(page.getByTestId('evaluation-instructions')).toBeVisible({ timeout: 10_000 });

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 5);
    });
  }
});
