<template>
  <div>
    <v-card-title class="d-flex font-weight-bold mb-2">
      <v-chip
        class="mr-4 text-capitalize"
        :color="statusColor"
        variant="flat"
      >
        {{ props.event.event_status }}
      </v-chip>
      Event Information
    </v-card-title>

    <v-card-text>
      <v-text-field
        v-model="props.event.name"
        label="Title"
      />

      <v-textarea
        v-model="props.event.description"
        label="Description"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        color="green"
        @click="handleSave"
      >
        Update
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  event: {
    type: Object as PropType<Partial<EventData>>,
    required: true,
  },
})

const api = useStrapiApi()
const eventsStore = useEventsStore()
const snackbar = useSnackbar()

const statusColor = computed(() => {
  switch (props.event.event_status) {
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
const handleSave = async () => {
  try {
    await api.put(`/events/${eventsStore.event?.documentId}`, {
      data: {
        name: props.event.name,
        description: props.event.description,
      },
    })
    snackbar.showSnackbar('Event updated successfully.', 'success')
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
  } catch (error) {
    console.error('Error updating event:', error)
    snackbar.showSnackbar('Failed to udpate event.', 'error')
  }
}
</script>
