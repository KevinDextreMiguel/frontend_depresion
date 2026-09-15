import { test, expect } from '@playwright/test';

/**
 * HU0044 — Auditorías del modelo predictivo de Machine Learning
 * CA3 — Consulta de auditoría del modelo
 * Contexto: un administrador requiere revisar eventos del modelo.
 * Evento: accede al historial de auditoría ML.
 * Resultado esperado: el sistema muestra registros filtrables de
 * entrenamientos, versiones y predicciones realizadas.
 *
 * `GET /api/admin-ext/ml/audit` soporta filtros por `tipo_evento`,
 * `model_version` y rango de fechas (backend/app/routers/extended_features.py).
 * El panel "Auditoría ML & Métricas" no expone controles de filtro en la UI
 * todavía, así que se confirma la capacidad de filtrado directamente contra
 * la API (adjuntando el token de la sesión admin) además de la vista del
 * historial completo en el panel.
 */
test('el administrador consulta el historial filtrable de auditoría del modelo (entrenamientos y predicciones)', async ({ page, request }) => {
  test.setTimeout(30_000);

  await page.goto('/');
  await page.reload();
  await page.locator('#nav-mlaudit, [id="nav-mlaudit"]').first().click();
  await expect(page.getByText('Auditoría ML & Métricas')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Registro de Auditoría (Reentrenamientos)')).toBeVisible({ timeout: 15_000 });

  const token = await page.evaluate(() => localStorage.getItem('mindcheck_access_token'));
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const allEvents = await request.get('/api/admin-ext/ml/audit', { headers });
  expect(allEvents.ok()).toBeTruthy();

  const onlyEntrenamiento = await request.get('/api/admin-ext/ml/audit?tipo_evento=entrenamiento', { headers });
  expect(onlyEntrenamiento.ok()).toBeTruthy();
  const entrenamientoItems = await onlyEntrenamiento.json();
  expect(Array.isArray(entrenamientoItems)).toBeTruthy();
  expect(entrenamientoItems.every((i: any) => i.tipo_evento === 'entrenamiento')).toBeTruthy();

  const onlyPrediccion = await request.get('/api/admin-ext/ml/audit?tipo_evento=prediccion', { headers });
  expect(onlyPrediccion.ok()).toBeTruthy();
  const prediccionItems = await onlyPrediccion.json();
  expect(Array.isArray(prediccionItems)).toBeTruthy();
  expect(prediccionItems.every((i: any) => i.tipo_evento === 'prediccion')).toBeTruthy();
});
