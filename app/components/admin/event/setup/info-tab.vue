<template>
  <div>
    <v-card-title>Event Information</v-card-title>
    <v-card-text>
      <v-text-field
        label="Title"
        v-model="event.name"
      />
      <v-textarea
        label="Description"
        v-model="event.description"
      />
      <v-text-field
        label="Status"
        :model-value="event.event_status"
        readonly
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

const handleSave = async () => {
  try {
    await api.put(`/events/${eventsStore.event?.documentId}`, {
      data: {
        name: props.event.name,
        description: props.event.description,
      },
    })
    snackbar.showSnackbar('Event updated successfully.', 'success')
  } catch (error) {
    console.error('Error updating event:', error)
    snackbar.showSnackbar('Failed to udpate event.', 'error')
  }
}
</script>
