export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const eventsStore = useEventsStore()

  watch(
    () => authStore.user,
    (user) => {
      if (user) eventsStore.fetchEvents()
    },
    { immediate: true }
  )
})
