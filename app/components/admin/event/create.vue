<template>
  <UCard class="pa-2">
    <h3 class="text-lg font-bold mb-4">Create Event</h3>
    <form class="flex flex-col gap-4" @submit.prevent="createEvent">
      <UInput
        v-model="form.name"
        label="Event Name"
        placeholder="Enter event name"
      />

      <UTextarea
        v-model="form.description"
        label="Event Description"
        placeholder="Enter event description"
        @keydown.enter.prevent="createEvent"
      />

      <div class="flex justify-end gap-2">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          @click="$emit('close-dialog')"
        />
        <UButton
          label="Create"
          type="submit"
          :loading="eventsStore.isSubmitting"
        />
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
const emit = defineEmits(['close-dialog'])
const eventsStore = useEventsStore()
const { showSnackbar } = useSnackbar()
const router = useRouter()

const form = ref({
  name: '',
  description: '',
})

const createEvent = async () => {
  const response = await eventsStore.createEvent(form.value)
  if (response) {
    if (response.status === 201) {
      showSnackbar(`Event "${response.data.data.name}" created successfully.`, 'success')
      emit('close-dialog')
      router.push(`/admin/events/${response.data.data.id}/setup`)
      return
    } else {
      showSnackbar(
        `Failed to create event "${response.data.data.name}". Please try again later.`,
        'error'
      )
    }
  }
}
</script>
