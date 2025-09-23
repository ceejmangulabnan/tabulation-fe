import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    '@nuxt/eslint',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    'nuxt-auth-utils',
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  runtimeConfig: {
    // Server-side environment variables
    authSecret: process.env.NUXT_AUTH_SECRET,
    strapiUrl: process.env.NUXT_STRAPI_URL || 'http://localhost:1337',

    // Public environment variables (exposed to client)
    public: {
      strapiUrl: process.env.NUXT_STRAPI_URL || 'http://localhost:1337',
    },
  },
})
