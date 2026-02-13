import { useAuthStore } from '~/stores/auth'

// export default defineNuxtRouteMiddleware((to) => {
//   const authStore = useAuthStore()
//
//   if (!authStore.isAuthenticated) {
//     console.log('From Auth Middleware:', authStore.isAuthenticated)
//     // Prevent redirect loop if already on the login page
//     if (to.path == '/') {
//       return
//     }
//     if (to.path !== '/auth') {
//       return navigateTo('/auth')
//     }
//   }
// })

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) return

  const role = authStore.user?.userRole

  if (to.path.startsWith('/admin') && role === 'judge') {
    if (to.path !== '/judge/dashboard') {
      return navigateTo('/judge/dashboard')
    }
    return
  }

  if (to.path.startsWith('/judge') && role === 'admin') {
    if (to.path !== '/admin/dashboard') {
      return navigateTo('/admin/dashboard')
    }
    return
  }
})
