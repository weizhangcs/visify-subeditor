export default defineNuxtConfig({
  compatibilityDate: '2024-11-03',
  runtimeConfig: {
    deepLApiKey: process.env.DEEPL_API_KEY,
    deepLApiUrl: process.env.DEEPL_API_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiApiUrl: process.env.OPENAI_API_URL,
  },
  app: {
    head: {
      charset: 'utf-16',
      viewport: 'width=device-width,initial-scale=1',
      title: 'Aimu - Online Subtitle Editor',
      htmlAttrs: {
        lang: 'en',
        class: 'dark overflow-hidden',
      },
      meta: [
        {
          name: 'theme-color',
          content: '#0e0e0e',
        },
      ],
      link: [
        {
          rel: 'icon',
          href: '/favicon.ico',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
      ],
    },
  },
  build: {
    transpile: ['@popperjs/core'],
  },
  imports: { dirs: ['stores'] },
  css: [
    '~/assets/styles/element-plus.scss',
    '~/assets/fontawesome/css/solid.css',
    '~/assets/fontawesome/css/fontawesome.css',
    'element-plus/theme-chalk/dark/css-vars.css',
    '@simonwep/pickr/dist/themes/monolith.min.css',
    'vue-virtual-scroller/dist/vue-virtual-scroller.css',
  ],
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/device',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@vite-pwa/nuxt',
    '@element-plus/nuxt',
  ],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
  },
  i18n: {
    vueI18n: './i18n.config.ts',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Aimu',
      short_name: 'Aimu',
      theme_color: '#0e0e0e',
      background_color: '#161633',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
  nitro: {
    routeRules: {
      '/': {
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        },
      },
      '/ffmpeg': {
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        },
      },
    },
  },
});
