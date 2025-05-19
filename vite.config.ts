import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: '::',
      port: 8080,
    },
    plugins: [
      react(), // ✅ Removed invalid swc plugin reference
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
    },
    define: {
      global: 'globalThis',
      'process.env': env,
    },
    assetsInclude: ['**/*.svg'],
    optimizeDeps: {
      include: ['leaflet', 'react-leaflet', 'react', 'react-dom'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    build: {
      rollupOptions: {
        external: ['buffer'],
      },
    },
  };
});
