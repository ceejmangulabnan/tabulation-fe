<template>
  <v-card class="pa-2">
    <v-card-title>Create Event</v-card-title>
    <v-form @submit.prevent="createEvent">
      <v-card-text>
        <v-text-field
          v-model="form.name"
          label="Event Name"
          variant="outlined"
          density="compact"
          class="mb-2"
        ></v-text-field>

        <v-textarea
          v-model="form.description"
          label="Event Description"
          variant="outlined"
          density="compact"
          class="mb-2"
          @keydown.enter.prevent="createEvent"
        ></v-textarea>
      </v-card-text>
      <v-card-actions class="ml-auto">
        <v-btn
          text="Cancel"
          @click="$emit('close-dialog')"
        ></v-btn>
        <v-btn
          text="Create"
          variant="tonal"
          :loading="eventsStore.isSubmitting"
          type="submit"
        ></v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
const emit = defineEmits(['close-dialog'])
const eventsStore = useEventsStore()
const snackbar = useSnackbar()
const router = useRouter()

const form = ref({
  name: '',
  description: '',
})

const createEvent = async () => {
  console.log('Creating event with data:', form.value)
  const response = await eventsStore.createEvent(form.value)
  console.log('Admin Create Event response:', response)
  if (response) {
    if (response.status === 201) {
      snackbar.showSnackbar(`Event "${response.data.data.name}" created successfully.`, 'success')
      emit('close-dialog')
      router.push(`/admin/events/${response.data.data.id}/setup`)
      return
    } else {
      snackbar.showSnackbar(
        `Failed to create event "${response.data.data.name}". Please try again later.`,
        'error'
      )
    }
  }
}
</script>
