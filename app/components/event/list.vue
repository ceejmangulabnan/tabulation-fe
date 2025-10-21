<template>
  <div>
    <v-row no-gutters>
      <v-col v-for="(event, i) in events" :key="i" cols="12" sm="6" md="4">
        <EventCard :event="event" />
      </v-col>
    </v-row>
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
