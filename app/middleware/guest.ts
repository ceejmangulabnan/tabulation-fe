// app/middleware/auth.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    if (to.path == '/auth') {
      return navigateTo('/dashboard')
    }
  }
})
