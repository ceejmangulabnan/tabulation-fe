import { useAuthStore } from '~/stores/auth'
import { useEventsStore } from '~/stores/events'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const eventsStore = useEventsStore()

  // must be logged in
  if (!authStore.isAuthenticated) return

  // only judges should run this guard
  if (authStore.user?.userRole !== 'judge') return

  // only run on routes that actually have an event id
  const eventId = to.params.id as string | undefined
  if (!eventId) return

  const judge = authStore.user?.judge
  if (!judge) return navigateTo('/judge/dashboard')

  try {
    await eventsStore.fetchEvent(eventId)
  } catch {
    // if event fails to load, just send back to dashboard
    if (to.path !== '/judge/dashboard') {
      return navigateTo('/judge/dashboard')
    }
    return
  }

  const allowed = eventsStore.event?.judges?.some(
    (j) => String(j.documentId) === String(judge.documentId)
  )

  if (!allowed) {
    // prevent redirect loop
    if (to.path !== '/judge/dashboard') {
      return navigateTo('/judge/dashboard')
    }
  }
})
