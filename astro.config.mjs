// @ts-check
import { defineConfig,fontProviders } from 'astro/config';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  fonts: [{
    provider: fontProviders.local(),
    name: "EagleBold",
    cssVariable: "--font-eagle-bold",
    fallbacks: ["sans-serif"],
    options: {
      variants: [{
        src: ['./src/assets/fonts/EagleBold.ttf'],
        weight: 'normal',
        style: 'normal'
      }]
    }
  },
  {
    provider: fontProviders.local(),
    name: "NotoSans",
    cssVariable: "--font-noto-sans",
    fallbacks: ["sans-serif"],
    options: {
      variants: [{
        src: ['./src/assets/fonts/NotoSans-VariableFont_wdth,wght.ttf'],
        weight: 'normal',
        style: 'normal'
      }]
    }
  }]
});
