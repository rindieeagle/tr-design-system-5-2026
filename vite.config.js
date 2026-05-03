import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    // Bundled JS/CSS go to dist/_bundle/ to avoid colliding with the user-owned
    // dist/assets/ folder that ships from public/assets/ (logos, hero images).
    assetsDir: '_bundle',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        magneticButton: resolve(__dirname, 'magnetic-button.html'),
        mobileShowcase: resolve(__dirname, 'mobile-showcase.html'),
      },
    },
  },
});
