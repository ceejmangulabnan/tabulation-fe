<template>
  <UCard
    class="flex flex-col w-full cursor-pointer hover:shadow-lg transition-shadow"
    @click="router.push(`/${userRole}/events/${event.id}`)"
  >
    <div class="flex items-start justify-between gap-2 flex-wrap-reverse flex-lg:nowrap">
      <h1 class="text-lg font-bold text-wrap">
        {{ event?.name }}
      </h1>
      <UBadge
        :color="statusColor"
        size="lg"
        class="font-bold flex-shrink-0 -mb-1.5"
      >
        {{ event?.event_status.toUpperCase() }}
      </UBadge>
    </div>

    <p class="mt-2 text-muted">{{ event.description }}</p>

    <div class="mt-auto pt-4">
      <UButton
        variant="solid"
        :label="userRole === 'admin' ? 'Edit Event' : 'View Details'"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { event } = defineProps<{
  event: EventData
}>()
const router = useRouter()
const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.userRole)

const statusColor = computed(() => {
  switch (event.event_status) {
    case 'draft': return 'neutral'
    case 'active': return 'success'
    case 'inactive': return 'warning'
    case 'finished': return 'info'
    default: return 'neutral'
  }
})
</script>
