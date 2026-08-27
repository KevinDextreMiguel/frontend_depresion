/**
 * Datos de prueba centralizados para los E2E de Playwright.
 * Todo viene de variables de entorno (.env.test) con defaults de desarrollo
 * local — nunca credenciales reales. No importar esto desde código de la app.
 */

export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

export interface TestUser {
  email: string;
  password: string;
  nombre: string;
}

export interface TestStudent extends TestUser {
  edad: number;
}

export const TEST_STUDENT: TestStudent = {
  email: process.env.TEST_STUDENT_EMAIL || 'e2e.estudiante@mindcheck-e2e-tests.com',
  password: process.env.TEST_STUDENT_PASSWORD || 'TestE2E123!',
  nombre: process.env.TEST_STUDENT_NOMBRE || 'Estudiante E2E',
  edad: Number(process.env.TEST_STUDENT_EDAD || 21),
};

export const TEST_PSICOLOGO: TestUser = {
  email: process.env.TEST_PSICOLOGO_EMAIL || 'e2e.psicologo@mindcheck-e2e-tests.com',
  password: process.env.TEST_PSICOLOGO_PASSWORD || 'TestE2E123!',
  nombre: process.env.TEST_PSICOLOGO_NOMBRE || 'Psicólogo E2E',
};

export const TEST_ADMIN: TestUser = {
  email: process.env.TEST_ADMIN_EMAIL || 'e2e.admin@mindcheck-e2e-tests.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'TestE2E123!',
  nombre: process.env.TEST_ADMIN_NOMBRE || 'Admin E2E',
};

// Debe coincidir con ADMIN_SIGNUP_CODE configurado en backend/.env (ver T-003
// en AUDITORIA_TRAZABILIDAD_HU.md). Sin esto, el setup de psicólogo/admin falla.
export const ADMIN_SIGNUP_CODE = process.env.TEST_ADMIN_SIGNUP_CODE || '';

/**
 * Genera un correo único por ejecución (no hardcodeado) para criterios que
 * exigen una cuenta que NO exista todavía (ej. HU0001-CA1 "registro exitoso").
 * Determinista en su forma (mismo prefijo, mismo dominio de prueba), único en
 * su valor — así cada corrida es reproducible sin colisionar con la anterior.
 */
export function uniqueTestEmail(label: string): string {
  return `e2e.${label}.${Date.now()}.${Math.floor(Math.random() * 1000)}@mindcheck-e2e-tests.com`;
}

// Cuenta fija reservada para probar "correo ya registrado" (HU0001-CA2): el
// spec correspondiente se asegura de que exista (helper ensureStudentSession)
// antes de reintentar registrarla desde la UI.
export const EXISTING_STUDENT: TestStudent = {
  email: process.env.TEST_EXISTING_STUDENT_EMAIL || 'e2e.ya-registrado@mindcheck-e2e-tests.com',
  password: process.env.TEST_EXISTING_STUDENT_PASSWORD || 'TestE2E123!',
  nombre: 'Estudiante Ya Registrado E2E',
  edad: 22,
};

export const AUTH_STATE_DIR = 'playwright/.auth';
export const AUTH_STATES = {
  estudiante: `${AUTH_STATE_DIR}/estudiante.json`,
  psicologo: `${AUTH_STATE_DIR}/psicologo.json`,
  admin: `${AUTH_STATE_DIR}/admin.json`,
} as const;
