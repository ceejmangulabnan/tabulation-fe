<template>
  <div>
    <v-data-table :headers="tableHeaders" :items="events"></v-data-table>
  </div>
</template>

<script setup lang="ts">
  type EventsResponse = StrapiListResponse<EventData>
  const events = ref<EventData[]>([])
  // const config = useRuntimeConfig()
  // const baseApiUrl = config.public.strapiUrl
  const tableHeaders = [
    {
      title: 'Name',
      key: 'name',
    },
    {
      title: 'Description',
      key: 'description',
    },
  ]

  try {
    const api = useStrapiApi()
    const response = await api.get<EventsResponse>('/events')
    console.log('Events', response.data)
    events.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch events', error)
  }
</script>
