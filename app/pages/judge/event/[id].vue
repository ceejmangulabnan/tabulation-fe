<template>
  <div class="my-4 d-flex flex-column ga-10">
    <v-alert
      v-if="activeSegments && activeSegments.length"
      type="info"
      variant="tonal"
      title="Scoring Active"
      closable
    >
      <p>Scoring is currently active for the following categories:</p>
      <div class="d-flex ga-2 mt-2">
        <v-chip
          v-for="seg in activeSegments"
          :key="seg.name"
        >
          {{ seg.name }}
        </v-chip>
      </div>
    </v-alert>
    <header class="d-flex ga-4">
      <v-btn
        icon="mdi-arrow-left"
        variant="plain"
        @click="router.push('/judge/dashboard')"
      />
      <div>
        <h1 class="text-h4 font-weight-bold">{{ eventsStore.event?.name }}</h1>
        <p>{{ eventsStore.event?.description }}</p>
        <div
          class="d-flex ga-4 font-weight-light text-body-2 mt-3"
          :class="theme.current === 'light' ? 'text-grey' : 'text-grey-darken-2'"
        >
          <span>{{ activeSegments?.length }} Active Categories</span>
          <span>{{ eventsStore.event?.participants.length }} Participants</span>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['judge'],
})

const route = useRoute()
const theme = useThemeStore()
const router = useRouter()
const eventsStore = useEventsStore()
const activeSegments = computed(() =>
  eventsStore.event?.segments.filter((seg) => seg.segment_status === 'active')
)

watch(
  () => route.params.id as string,
  async (eventId) => {
    if (eventId) {
      await eventsStore.fetchEvent(eventId)
    }
  },
  { immediate: true }
)
</script>
