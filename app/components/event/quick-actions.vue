<template>
  <div>
    <div class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>Quick Actions</h2>
    </div>
    <v-row no-gutters>
      <v-col cols="12" sm="6" class="d-flex">
        <v-dialog max-width="500">
          <template #activator="{ props: activatorProps }">
            <v-card
              v-bind="activatorProps"
              elevation="0"
              class="cursor-pointer custom-hover-card d-flex flex-column w-100 pa-3 ma-2 border-md border-dashed rounded-xl"
              @click="console.log('open dialog')"
            >
              <v-card-item>
                <v-card-title class="d-flex flex-column ga-4">
                  <v-icon icon="mdi-plus"></v-icon>
                  <span class="">Create a request to judge an event</span>
                </v-card-title>
              </v-card-item>
              <v-spacer></v-spacer>
              <v-card-text class="text-lg">Submit a request to judge an active event</v-card-text>
            </v-card>
          </template>

          <template #default="{ isActive }">
            <v-card class="pa-2">
              <v-card-text>
                <div class="mb-4">
                  <p class="text-h5">Request to Judge</p>
                  <p class="text-body">Open a request to judge an event</p>
                </div>
                <v-form>
                  <v-select label="Select an event" :items="events.map((e) => e.name)"></v-select>
                  <!-- Form - Select Event to judge and Apply button to confirm -->
                </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn text="Cancel" @click="isActive.value = false"></v-btn>
                <v-btn variant="tonal" text="Submit" @click="register"></v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </v-col>

      <v-col cols="12" sm="6" class="d-flex">
        <v-card
          elevation="0"
          class="cursor-pointer custom-hover-card d-flex flex-column w-100 pa-3 ma-2 border-md border-dashed rounded-xl"
          @click="router.push('/judge/scores')"
        >
          <v-card-item>
            <v-card-title class="d-flex flex-column ga-4">
              <v-icon icon="mdi-eye"></v-icon>
              <span class="">View my scores</span>
            </v-card-title>
          </v-card-item>
          <v-spacer></v-spacer>
          <v-card-text class="text-lg">Review your scores for judged events</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
  const router = useRouter()

  type EventsResponse = StrapiListResponse<EventData>
  const events = ref<EventData[]>([])
  const isSubmitting = ref(false)
  const api = useStrapiApi()

  async function fetchEvents() {
    try {
      const response = await api.get<EventsResponse>('/events')
      events.value = response.data.data
      console.log('Events', response.data)
    } catch (error) {
      console.error('Failed to fetch events', error)
    }
  }

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
      emit('registered')
    } catch (error) {
      console.error('Error registering for event', error)
    }
  }

  onMounted(fetchEvents)
</script>

<style scoped>
  .custom-hover-card {
    transition: all 0.25s ease;
  }

  .custom-hover-card:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
    transform: translateY(-3px);
  }
</style>
