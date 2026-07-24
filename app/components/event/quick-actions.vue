<template>
  <div>
    <div class="flex items-center justify-between w-full mb-4">
      <h2>Quick Actions</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UModal>
        <UCard
          class="cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-lg border border-dashed rounded-xl"
        >
          <div class="flex flex-col gap-4">
            <UIcon name="i-lucide-plus" class="size-6" />
            <span class="text-wrap">Create a request to judge an event</span>
          </div>
          <p class="text-lg mt-4">Submit a request to judge an active event</p>
        </UCard>

        <template #content>
          <UCard>
            <div class="mb-4">
              <p class="text-lg font-bold">Request to Judge</p>
              <p>Open a request to judge an event</p>
            </div>
            <USelect
              v-model="selectedEventName"
              label="Select an event"
              :items="eventsStore.events.map((e) => e.name)"
            />
            <div class="flex justify-end gap-2 mt-4">
              <UButton label="Cancel" color="neutral" variant="ghost" />
              <UButton label="Submit" @click="register()" />
            </div>
          </UCard>
        </template>
      </UModal>

      <UCard
        class="cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-lg border border-dashed rounded-xl"
        @click="router.push('/judge/scores')"
      >
        <div class="flex flex-col gap-4">
          <UIcon name="i-lucide-eye" class="size-6" />
          <span class="text-wrap">View my scores</span>
        </div>
        <p class="text-lg mt-4">Review your scores for judged events</p>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const api = useStrapiApi()
const eventsStore = useEventsStore()
const authStore = useAuthStore()
const judgeRequestsStore = useJudgeRequestsStore()
const selectedEventName = ref('')
const { showSnackbar } = useSnackbar()

async function register() {
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
    if (authStore.user?.judge?.id) {
      await judgeRequestsStore.fetchJudgeRequests(authStore.user.judge.id)
    }
    selectedEventName.value = ''
  } catch (error: any) {
    console.error('Error registering for event', error)
    if (error.status === 409) {
      if (error.response.data.error.details.type === 'isJudging') {
        showSnackbar('You are already judging this event.', 'warning')
      } else if (error.response.data.error.details.type === 'hasExistingRequest') {
        showSnackbar('You have already requested to judge this event.', 'warning')
      }
    } else {
      showSnackbar(
        error.data?.error?.message || 'An error occurred while submitting your request.',
        'error'
      )
    }
  }
}
</script>
