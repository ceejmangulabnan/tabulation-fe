<template>
  <v-card class="pa-2">
    <v-card-title>Create Event</v-card-title>
    <v-card-text>
      <v-form>
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
        ></v-textarea>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn
        text="Cancel"
        @click="$emit('close-dialog')"
      ></v-btn>
      <v-btn
        text="Create"
        variant="tonal"
        :loading="eventsStore.isSubmitting"
        @click="createEvent"
      ></v-btn>
    </v-card-actions>
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
  const response = await eventsStore.createEvent(form)
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
