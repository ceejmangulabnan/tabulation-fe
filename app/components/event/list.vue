<template>
  <div>
    <div class="flex items-center justify-between w-full mb-4">
      <h2>Your Events</h2>
      <span>
        {{
          judgeEvents.length == 1 ? `${judgeEvents.length} event` : `${judgeEvents.length} events`
        }}
      </span>
    </div>

    <div
      v-if="eventsStore.isLoading"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
    >
      <EventCardSkeleton
        v-for="n in 3"
        :key="n"
      />
    </div>

    <div
      v-else-if="judgeEvents.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
    >
      <EventCard
        v-for="(event, i) in judgeEvents"
        :key="i"
        :event="event"
      />
    </div>

    <div
      v-else
      class="flex justify-center items-center p-16 rounded-xl border my-4"
    >
      <p class="text-lg">No active events</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const eventsStore = useEventsStore()
const authStore = useAuthStore()

const judgeId = computed(() => authStore.user?.judge?.id)

const judgeEvents = computed(() => {
  if (!judgeId.value) return []
  return eventsStore.getJudgeEvents(judgeId.value)
})

watch(
  judgeId,
  (id) => {
    if (id) {
      eventsStore.fetchEvents({ populate: { judges: true } })
    }
  },
  { immediate: true }
)
</script>
