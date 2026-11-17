import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-math': ['three'],
          'r3f-core': ['@react-three/fiber'],
          'drei-core': ['@react-three/drei'],
          'motion-core': ['gsap', 'lenis', 'framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
