import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Optional plugins - only load if available
let visualizer: any;
let compression: any;

try {
  visualizer = require('rollup-plugin-visualizer').visualizer;
} catch (e) {
  console.log('rollup-plugin-visualizer not installed, skipping bundle analysis');
}

try {
  compression = require('vite-plugin-compression2').compression;
} catch (e) {
  console.log('vite-plugin-compression2 not installed, skipping compression');
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression (if available)
    compression && compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression (if available)
    compression && compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Bundle analyzer (only in analyze mode and if available)
    process.env.ANALYZE && visualizer && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React dependencies
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          
          // Firebase SDK
          if (id.includes('node_modules/firebase/') ||
              id.includes('node_modules/@firebase/')) {
            return 'firebase-vendor';
          }
          
          // UI libraries
          if (id.includes('node_modules/@headlessui/') ||
              id.includes('node_modules/@heroicons/') ||
              id.includes('node_modules/framer-motion/')) {
            return 'ui-vendor';
          }
          
          // Chart.js and data visualization
          if (id.includes('node_modules/chart.js/') ||
              id.includes('node_modules/react-chartjs-2/')) {
            return 'charts-vendor';
          }
          
          // Form and validation libraries
          if (id.includes('node_modules/react-hook-form/') ||
              id.includes('node_modules/@hookform/') ||
              id.includes('node_modules/yup/')) {
            return 'forms-vendor';
          }
          
          // State management and data fetching
          if (id.includes('node_modules/@tanstack/') ||
              id.includes('node_modules/zustand/')) {
            return 'state-vendor';
          }
          
          // Utilities
          if (id.includes('node_modules/date-fns/') ||
              id.includes('node_modules/lodash/') ||
              id.includes('node_modules/clsx/')) {
            return 'utils-vendor';
          }
        },
        // Optimize asset names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
});