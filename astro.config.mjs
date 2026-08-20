import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import matter from 'gray-matter';

const blogDir = fileURLToPath(new URL('./src/content/blog', import.meta.url));
const lastmodBySlug = new Map(
  readdirSync(blogDir)
    .filter(name => name.endsWith('.md') || name.endsWith('.mdx'))
    .map(name => {
      const slug = name.replace(/\.mdx?$/, '');
      const { data } = matter.read(`${blogDir}/${name}`);
      return [slug, new Date(data.pubDate)];
    })
);

export default defineConfig({
  site: 'https://atau-dd.com',
  integrations: [
    sitemap({
      serialize(item) {
        const match = item.url.match(/\/blog\/([^/]+)\/?$/);
        const lastmod = match && lastmodBySlug.get(match[1]);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
