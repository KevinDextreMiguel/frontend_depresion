import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  // Carga VITE_API_URL desde .env/.env.local (y .env.test en modo test) para
  // que el proxy del dev server apunte al MISMO backend que usa la app vía
  // fetch(). Antes el target estaba fijo a :8000: si el backend corría en
  // otro puerto (p.ej. :8020/:8030, como indica VITE_API_URL), las llamadas
  // relativas a /api hechas por Playwright (request.delete/get/post) se
  // proxyaban silenciosamente al puerto equivocado (o a nada), dejando
  // progreso/estado del cuestionario sin limpiar entre tests y provocando
  // fallas en cascada que parecían bugs de flujo de UI.
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/make-server-d427d5bf': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  };
})
