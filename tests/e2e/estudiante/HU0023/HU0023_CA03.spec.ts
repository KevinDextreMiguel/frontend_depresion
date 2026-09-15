import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession } from '../../../helpers/auth';
import { completeQuestionnaire } from '../../../helpers/questionnaire';

/**
 * HU0023 — Evolución del estudiante en el tiempo
 * CA3 — Interpretación de tendencia
 * Contexto: se identifica una tendencia.
 * Evento: se analiza la evolución.
 * Resultado esperado: el sistema resalta mejoras, estabilidad o deterioro.
 *
 * StudentEvolution.tsx calcula `trend = latestPoint.puntaje - firstPoint.puntaje`
 * y muestra "Mejorando" (tendencia negativa), "Aumentando" (positiva) o
 * "Estable" (sin cambio). Se usa una cuenta nueva y aislada: primera
 * evaluación con puntaje alto y segunda con puntaje más bajo, para forzar
 * una tendencia de "Mejorando".
 */
test('el estudiante ve resaltada la tendencia de mejora entre su primera y su evaluación más reciente', async ({ page, request }) => {
  test.setTimeout(120_000);

  const student = {
    email: uniqueTestEmail('hu0023-ca03'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Tendencia CA03',
    edad: 20,
  };
  const session = await ensureStudentSession(request, student);
  await page.goto('/');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('mindcheck_access_token', token);
      localStorage.setItem('mindcheck_user', JSON.stringify(user));
    },
    { token: session.access_token, user: session.user }
  );
  await page.reload();

  // Primera evaluación: puntaje alto.
  await completeQuestionnaire(page, { phq9DefaultLabel: 'Casi siempre', phq9Item9Label: 'Nunca' }, request);
  await expect(page.getByText('Puntaje: 16/27')).toBeVisible({ timeout: 15_000 });

  // Segunda evaluación (más reciente): puntaje bajo -> tendencia de mejora.
  await completeQuestionnaire(page, { phq9DefaultLabel: 'Nunca', phq9Item9Label: 'Nunca' }, request);
  await expect(page.getByText('Puntaje: 0/27')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Ver mi evolución' }).click();
  await expect(page.getByRole('heading', { name: 'Mi Evolución' })).toBeVisible({ timeout: 15_000 });

  await expect(page.getByText('Tendencia')).toBeVisible();
  await expect(page.getByText('Mejorando')).toBeVisible({ timeout: 10_000 });
});
