<template>
  <v-card
    hover
    class="d-flex flex-column w-100 ma-2 pa-3 rounded-xl"
    @click="router.push(`/${userRole}/events/${event.id}`)"
  >
    <v-card-item>
      <v-card-title class="d-flex align-center justify-space-between">
        <h1 class="text-h6 font-weight-bold">
          {{ event?.name }}
        </h1>
        <v-chip
          :color="statusColor"
          size="large"
          class="font-weight-bold flex-shrink-0"
        >
          {{ event?.event_status.toUpperCase() }}
        </v-chip>
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <p>{{ event.description }}</p>
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions>
      <v-btn
        variant="flat"
        color="green"
      >
        {{ userRole === 'admin' ? 'Edit Event' : 'View Details' }}
      </v-btn>
    </v-card-actions>
  </v-card>
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
      return 'grey'
    case 'active':
      return 'green'
    case 'inactive':
      return 'orange'
    case 'finished':
      return 'blue'
    default:
      return 'grey'
  }
})
</script>
