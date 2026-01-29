import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    console.log('From Auth Middleware:', authStore.isAuthenticated)
    // Prevent redirect loop if already on the login page
    if (to.path !== '/auth') {
      return navigateTo('/auth')
    }
  }
})
