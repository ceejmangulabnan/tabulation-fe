<template>
  <div>
    <div class="flex items-center gap-2 mb-2 font-bold">
      <UBadge
        :color="statusColor"
        class="capitalize"
      >
        {{ props.event.event_status }}
      </UBadge>
      Event Information
    </div>

    <form class="space-y-4" @submit.prevent="handleSave">
      <UInput
        v-model="formData.name"
        label="Title"
        autofocus
      />

      <UTextarea
        :model-value="formData.description ?? undefined"
        label="Description"
        @update:model-value="(val: any) => formData.description = val"
      />

      <USelect
        :model-value="formData.final_scoring_mode || undefined"
        label="Final Scoring Mode"
        :items="[
          { label: 'Combine All Segments', value: 'combine_all' },
          { label: 'Last Segment Only', value: 'last_segment_only' },
        ]"
        @update:model-value="(val: any) => formData.final_scoring_mode = val"
      />

      <div class="flex justify-end">
        <UButton
          label="Update"
          type="submit"
        />
      </div>
    </form>
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
const { showSnackbar } = useSnackbar()

const statusColor = computed(() => {
  switch (props.event.event_status) {
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
const handleSave = async () => {
  try {
    await api.put(`/events/${eventsStore.event?.documentId}`, {
      data: {
        name: formData.value.name,
        description: formData.value.description,
        final_scoring_mode: formData.value.final_scoring_mode,
      },
    })
    showSnackbar('Event updated successfully.', 'success')
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
  } catch (error) {
    console.error('Error updating event:', error)
    showSnackbar('Failed to update event.', 'error')
  }
}
</script>
