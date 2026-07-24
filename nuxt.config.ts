export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  vite: {
    define: {
      __VUE_DEVTOOLS__: false,
      __VUE_DEVTOOLS_GLOBAL_HOOK__: false,
    },
  },
  modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Server-side environment variables
    authSecret: process.env.NUXT_AUTH_SECRET,
    strapiUrl: process.env.NUXT_STRAPI_URL || 'http://localhost:1337',

    // Public environment variables (exposed to client)
    public: {
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  },
})
