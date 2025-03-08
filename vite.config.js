import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/haztartas-frontend/',  // Ensure this is the correct base path for GitHub Pages deployment
  plugins: [react()],
});
