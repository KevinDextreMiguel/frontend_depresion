import { test } from '@playwright/test';

/**
 * HU0003 — Recuperación de contraseña
 * CA1 — Solicitud enviada
 * Contexto: el correo está registrado.
 * Evento: solicita recuperar contraseña.
 * Resultado esperado: el sistema envía un enlace de recuperación al correo.
 *
 * NO EJECUTADO — categoría API/infraestructura, no Playwright puro.
 * Se intentó con varios dominios de correo de prueba (mindcheck-e2e-tests.com,
 * example.com) y Supabase Auth rechaza el envío real ("Email address ... is
 * invalid") para cualquier dominio sin registros DNS/MX de entrega real — no
 * es un problema de formato (el backend ya validó el formato correctamente
 * antes de llegar a Supabase). Probar este criterio de punta a punta
 * requeriría un dominio real controlado por el equipo o un servicio de email
 * de prueba (Mailosaur/Ethereal), ninguno configurado en esta infraestructura.
 * Ver también HU0003_CA03 (mismo tipo de limitación, para el token en sí).
 */
test.skip('solicitar recuperación con un correo registrado envía el enlace', () => {
  // Intencionalmente vacío — ver justificación arriba.
});
