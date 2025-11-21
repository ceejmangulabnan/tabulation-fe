<template>
  <div class="my-4 d-flex flex-column ga-10">
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
          <!-- TODO: Show number of active categories -->
          <span>2 Active Categories</span>
          <!-- TODO: Show number of participants -->
          <span>3 Participants</span>
        </div>
      </div>
      <!-- v-chip indicating currently active categories for scoring  -->
      <v-chip v-for="category in activeCategories">{{ category.name }}</v-chip>
    </header>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const theme = useThemeStore()
const router = useRouter()
const eventsStore = useEventsStore()
const activeCategories = computed(() =>
  eventsStore.event?.categories.filter((category) => category.active)
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
