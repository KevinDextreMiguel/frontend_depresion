import { test, expect } from '@playwright/test';
import { ensureStaffSession } from '../../../helpers/auth';
import { TEST_PSICOLOGO, ADMIN_SIGNUP_CODE, uniqueTestEmail } from '../../../fixtures/test-data';

/**
 * HU0015 — Configurar respuestas predeterminadas del chatbot
 * CA4 — Validación de cambios
 * Contexto: se guarda una configuración de respuesta del chatbot.
 * Evento: se confirma la actualización.
 * Resultado esperado: el sistema aplica los cambios al chatbot de forma
 * inmediata (sin necesidad de un despliegue o reinicio).
 *
 * Este spec no depende de storageState de ningún rol: crea la respuesta vía
 * API autenticada como psicólogo y luego verifica, desde un contexto de
 * navegador anónimo (pantalla pública de Soporte), que el chatbot ya
 * responde con el nuevo texto configurado.
 */
test('una respuesta guardada por el psicólogo se refleja de inmediato en el chatbot', async ({ browser, request }) => {
  test.setTimeout(60_000);
  const session = await ensureStaffSession(
    request,
    { ...TEST_PSICOLOGO, email: uniqueTestEmail('hu0015-ca04-psi') },
    'psicologo',
    ADMIN_SIGNUP_CODE
  );

  const clave = `clave_ca04_${Date.now()}`;
  const texto = `Respuesta inmediata de prueba ${Date.now()}`;

  const createRes = await request.post('/api/chatbot/responses', {
    headers: { Authorization: `Bearer ${session.access_token}` },
    data: { clave, texto, categoria: 'Pruebas E2E', activa: true },
  });
  expect(createRes.ok()).toBeTruthy();

  // Contexto anónimo (nuevo, sin el storageState de psicólogo del proyecto):
  // la pantalla de Soporte es pública y no requiere sesión.
  const anonContext = await browser.newContext();
  const page = await anonContext.newPage();
  await page.goto('/');
  await page.getByText('Soporte', { exact: true }).click();

  const chatInput = page.getByPlaceholder('Escribe tu pregunta aquí...');
  await expect(chatInput).toBeVisible({ timeout: 10_000 });
  await chatInput.fill(clave);
  await chatInput.press('Enter');

  await expect(page.getByText(texto)).toBeVisible({ timeout: 10_000 });
  await anonContext.close();
});
