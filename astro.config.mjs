import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import UnoCSS from '@unocss/astro';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Read package.json for version info
const pkgPath = fileURLToPath(new URL('package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

export default defineConfig({
  site: 'https://issuevista.vibetensor.com',
  integrations: [UnoCSS({ injectReset: true }), svelte()],
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __APP_NAME__: JSON.stringify(pkg.name)
    }
  }
});
