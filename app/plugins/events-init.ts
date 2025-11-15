import { useEventsStore } from '#imports'

export default defineNuxtPlugin(async () => {
  const eventsStore = useEventsStore()
  await eventsStore.fetchEvents()
})
