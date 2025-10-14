import { useAuthStore } from '#imports'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated && authStore.role === 'admin') {
    return navigateTo('/admin/dashboard')
  }
})
