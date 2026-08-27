import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AUTH_STATES, BASE_URL } from './tests/fixtures/test-data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * Infraestructura E2E de MindCheck. Ver tests/README.md para la estructura
 * de carpetas y cómo correr las pruebas.
 *
 * Diseño de proyectos:
 * - "setup": autentica (vía API, ver tests/setup/auth.setup.ts) a los 3 roles
 *   del sistema (estudiante, psicólogo, admin) y guarda su storageState.
 * - "public": flujos sin sesión — landing, registro, login, cuestionario
 *   anónimo (HU0001-0004, HU0007-0012, HU0034).
 * - "estudiante" / "psicologo" / "admin": ya autenticados, para las historias
 *   que requieren sesión de ese rol específico.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'public',
      testDir: './tests/e2e/public',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'estudiante',
      testDir: './tests/e2e/estudiante',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STATES.estudiante },
      dependencies: ['setup'],
    },
    {
      name: 'psicologo',
      testDir: './tests/e2e/psicologo',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STATES.psicologo },
      dependencies: ['setup'],
    },
    {
      name: 'admin',
      testDir: './tests/e2e/admin',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STATES.admin },
      dependencies: ['setup'],
    },

    /* Cross-browser opcional: descomentar cuando la suite esté estable en
       chromium. Correr los 3 roles + public en 3 motores triplica el tiempo. */
    // {
    //   name: 'firefox-public',
    //   testDir: './tests/e2e/public',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit-public',
    //   testDir: './tests/e2e/public',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Local: levanta el frontend automáticamente si no está corriendo ya.
     El BACKEND (FastAPI) no se levanta desde aquí: depende de Supabase/BD y
     no es seguro auto-arrancarlo sin que el usuario confirme credenciales —
     debe estar corriendo aparte (ver backend/run_backend.ps1) antes de
     `npm run test:e2e`.
     CI: PLAYWRIGHT_BASE_URL apunta a un ambiente de staging ya desplegado
     (frontend + backend); no tiene sentido levantar `npm run dev` ahí. */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
