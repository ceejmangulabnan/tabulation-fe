import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  // const role = authStore.user?.userRole

  if (authStore.isAuthenticated) {
    if (to.path == '/auth') {
      // Check user role, then redirect to corresponding dashboard (/judge/dashboard or /admin/dashboard)

      // TODO: Refactor to redirect according to user role
      return navigateTo('/dashboard')
    }
  }
})
