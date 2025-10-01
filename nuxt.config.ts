export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  modules: ['@nuxt/eslint', 'vuetify-nuxt-module', 'nuxt-auth-utils'],
  runtimeConfig: {
    // Server-side environment variables
    authSecret: process.env.NUXT_AUTH_SECRET,
    strapiUrl: process.env.NUXT_STRAPI_URL || 'http://localhost:1337',

    // Public environment variables (exposed to client)
    public: {
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
    },
  },
})
