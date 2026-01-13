<template>
  <div>
    <div class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>Quick Actions</h2>
    </div>
    <v-row no-gutters>
      <v-col
        cols="12"
        sm="6"
        class="d-flex"
      >
        <v-dialog max-width="500">
          <template #activator="{ props: activatorProps }">
            <v-card
              v-bind="activatorProps"
              elevation="0"
              class="cursor-pointer custom-hover-card d-flex flex-column w-100 pa-3 ma-2 border-md border-dashed rounded-xl"
            >
              <v-card-item>
                <v-card-title class="d-flex flex-column ga-4">
                  <v-icon icon="mdi-plus"></v-icon>
                  <span class="text-wrap">Create a request to judge an event</span>
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
                  <v-select
                    v-model="selectedEventName"
                    label="Select an event"
                    :items="eventsStore.events.map((e) => e.name)"
                  ></v-select>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  text="Cancel"
                  @click="isActive.value = false"
                ></v-btn>
                <v-btn
                  variant="tonal"
                  text="Submit"
                  @click="register(isActive)"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </v-col>

      <v-col
        cols="12"
        sm="6"
        class="d-flex"
      >
        <v-card
          elevation="0"
          class="cursor-pointer custom-hover-card d-flex flex-column w-100 pa-3 ma-2 border-md border-dashed rounded-xl"
          @click="router.push('/judge/scores')"
        >
          <v-card-item>
            <v-card-title class="d-flex flex-column ga-4">
              <v-icon icon="mdi-eye"></v-icon>
              <span class="text-wrap">View my scores</span>
            </v-card-title>
          </v-card-item>
          <v-spacer></v-spacer>
          <v-card-text class="text-lg">Review your scores for judged events</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <Snackbar />
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const api = useStrapiApi()
const eventsStore = useEventsStore()
const authStore = useAuthStore()
const judgeRequestsStore = useJudgeRequestsStore()
const selectedEventName = ref('')
const snackbar = useSnackbar()

async function register(isActive: { value: boolean }) {
  try {
    if (!selectedEventName.value) {
      snackbar.showSnackbar('Please select an event.', 'error')
      return
    }

    const selectedEvent = eventsStore.events.find((e) => e.name === selectedEventName.value)

    if (!selectedEvent) {
      snackbar.showSnackbar('Selected event not found.', 'error')
      return
    }

    const { data: judgeRes } = await api.get(
      `/judges?populate=*&filters[users_permissions_user][id][$eq]=${authStore.user?.id}`
    )

    const judge = judgeRes?.data?.[0]
    console.log('Current Judge:', judge)
    console.log('Current User:', authStore)
    if (!judge) {
      snackbar.showSnackbar('No Judge entry found for this user.', 'error')
      return
    }

    const payload = {
      data: {
        request_status: 'pending',
        judge: {
          connect: [judge.documentId],
        },
        event: {
          connect: [selectedEvent.documentId],
        },
      },
    }
    console.log('Judge Request Payload:', payload)

    await api.post('/judge-requests', payload)
    snackbar.showSnackbar('Request submitted successfully!', 'success')
    if (authStore.user?.judge?.id) {
      await judgeRequestsStore.fetchJudgeRequests(authStore.user.judge.id)
    }
    isActive.value = false
    selectedEventName.value = ''
  } catch (error: any) {
    console.error('Error registering for event', error)
    if (error.status === 409) {
      if (error.response.data.error.details.type === 'isJudging') {
        snackbar.showSnackbar('You are already judging this event.', 'warning')
      } else if (error.response.data.error.details.type === 'hasExistingRequest') {
        snackbar.showSnackbar('You have already requested to judge this event.', 'warning')
      }
      isActive.value = false // Close dialog on conflict
    } else {
      snackbar.showSnackbar(
        error.data?.error?.message || 'An error occurred while submitting your request.',
        'error'
      )
    }
  }
}
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
