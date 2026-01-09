<template>
  <section>
    <header class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>Judging Requests</h2>
      <span>
        {{
          judgeRequestsStore.allJudgeRequests.length == 1
            ? `${judgeRequestsStore.allJudgeRequests.length} request`
            : `${judgeRequestsStore.allJudgeRequests.length} requests`
        }}
      </span>
    </header>
    <v-table
      class="border-sm rounded-lg"
      striped="even"
    >
      <thead>
        <tr>
          <th class="font-weight-bold text-subtitle-1 text-left">Event Name</th>
          <th class="font-weight-bold text-subtitle-1 text-center">Judge</th>
          <th class="font-weight-bold text-subtitle-1 text-center">Request Status</th>
          <th class="font-weight-bold text-subtitle-1 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="judgeRequestsStore.allJudgeRequests.length == 0">
          <td
            colspan="4"
            class="text-center text-grey-darken-2"
          >
            No Judge Requests
          </td>
        </tr>
        <tr
          v-for="item in judgeRequestsStore.allJudgeRequests"
          :key="item.id"
        >
          <td>{{ item.event?.name || 'No Event Found' }}</td>
          <td align="center">{{ item.judge?.name ?? 'No Name ' }}</td>
          <td align="center">
            <v-chip
              :color="getStatusColor(item.request_status)"
              label
              class="text-capitalize"
            >
              {{ item.request_status }}
            </v-chip>
          </td>
          <td align="center">
            <template v-if="item.request_status === 'pending'">
              <v-btn
                variant="tonal"
                color="success"
                class="mr-2"
                @click="openConfirmationDialog(item, 'approve')"
              >
                Approve
              </v-btn>
              <v-btn
                variant="tonal"
                color="error"
                @click="openConfirmationDialog(item, 'reject')"
              >
                Reject
              </v-btn>
            </template>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-dialog
      v-model="confirmationDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ actionToConfirm === 'approve' ? 'Approve' : 'Reject' }} Request
        </v-card-title>
        <v-card-text>
          Are you sure you want to {{ actionToConfirm }} the request for
          <strong>{{ selectedRequest?.judge.name }}</strong>
          to be a judge for the event
          <strong>{{ selectedRequest?.event.name }}</strong>
          ?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="closeConfirmationDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            :color="actionToConfirm === 'approve' ? 'success' : 'error'"
            @click="confirmAction"
          >
            {{ actionToConfirm === 'approve' ? 'Approve' : 'Reject' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
const judgeRequestsStore = useJudgeRequestsStore()
const theme = useThemeStore()

const confirmationDialog = ref(false)
const selectedRequest = ref<JudgeRequestData | null>(null)
const actionToConfirm = ref<'approve' | 'reject' | null>(null)

const getStatusColor = (status: string) => {
  const isDark = theme.current === 'dark'
  switch (status) {
    case 'approved':
      return isDark ? 'success' : 'green-darken-2'
    case 'pending':
      return isDark ? 'warning' : 'yellow-darken-2'
    case 'rejected':
      return isDark ? 'error' : 'red-darken-2'
    default:
      return 'info'
  }
}

const openConfirmationDialog = (item: JudgeRequestData, action: 'approve' | 'reject') => {
  selectedRequest.value = item
  actionToConfirm.value = action
  confirmationDialog.value = true
}

const closeConfirmationDialog = () => {
  confirmationDialog.value = false
  selectedRequest.value = null
  actionToConfirm.value = null
}

const confirmAction = async () => {
  if (selectedRequest.value && actionToConfirm.value) {
    const newStatus = actionToConfirm.value === 'approve' ? 'approved' : 'rejected'
    const success = await judgeRequestsStore.updateJudgeRequest(selectedRequest.value.documentId, {
      request_status: newStatus,
    })
    if (success) {
      await judgeRequestsStore.fetchAllJudgeRequests()
    }
  }
  closeConfirmationDialog()
}

onMounted(async () => {
  await judgeRequestsStore.fetchAllJudgeRequests()
  console.log('All Judge Requests:', judgeRequestsStore.allJudgeRequests)
})
</script>
