import { defineStore } from 'pinia'
import { useNuxtApp, useCookie } from '#app'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    current: 'light' as 'light' | 'dark',
  }),

  actions: {
    setTheme(theme: 'light' | 'dark') {
      this.current = theme

      const cookie = useCookie<'light' | 'dark'>('theme', { path: '/', maxAge: 60 * 60 * 24 * 365 })
      cookie.value = theme

      const { $vuetify } = useNuxtApp()
      if ($vuetify?.theme?.global?.name) {
        $vuetify.theme.change(theme)
      }
    },

    toggle() {
      this.setTheme(this.current === 'light' ? 'dark' : 'light')
    },

    init() {
      const cookie = useCookie<'light' | 'dark'>('theme')
      const preferred =
        import.meta.client && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'

      const theme = cookie.value || preferred
      this.setTheme(theme)
    },
  },
})
