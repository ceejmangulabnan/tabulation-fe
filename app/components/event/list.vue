<template>
  <div>
    <div class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>Your Events</h2>
      <span>{{ events.length || 0 }} events</span>
    </div>

    <v-row
      v-if="events.length > 0"
      no-gutters
    >
      <v-col
        v-for="(event, i) in events"
        :key="i"
        cols="12"
        sm="6"
        md="4"
        class="d-flex"
      >
        <EventCard :event="event" />
      </v-col>
    </v-row>

    <v-sheet
      v-else
      class="d-flex justify-center align-center pa-16 rounded-xl border-sm my-4"
    >
      <p class="text-h6">No active events</p>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
type EventsResponse = StrapiListResponse<EventData>
const events = ref<EventData[]>([])
const authStore = useAuthStore()
console.log('User', authStore.user)

async function fetchEvents() {
  try {
    const api = useStrapiApi()
    const response = await api.get<EventsResponse>('/events?populate=*')
    console.log('Events', response.data)

    // Get only events that user is currently judging
    const judgeEvents = response.data.data.filter((event) => {
      return event.judges?.some((judge) => judge.id === authStore.user?.judge?.id)
    })

    console.log('Events Filtered', judgeEvents)
    events.value = judgeEvents
  } catch (error) {
    console.error('Failed to fetch events', error)
  }
}

onMounted(fetchEvents)
</script>
