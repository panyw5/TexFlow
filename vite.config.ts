import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 500,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      input: path.resolve(__dirname, 'src/renderer/index.html'),
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'monaco-core': ['monaco-editor/esm/vs/editor/editor.api'],
          'katex-core': ['katex']
        },
        entryFileNames: '[name].[hash:8].js',
        chunkFileNames: '[name].[hash:8].js',
        assetFileNames: '[name].[hash:8].[ext]'
      }
    },
    // CSS 优化配置
    cssCodeSplit: false,
    cssMinify: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/renderer/components'),
      '@/services': path.resolve(__dirname, 'src/renderer/services'),
      '@/utils': path.resolve(__dirname, 'src/renderer/utils'),
      '@/types': path.resolve(__dirname, 'src/renderer/types'),
    },
  },
  server: {
    port: 3000,
    host: 'localhost',
    strictPort: true,
  },
  optimizeDeps: {
    // 预构建优化
    include: ['react', 'react-dom', 'katex'],
    exclude: ['monaco-editor']
  }
});
