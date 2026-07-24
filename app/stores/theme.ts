import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    current: 'light' as 'light' | 'dark',
  }),

  actions: {
    setTheme(theme: 'light' | 'dark') {
      this.current = theme
      if (import.meta.client) {
        const colorMode = useNuxtApp().$colorMode
        if (colorMode) {
          colorMode.preference = theme
        }
      }
    },

    toggle() {
      this.setTheme(this.current === 'light' ? 'dark' : 'light')
    },

    init() {
      if (import.meta.client) {
        const colorMode = useNuxtApp().$colorMode
        if (colorMode) {
          this.current = colorMode.value as 'light' | 'dark'
        }
      }
    },
  },
})
