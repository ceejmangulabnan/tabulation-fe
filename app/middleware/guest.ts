import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const role = authStore.user?.userRole

  if (authStore.isAuthenticated) {
    if (to.path == '/auth') {
      if (role) {
        return navigateTo(`/${role}/dashboard`)
      }
    }
  }
})
