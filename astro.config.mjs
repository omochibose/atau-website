import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://atau.co.jp',
  vite: {
    plugins: [tailwindcss()],
  },
});
