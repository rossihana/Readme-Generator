import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // Diperlukan agar SSE stream tidak di-buffer oleh Vite proxy
            configure: (proxy) => {
              proxy.on('proxyRes', (proxyRes) => {
                proxyRes.headers['cache-control'] = 'no-cache';
              });
            },
          },
        },
      },
      plugins: [react()],
      define: {
        },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});


