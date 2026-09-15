import { test, expect } from '@playwright/test';

/**
 * HU0010 — Instrucciones claras antes de iniciar la evaluación
 * CA3 — Lenguaje comprensible
 * Contexto: el usuario lee las instrucciones.
 * Evento: revisa el contenido.
 * Resultado esperado: el texto se presenta en lenguaje simple y accesible.
 */
test('las instrucciones se presentan en lenguaje simple, en español y sin tecnicismos', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Nueva Evaluación').first().click();

  const instructions = page.getByTestId('evaluation-instructions');
  await expect(instructions).toBeVisible({ timeout: 10_000 });

  const text = (await instructions.innerText()).toLowerCase();
  // Lenguaje simple y directo, sin jerga clínica innecesaria.
  expect(text).toContain('responde con honestidad');
  expect(text).toContain('no hay respuestas correctas ni incorrectas');
  expect(text).not.toMatch(/inventario de depresión de patient health questionnaire/i);
});
