export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/judge')) {
    return setPageLayout('judge')
  }

  if (to.path.startsWith('/admin')) {
    return setPageLayout('admin')
  }
})
