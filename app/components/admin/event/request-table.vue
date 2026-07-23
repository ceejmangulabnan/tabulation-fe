<template>
  <section>
    <header class="flex items-center justify-between w-full mb-4">
      <h2>Judging Requests</h2>
      <span>
        {{
          judgeRequestsStore.allJudgeRequests.length == 1
            ? `${judgeRequestsStore.allJudgeRequests.length} request`
            : `${judgeRequestsStore.allJudgeRequests.length} requests`
        }}
      </span>
    </header>
    <UTable
      :data="judgeRequestsStore.allJudgeRequests"
      :columns="[
        { accessorKey: 'event.name', header: 'Event Name' },
        { accessorKey: 'judge.name', header: 'Judge' },
        { accessorKey: 'request_status', header: 'Request Status' },
        { accessorKey: 'actions', header: 'Actions' },
      ]"
    >
      <template #empty>
        <div class="text-center py-4 text-muted">No Judge Requests</div>
      </template>
      <template #event.name-cell="{ row }">
        {{ row.original.event?.name || 'No Event Found' }}
      </template>
      <template #judge.name-cell="{ row }">
        {{ row.original.judge?.name ?? 'No Name' }}
      </template>
      <template #request_status-cell="{ row }">
        <UBadge
          :color="getStatusColor(row.original.request_status)"
          class="capitalize"
        >
          {{ row.original.request_status }}
        </UBadge>
      </template>
      <template #actions-cell="{ row }">
        <template v-if="row.original.request_status === 'pending'">
          <UButton
            label="Approve"
            color="success"
            variant="subtle"
            class="mr-2"
            @click="openConfirmationDialog(row.original, 'approve')"
          />
          <UButton
            label="Reject"
            color="error"
            variant="subtle"
            @click="openConfirmationDialog(row.original, 'reject')"
          />
        </template>
        <span v-else>-</span>
      </template>
    </UTable>

    <UModal v-model:open="confirmationDialog">
      <UCard>
        <h3 class="text-xl font-bold mb-4">
          {{ actionToConfirm === 'approve' ? 'Approve' : 'Reject' }} Request
        </h3>
        <p>
          Are you sure you want to {{ actionToConfirm }} the request for
          <strong>{{ selectedRequest?.judge.name }}</strong>
          to be a judge for the event
          <strong>{{ selectedRequest?.event.name }}</strong>
          ?
        </p>
        <div class="flex justify-end gap-2 mt-4">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="closeConfirmationDialog"
          />
          <UButton
            :label="actionToConfirm === 'approve' ? 'Approve' : 'Reject'"
            :color="actionToConfirm === 'approve' ? 'success' : 'error'"
            @click="confirmAction"
          />
        </div>
      </UCard>
    </UModal>
  </section>
</template>

<script setup lang="ts">
const judgeRequestsStore = useJudgeRequestsStore()

const confirmationDialog = ref(false)
const selectedRequest = ref<JudgeRequestData | null>(null)
const actionToConfirm = ref<'approve' | 'reject' | null>(null)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'error'
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
})
</script>
