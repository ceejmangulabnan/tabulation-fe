<template>
  <v-card class="ma-5 d-flex flex-column w-100 pa-1">
    <v-card-item>
      <v-card-title>{{ event?.name }}</v-card-title>
    </v-card-item>
    <v-card-text>
      <p>{{ event.description }}</p>
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions class="d-flex ml-auto">
      <v-btn variant="tonal" @click="register">Register</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  const { event } = defineProps<{
    event: EventData
  }>()

  const authStore = useAuthStore()
  async function register() {
    try {
      const api = useStrapiApi()
      const response = await api.post('/register-requests', {
        data: {
          request_status: 'pending',
          judge: authStore.user?.id,
          event: event.id,
        },
      })

      console.log('Register Request Response ', response)
    } catch (error) {
      console.error('Error registering for event', error)
    }
  }
</script>

<style scoped></style>
