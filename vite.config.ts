import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/// <reference types="vitest" />

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-slot', '@radix-ui/react-dialog'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/utils/**'],
      thresholds: {
        lines: 80,
        functions: 80,
      },
    },
  },
}));
