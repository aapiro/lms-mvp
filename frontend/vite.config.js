import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

// El código heredado de CRA usa JSX dentro de archivos .js; este plugin lo
// transforma en dev, build y vitest sin renombrar todo a .jsx.
const jsxInJs = {
  name: 'treat-js-files-as-jsx',
  async transform(code, id) {
    if (!/src\/.*\.js$/.test(id)) return null;
    return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
  },
};

export default defineConfig({
  plugins: [jsxInJs, react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    // PORT=80 en docker-compose.override.yml; 3000 en local
    port: Number(process.env.PORT) || 3000,
    host: true,
    proxy: {
      // Equivalente al antiguo setupProxy.js: proxea TODO /api (iframes,
      // videos y PDFs incluidos). En docker el backend es http://backend:8080.
      '/api': {
        target: process.env.PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    // nginx (Dockerfile) copia desde build/, como hacía CRA
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
