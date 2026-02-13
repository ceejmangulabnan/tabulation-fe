// import { useAuthStore } from '#imports'
//
// export default defineNuxtRouteMiddleware(async (to) => {
//   const authStore = useAuthStore()
//
//   if (!authStore.isAuthenticated && !authStore.user?.userRole) {
//     await authStore.logout()
//     return navigateTo('/')
//   }
//   if (authStore.isAuthenticated && !authStore.user?.userRole) {
//     await authStore.logout()
//     return navigateTo('/')
//   }
//   if (authStore.isAuthenticated && authStore.user?.userRole === 'admin') {
//     if (to.path !== '/admin/dashboard') {
//       return navigateTo('/admin/dashboard')
//     }
//   }
//   if (authStore.isAuthenticated && authStore.user?.userRole === 'judge') {
//     if (to.path !== '/judge/dashboard') {
//       return navigateTo('/judge/dashboard')
//     }
//   }
// })

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/')
  }
})
