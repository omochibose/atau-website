import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://atau-dd.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
