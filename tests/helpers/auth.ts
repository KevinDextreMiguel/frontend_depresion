import type { APIRequestContext } from '@playwright/test';
import type { TestStudent, TestUser } from '../fixtures/test-data';

/**
 * Helpers de autenticación vía API (no UI) para bootstrap de estado de sesión.
 * Se usan SOLO en tests/setup/*.setup.ts para preparar storageState por rol;
 * los specs de negocio no deberían llamarlos directamente — si una historia
 * de usuario es justamente "iniciar sesión", esa se prueba por UI en su
 * propio spec, no reutilizando este helper.
 */

export interface AuthUser {
  id: string;
  email: string;
  nombre?: string;
  foto_perfil?: string | null;
  rol: string;
  estudiante?: Record<string, unknown>;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

async function loginApi(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<AuthSession | null> {
  const res = await request.post('/api/auth/login', {
    data: { email, password },
  });
  if (!res.ok()) return null;
  return res.json();
}

/**
 * Registra (si no existe) e inicia sesión como estudiante. Idempotente: si la
 * cuenta ya existe, el signup falla con 400 y se hace login directo.
 */
export async function ensureStudentSession(
  request: APIRequestContext,
  student: TestStudent
): Promise<AuthSession> {
  const existing = await loginApi(request, student.email, student.password);
  if (existing) return existing;

  const signupRes = await request.post('/api/auth/signup-student', {
    data: {
      email: student.email,
      password: student.password,
      nombre: student.nombre,
      edad: student.edad,
    },
  });

  if (signupRes.ok()) {
    return signupRes.json();
  }

  // Puede haber quedado creada por una corrida previa que falló a medio camino.
  const retry = await loginApi(request, student.email, student.password);
  if (retry) return retry;

  throw new Error(
    `No se pudo preparar la sesión de estudiante de prueba (${student.email}): ` +
      `signup respondió ${signupRes.status()} y el login posterior también falló.`
  );
}

/**
 * Registra (si no existe) e inicia sesión como psicólogo o admin. Requiere
 * ADMIN_SIGNUP_CODE (ver tests/fixtures/test-data.ts) para el primer registro.
 */
export async function ensureStaffSession(
  request: APIRequestContext,
  user: TestUser,
  rol: 'psicologo' | 'admin',
  adminInviteCode: string
): Promise<AuthSession> {
  const existing = await loginApi(request, user.email, user.password);
  if (existing) return existing;

  const signupRes = await request.post('/api/auth/signup', {
    data: {
      email: user.email,
      password: user.password,
      nombre: user.nombre,
      rol,
      admin_invite_code: adminInviteCode,
    },
  });

  if (signupRes.ok()) {
    const login = await loginApi(request, user.email, user.password);
    if (login) return login;
  }

  const retry = await loginApi(request, user.email, user.password);
  if (retry) return retry;

  throw new Error(
    `No se pudo preparar la sesión de ${rol} de prueba (${user.email}): ` +
      `signup respondió ${signupRes.status()} (¿TEST_ADMIN_SIGNUP_CODE configurado y ` +
      `coincide con ADMIN_SIGNUP_CODE del backend?) y el login posterior también falló.`
  );
}
