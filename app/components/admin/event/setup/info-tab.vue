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

    <v-form
      @submit.prevent
      @submit="handleSave"
    >
      <v-card-text>
        <v-text-field
          v-model="formData.name"
          label="Title"
          :autofocus="true"
        />

        <v-textarea
          v-model="formData.description"
          label="Description"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="green"
          type="submit"
        >
          Update
        </v-btn>
      </v-card-actions>
    </v-form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  event: {
    type: Object as PropType<Partial<EventData>>,
    required: true,
  },
})

const formData = ref({ ...props.event })

watch(
  () => props.event,
  (newEvent) => {
    formData.value = { ...newEvent }
  },
  { deep: true }
)

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
        name: formData.value.name,
        description: formData.value.description,
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
