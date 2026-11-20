process.env.ASTRO_TELEMETRY_DISABLED = '1';

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://mrinmoybrh.github.io',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
