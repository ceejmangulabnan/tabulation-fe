<template>
  <div>
    <div class="flex items-center justify-between w-full mb-4">
      <h2 class="text-xl font-bold">All Events</h2>
      <UButton
        icon="i-lucide-plus"
        label="Create Event"
        @click="showCreateDialog = true"
      />
    </div>

    <UTable
      :data="eventsStore.events"
      :columns="columns"
      :loading="eventsStore.isLoading"
      :expanded="expandedRows"
      @toggle-row-expand="(row: any) => toggleExpand(row)"
      class="border rounded-lg"
    >
      <template #name-cell="{ row }">
        <NuxtLink
          :to="`/admin/events/${row.original.id}`"
          class="font-bold text-primary"
        >
          {{ row.original.name }}
        </NuxtLink>
      </template>

      <template #event_status-cell="{ row }">
        <UBadge
          :color="getStatusColor(row.original.event_status)"
          variant="subtle"
          class="capitalize"
        >
          {{ row.original.event_status }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton
            icon="i-lucide-pencil"
            variant="ghost"
            :to="`/admin/events/${row.original.id}/setup`"
          />
          <UButton
            icon="i-lucide-trash-2"
            variant="ghost"
            color="error"
            @click="deleteEvent(row.original)"
          />
          <UButton
            icon="i-lucide-arrow-right"
            variant="ghost"
            :to="`/admin/events/${row.original.id}`"
          />
        </div>
      </template>

      <template #expanded-row="{ row }">
        <div class="p-4">
          <UCard variant="subtle">
            <h4 class="font-bold mb-2">Segment & Scoring Overview</h4>
            <div v-if="!row.original.segments || row.original.segments.length === 0">
              No segments defined for this event.
            </div>
            <div
              v-for="segment in row.original.segments"
              :key="segment.id"
              class="mb-4"
            >
              <h4 class="font-bold">
                {{ segment.name }} (Weight: {{ segment.weight * 100 }}%)
              </h4>
              <div class="space-y-1">
                <div
                  v-for="category in segment.categories"
                  :key="category.id"
                  class="text-sm"
                >
                  <div class="font-medium">{{ category.name }}</div>
                  <div class="text-muted">
                    Scoring Progress: {{ getScoringProgress(category, row.original.judges, row.original.scores) }}
                  </div>
                </div>
                <div v-if="!segment.categories || segment.categories.length === 0" class="text-sm text-muted">
                  No categories in this segment.
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </template>
    </UTable>

    <UModal v-model:open="showCreateDialog">
      <AdminEventCreate @close="showCreateDialog = false" />
    </UModal>
  </div>
</template>

<script setup lang="ts">
const eventsStore = useEventsStore()
const api = useStrapiApi()
const { showSnackbar } = useSnackbar()
const showCreateDialog = ref(false)
const expandedRows = ref<Record<string, boolean>>({})

function toggleExpand(row: any) {
  expandedRows.value[row.id] = !expandedRows.value[row.id]
}

onMounted(async () => {
  await eventsStore.fetchEvents()
})

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'event_status', header: 'Status' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'actions', header: '' },
]

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'neutral'
    case 'active':
      return 'success'
    case 'finished':
      return 'info'
    default:
      return 'neutral'
  }
}

const deleteEvent = async (eventToDelete: EventData) => {
  if (!eventToDelete.documentId) {
    showSnackbar('Event data not available for deletion.', 'error')
    return
  }
  if (
    confirm(
      `Are you sure you want to delete the event "${eventToDelete.name}"? This action cannot be undone.`
    )
  ) {
    try {
      await api.delete(`/events/${eventToDelete.documentId}`)
      showSnackbar('Event deleted successfully.', 'success')
      await eventsStore.fetchEvents()
    } catch (e) {
      showSnackbar('Failed to delete event.', 'error')
      console.error('Error deleting event:', e)
    }
  }
}

function getScoringProgress(category: CategoryData, judges: JudgeData[], eventScores: ScoreData[]) {
  if (!judges || judges.length === 0) return 'No judges assigned'

  const categoryScores = (eventScores || []).filter((s) => s.category?.id === category.id)
  const assignedJudgeIds = new Set(judges.map((j) => j.id))
  const judgesWhoScored = new Set(categoryScores.map((s: any) => s.judge?.id).filter((id) => id))
  const scoredCount = [...judgesWhoScored].filter((id) => assignedJudgeIds.has(id)).length

  return `${scoredCount} of ${judges.length} judges have scored.`
}
</script>
