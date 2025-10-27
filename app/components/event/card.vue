<template>
  <v-card class="d-flex flex-column w-100 pa-1">
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
  console.log('User', authStore.user)
  async function register() {
    try {
      const api = useStrapiApi()
      const { data: judgeRes } = await api.get(
        `/judges?populate=*&filters[users_permissions_user][id][$eq]=${authStore.user?.id}`
      )

      const judge = judgeRes?.data?.[0]
      if (!judge) {
        console.error('No Judge entry found for this user.')
        return
      }

      const payload = {
        data: {
          request_status: 'pending',
          judge: {
            connect: [judge.documentId],
          },
          event: {
            connect: [event.documentId],
          },
        },
      }

      const response = await api.post('/judge-requests', payload)
      console.log('Payload', payload)
      console.log('Register Request Response ', response)
    } catch (error) {
      console.error('Error registering for event', error)
    }
  }
</script>

<style scoped></style>
