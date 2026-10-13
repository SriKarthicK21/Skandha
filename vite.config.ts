import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        // `pg` is Node-only, but the browser module graph can reach it because
        // some client workspaces import server services that import
        // server/repositories (for example PolicyRepository). `pg` executes
        // Buffer-dependent code at import time, which threw
        // `ReferenceError: Buffer is not defined` while the entry module was
        // evaluating and left the whole application blank. Aliasing it to a
        // browser-safe stub keeps the page rendering and fails loudly only if
        // something genuinely tries to open a database connection in a browser.
        // The Express server does not use this config, so it keeps the real driver.
        pg: path.resolve(__dirname, 'src/lib/nodeStubs/pg.ts'),
        // Node's `crypto` is externalized by Vite and throws on first property
        // access. Server modules that client workspaces import (for example
        // MASRegulatoryIngestionService, whose singleton is created at module
        // scope) call crypto.randomBytes while the shell renders, which crashed
        // the whole application. The shim keeps secure random generation working
        // through Web Crypto and fails loudly for synchronous hashing, which
        // belongs on the server.
        crypto: path.resolve(__dirname, 'src/lib/nodeStubs/crypto.ts'),
      },
    },
    optimizeDeps: {
      // Never pre-bundle the real Node drivers into the browser graph.
      exclude: ['pg'],
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf') || id.includes('pptxgenjs') || id.includes('html2canvas') || id.includes('docx') || id.includes('pdfjs') || id.includes('canvg')) {
                return 'vendor-docs';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
            }
          }
        }
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/data/**',
          '**/database/**',
          '**/server/**',
          '**/dist/**',
          '**/*.json',
          '**/*.log',
          '**/scripts/**',
          '**/.system_generated/**',
          '**/brain/**',
          '**/*.md',
          '**/evidence_vault/**',
          '**/.git/**'
        ]
      },
    },
  };
});
