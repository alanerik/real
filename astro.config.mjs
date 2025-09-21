// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import react from '@astrojs/react';
import tina from '@tinacms/cli/dist/cli';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react(), tina()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});