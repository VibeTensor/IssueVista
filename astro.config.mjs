import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import UnoCSS from '@unocss/astro';

export default defineConfig({
  integrations: [
    UnoCSS({ injectReset: true }),
    svelte()
  ],
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  }
});
