export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const judge = authStore.user?.judge
  const id = to.params.id as string
  const eventsStore = useEventsStore()
  await eventsStore.fetchEvent(id)

  if (eventsStore.event && authStore.isAuthenticated) {
    if (!eventsStore.event.judges.find((j) => j.documentId === judge?.documentId)) {
      return navigateTo('/judge/dashboard')
    }
  }
})
