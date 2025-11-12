<template>
  <div class="my-2 mx-6 d-flex flex-column ga-10"></div>
</template>

<script setup lang="ts">
type EventsResponse = StrapiListResponse<EventData>
const route = useRoute()
const eventId = route.params.id as string 
const event = ref<EventData[]>([])

async function fetchEvent() {
  try {
    const api = useStrapiApi()
    const response = await api.get<EventsResponse>(`/events?populate=*&filters[id][$eq]=${eventId}`)
    event.value = response.data.data
    console.log('Event', event.value)
  } catch (error) {
    console.error('Failed to fetch event', error)
  }
}

onMounted(fetchEvent)
</script>