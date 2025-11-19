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
                  <v-select
                    label="Select an event"
                    :items="eventsStore.events.map((e) => e.name)"
                    v-model="selectedEventName"
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
              <span class="">View my scores</span>
            </v-card-title>
          </v-card-item>
          <v-spacer></v-spacer>
          <v-card-text class="text-lg">Review your scores for judged events</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const api = useStrapiApi()
const eventsStore = useEventsStore()
const authStore = useAuthStore()
const judgeRequestsStore = useJudgeRequestsStore()
const selectedEventName = ref('')

const snackbar = reactive({
  show: false,
  message: '',
  color: '',
  timeout: 3000,
})

function showSnackbar(message: string, color: string = 'info', timeout: number = 3000) {
  snackbar.show = true
  snackbar.message = message
  snackbar.color = color
  snackbar.timeout = timeout
}

async function register(isActive: { value: boolean }) {
  try {
    if (!selectedEventName.value) {
      showSnackbar('Please select an event.', 'error')
      return
    }

    const selectedEvent = eventsStore.events.find((e) => e.name === selectedEventName.value)

    if (!selectedEvent) {
      showSnackbar('Selected event not found.', 'error')
      return
    }

    const { data: judgeRes } = await api.get(
      `/judges?populate=*&filters[users_permissions_user][id][$eq]=${authStore.user?.id}`
    )

    const judge = judgeRes?.data?.[0]
    if (!judge) {
      showSnackbar('No Judge entry found for this user.', 'error')
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

    await api.post('/judge-requests', payload)
    showSnackbar('Request submitted successfully!', 'success')
    await judgeRequestsStore.fetchJudgeRequests()
    isActive.value = false
    selectedEventName.value = ''
  } catch (error: any) {
    console.error('Error registering for event', error)

    if (error.status === 409) {
      if (error.response.data.error.details.type == 'isJudging') {
        showSnackbar('You are already judging this event.', 'warning')
      } else if (error.response.data.error.details.type == 'hasExistingRequest')
        showSnackbar('You have already requested to judge this event.', 'warning')
      isActive.value = false
    } else {
      showSnackbar(
        error.response.data?.error?.message || 'An error occurred while submitting your request.',
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
