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
    minify: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/renderer/index.html'),
      output: {
        manualChunks: {
          'monaco-editor': ['monaco-editor'],
          'katex': ['katex'],
          'mathjs': ['mathjs'],
          'html2canvas': ['html2canvas'],
          'react-vendor': ['react', 'react-dom'],
          'lodash': ['lodash.debounce']
        }
      },
      // 优化external配置
      external: (id) => {
        // 排除不必要的Monaco语言模块
        if (id.includes('monaco-editor/esm/vs/basic-languages/') && 
            !id.includes('latex') && 
            !id.includes('typescript') && 
            !id.includes('javascript')) {
          return true;
        }
        // 排除不必要的KaTeX字体
        if (id.includes('katex/dist/fonts/') && 
            (id.includes('.ttf') || id.includes('.woff"'))) {
          return true;
        }
        return false;
      }
    },
    // CSS优化
    cssCodeSplit: true,
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
});
