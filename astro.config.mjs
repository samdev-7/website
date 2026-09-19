// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import svelte from '@astrojs/svelte';

import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://samliu.dev',

  vite: {
    plugins: [tailwindcss()]
  },

  markdown: {
    smartypants: false,
    shikiConfig: { theme: 'github-light' }
  },

  adapter: vercel(),

  redirects: {
    '/about': '/#about',
    '/contact': '/#contact',
    '/blog': '/notes/',
    '/blog/[...slug]': '/notes/[...slug]'
  },

  integrations: [
    svelte(),
    sitemap({ filter: (page) => !/\/(404|500)\/?$/.test(page) })
  ]
});