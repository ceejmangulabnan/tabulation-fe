export default defineNuxtRouteMiddleware((to) => {
  const pathParts = to.path.split('/').filter(Boolean)

  if (to.path.startsWith('/judge')) {
    setPageLayout('judge')
    return
  }

  if (pathParts[0] === 'admin' && pathParts[1] === 'events' && pathParts.length > 2) {
    setPageLayout('admin-event')
    return
  }

  if (to.path.startsWith('/admin')) {
    setPageLayout('admin')
  }
})
