import { test, expect } from '@playwright/test';
import { uniqueTestEmail } from '../../../fixtures/test-data';
import { ensureStudentSession, ensureStaffSession } from '../../../helpers/auth';
import { ADMIN_SIGNUP_CODE } from '../../../fixtures/test-data';

/**
 * HU0034 — Consentimiento informado específico para salud mental (Ley N.° 29733)
 * CA6 — Actualización de consentimiento por cambios legales
 * Contexto: se actualizan las políticas o términos relacionados con salud
 * mental.
 * Evento: el estudiante vuelve a acceder a la plataforma.
 * Resultado esperado: el sistema solicita nuevamente la aceptación del
 * consentimiento actualizado.
 *
 * `GET /api/admin-ext/consent-status` compara la versión vigente
 * ("consent_version" en Parámetros del Sistema) contra la última versión
 * aceptada por el usuario. Un admin publica una nueva versión de
 * "consent_version"; para un estudiante que aceptó una versión ANTERIOR,
 * `accepted` debe volver a `false` para la nueva versión — lo que dispara
 * nuevamente el modal de consentimiento en el cuestionario.
 */
test('al actualizarse la versión del consentimiento de salud mental, se solicita la aceptación nuevamente', async ({ page, request }) => {
  test.setTimeout(90_000);

  // 1. Estudiante nuevo acepta el consentimiento vigente actual.
  const student = {
    email: uniqueTestEmail('hu0034-ca06'),
    password: 'TestE2E123!',
    nombre: 'Estudiante Actualizacion Consentimiento CA06',
    edad: 22,
  };
  const studentSession = await ensureStudentSession(request, student);

  const statusBefore = await request.get('/api/admin-ext/consent-status', {
    headers: { Authorization: `Bearer ${studentSession.access_token}` },
  });
  expect(statusBefore.ok()).toBeTruthy();
  const { version: versionVigente } = await statusBefore.json();

  const acceptRes = await request.post('/api/admin-ext/consent-accept', {
    headers: { Authorization: `Bearer ${studentSession.access_token}` },
    data: { version: versionVigente },
  });
  expect(acceptRes.ok()).toBeTruthy();

  const statusAfterAccept = await request.get('/api/admin-ext/consent-status', {
    headers: { Authorization: `Bearer ${studentSession.access_token}` },
  });
  expect((await statusAfterAccept.json()).accepted).toBeTruthy();

  // 2. Un admin publica una nueva versión del consentimiento de salud mental.
  const admin = {
    email: uniqueTestEmail('hu0034-ca06-admin'),
    password: 'TestE2E123!',
    nombre: 'Admin Consentimiento CA06',
  };
  const adminSession = await ensureStaffSession(request, admin, 'admin', ADMIN_SIGNUP_CODE);

  const settingsRes = await request.get('/api/admin-ext/settings', {
    headers: { Authorization: `Bearer ${adminSession.access_token}` },
  });
  expect(settingsRes.ok()).toBeTruthy();
  const settings = await settingsRes.json();
  const consentVersionSetting = settings.find((s: any) => s.clave === 'consent_version');
  expect(consentVersionSetting).toBeTruthy();

  const nuevaVersion = `2.${Date.now()}`;
  const updateRes = await request.put(`/api/admin-ext/settings/${consentVersionSetting.id_config}`, {
    headers: { Authorization: `Bearer ${adminSession.access_token}` },
    data: { valor: nuevaVersion },
  });
  expect(updateRes.ok()).toBeTruthy();

  // 3. El estudiante vuelve a acceder: el sistema debe solicitar nuevamente
  // la aceptación del consentimiento (accepted=false para la nueva versión).
  const statusAfterUpdate = await request.get('/api/admin-ext/consent-status', {
    headers: { Authorization: `Bearer ${studentSession.access_token}` },
  });
  expect(statusAfterUpdate.ok()).toBeTruthy();
  const finalStatus = await statusAfterUpdate.json();
  expect(finalStatus.version).toBe(nuevaVersion);
  expect(finalStatus.accepted).toBe(false);
});
