<template>
  <UCard
    class="flex flex-col h-full w-full cursor-pointer hover:shadow-lg transition-shadow"
    :ui="{ body: 'flex flex-col flex-1 items-start' }"
    @click="router.push(`/${userRole}/events/${event.id}`)"
  >
    <UBadge
      :color="statusColor"
      variant="outline"
      size="sm"
      class="font-bold self-start mb-2"
    >
      {{ event?.event_status.toUpperCase() }}
    </UBadge>
    <div class="flex items-start justify-between gap-2 flex-wrap-reverse flex-lg:nowrap">
      <h1 class="text-lg font-bold text-wrap">
        {{ event?.name }}
      </h1>
    </div>

    <p class="mt-2 text-muted flex-1">{{ event.description }}</p>

    <div class="pt-4 mt-auto self-end">
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
    case 'draft':
      return 'neutral'
    case 'active':
      return 'success'
    case 'inactive':
      return 'warning'
    case 'finished':
      return 'info'
    default:
      return 'neutral'
  }
})
</script>
