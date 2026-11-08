/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration Vite + Vitest.
// - L'alias "@" pointe vers /src (chemin relatif à la racine du projet).
// - "base" : chemins relatifs par défaut (le build fonctionne depuis n'importe quel
//   sous-dossier) ; le déploiement GitHub Pages fournit BASE_PATH=/passerelle-anglais/.
export default defineConfig({
  base: process.env.BASE_PATH || './',
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    testTimeout: 30000,
  },
});
