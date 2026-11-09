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
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Découpage pour le cache navigateur : bibliothèques, contenus avancés
        // (B2 → C2) et contenus de base changent à des rythmes différents.
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('/src/content/advanced/') || id.includes('/src/content/lessons/') || id.includes('vocabulary-advanced')) return 'content-advanced';
          if (id.includes('/src/content/')) return 'content';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'worker/test/**/*.test.ts'],
    restoreMocks: true,
    testTimeout: 30000,
  },
});
