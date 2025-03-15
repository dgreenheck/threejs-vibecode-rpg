import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  base: process.env.NODE_ENV === 'production' ? '/threejs-vibecode-rpg/' : '/',
  build: {
    outDir: 'docs',
  },
  server: {
    host: true
  }
});