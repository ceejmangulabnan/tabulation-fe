<template>
  <div>
    <div class="d-flex justify-space-between align-center w-100">
      <h2>My Active Events</h2>
      <span>{{ events.length || 0 }} events</span>
    </div>
    <v-row v-if="events.length > 0" no-gutters>
      <v-col v-for="(event, i) in events" :key="i" cols="12" sm="6" md="4" class="d-flex">
        <EventCard :event="event" />
      </v-col>
    </v-row>
    <v-sheet v-else class="d-flex justify-center align-center pa-16 rounded-xl border-sm my-4">
      <p class="text-h6">No active events</p>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
  type EventsResponse = StrapiListResponse<EventData>
  const events = ref<EventData[]>([])

  try {
    const api = useStrapiApi()
    const response = await api.get<EventsResponse>('/events')
    console.log('Events', response.data)
    events.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch events', error)
  }
</script>
