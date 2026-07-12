import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  // Point public folder to the root assets folder so all demo images/videos load correctly
  publicDir: resolve(__dirname, '../../../assets'),
  server: {
    port: 5173,
    open: true
  }
});
