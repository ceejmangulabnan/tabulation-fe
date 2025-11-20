<template>
  <div class="my-4 d-flex flex-column ga-10">
    <header class="d-flex ga-4">
      <v-btn
        icon="mdi-arrow-left"
        variant="plain"
        @click="router.push('/judge/dashboard')"
      />
      <div>
        <h1 class="text-h4 font-weight-bold">{{ event?.name }}</h1>
        <p>{{ event?.description }}</p>
        <div
          class="d-flex ga-4 font-weight-light text-body-2 mt-3"
          :class="theme.current === 'light' ? 'text-grey' : 'text-grey-darken-2'"
        >
          <!-- TODO: Show number of active categories -->
          <span>2 Active Categories</span>
          <!-- TODO: Show number of participants -->
          <span>3 Participants</span>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
type EventsResponse = StrapiListResponse<EventData>
const route = useRoute()
const eventId = route.params.id as string
const event = ref<EventData | undefined>(undefined)
const theme = useThemeStore()
const router = useRouter()

async function fetchEvent() {
  try {
    const api = useStrapiApi()
    const response = await api.get<EventsResponse>(`/events?populate=*&filters[id][$eq]=${eventId}`)
    event.value = response.data.data[0]
    console.log('Event', event.value)
  } catch (error) {
    console.error('Failed to fetch event', error)
  }
}

onMounted(fetchEvent)
</script>
