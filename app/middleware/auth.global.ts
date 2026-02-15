export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Define public pages that do not require authentication
  const publicPages = ['/', '/auth']
  const authRequired = !publicPages.includes(to.path)

  // If authentication is required for the route and the user is not authenticated
  if (authRequired && !authStore.isAuthenticated) {
    // Redirect to the authentication page
    return navigateTo('/auth')
  }

  // If the user is not authenticated and the current page is public,
  // or if the user is authenticated, continue processing role-based redirects.
  // This check also prevents unnecessary further execution if not authenticated
  // but on a public page.
  if (!authStore.isAuthenticated) {
    return // Allow access to public pages if not authenticated
  }

  // From here, we know the user is authenticated. Proceed with role-based redirects.
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
