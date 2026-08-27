import { test } from '@playwright/test';

/**
 * HU0003 — Recuperación de contraseña
 * CA3 — Enlace válido
 * Contexto: el usuario ingresa desde el enlace recibido.
 * Evento: ingresa una nueva contraseña.
 * Resultado esperado: el sistema actualiza la contraseña exitosamente.
 *
 * NO EJECUTADO — categoría API/infraestructura, no Playwright puro (ver
 * docs/e2e-fase3-plan-piloto.md, Paso 1). Probar este criterio de punta a
 * punta requiere un token de recuperación REAL, que solo puede obtenerse:
 *   (a) interceptando el correo real (Mailosaur/Ethereal, no configurado), o
 *   (b) llamando a la API admin de Supabase GoTrue directamente con la
 *       service_role key — lo que implicaría exponer esa clave (altamente
 *       privilegiada, bypassa RLS) al entorno de pruebas del frontend.
 * Se decidió NO tomar la opción (b) sin autorización explícita, por ser una
 * decisión de seguridad, no solo de testing. CA4 (enlace inválido/expirado)
 * SÍ se implementó y pasó — cubre la rama de error del mismo endpoint.
 */
test.skip('actualizar la contraseña con un enlace de recuperación válido', () => {
  // Intencionalmente vacío — ver justificación arriba.
});
