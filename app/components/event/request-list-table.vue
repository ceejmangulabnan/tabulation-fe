<template>
  <section>
    <header class="flex items-center justify-between w-full mb-4">
      <h2>Judging Requests</h2>
      <span>
        {{
          judgeRequestsStore.judgeRequests.length == 1
            ? `${judgeRequestsStore.judgeRequests.length} request`
            : `${judgeRequestsStore.judgeRequests.length} requests`
        }}
      </span>
    </header>
    <UTable
      :data="judgeRequestsStore.judgeRequests"
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
        {{ row.original.event?.name || 'No Event' }}
      </template>
      <template #request_status-cell="{ row }">
        <UBadge :color="getStatusColor(row.original.request_status)" class="capitalize">
          {{ row.original.request_status }}
        </UBadge>
      </template>
      <template #actions-cell="{ row }">
        <UButton
          v-if="row.original.request_status !== 'approved'"
          label="Cancel"
          color="error"
          variant="subtle"
        />
      </template>
    </UTable>
  </section>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const judgeRequestsStore = useJudgeRequestsStore()
await judgeRequestsStore.fetchJudgeRequests(authStore.user?.judge?.id as number)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'error'
    default: return 'info'
  }
}
</script>
