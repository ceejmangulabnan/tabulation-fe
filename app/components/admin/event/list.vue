<template>
  <div>
    <div class="d-flex justify-space-between align-center w-100 mb-4">
      <h2 class="text-h5">All Events</h2>
      <v-btn
        color="green"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Create Event
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="eventsStore.events"
      :loading="eventsStore.isLoading"
      show-expand
      item-value="id"
      class="border rounded-lg"
    >
      <template #item.name="{ item }">
        <NuxtLink
          :to="`/admin/events/${item.id}`"
          class="font-weight-bold"
        >
          {{ item.name }}
        </NuxtLink>
      </template>

      <template #item.event_status="{ item }">
        <v-chip
          size="small"
          :color="getStatusColor(item.event_status)"
          variant="tonal"
        >
          {{ item.event_status }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex flex-nowrap">
          <v-btn
            icon="mdi-pencil"
            variant="text"
            :to="`/admin/events/${item.id}/setup`"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            variant="text"
            color="error"
            @click="deleteEvent(item)"
          ></v-btn>
          <v-btn
            icon="mdi-arrow-right"
            variant="text"
            :to="`/admin/events/${item.id}`"
          ></v-btn>
        </div>
      </template>

      <template #expanded-row="{ columns, item }">
        <td :colspan="columns.length">
          <v-card
            class="ma-4"
            variant="tonal"
          >
            <v-card-title>Segment & Scoring Overview</v-card-title>
            <v-card-text>
              <div v-if="!item.segments || item.segments.length === 0">
                No segments defined for this event.
              </div>
              <div
                v-for="segment in item.segments"
                :key="segment.id"
                class="mb-4"
              >
                <h4 class="font-weight-bold">
                  {{ segment.name }} (Weight: {{ segment.weight * 100 }}%)
                </h4>
                <v-list
                  density="compact"
                  class="bg-transparent"
                >
                  <v-list-item
                    v-for="category in segment.categories"
                    :key="category.id"
                  >
                    <v-list-item-title>{{ category.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      Scoring Progress: {{ getScoringProgress(category, item.judges, item.scores) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="!segment.categories || segment.categories.length === 0">
                    <v-list-item-title class="text-grey">
                      No categories in this segment.
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </div>
            </v-card-text>
          </v-card>
        </td>
      </template>
    </v-data-table>

    <v-dialog
      v-model="showCreateDialog"
      max-width="600px"
    >
      <AdminEventCreate @close="showCreateDialog = false" />
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const eventsStore = useEventsStore()
const api = useStrapiApi()
const snackbar = useSnackbar()
const showCreateDialog = ref(false)

onMounted(async () => {
  await eventsStore.fetchEvents()
})

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Status', key: 'event_status' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
  { key: 'data-table-expand', sortable: false },
]

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'grey'
    case 'active':
      return 'green'
    case 'finished':
      return 'blue'
    default:
      return 'default'
  }
}

const deleteEvent = async (eventToDelete: EventData) => {
  if (!eventToDelete.documentId) {
    snackbar.showSnackbar('Event data not available for deletion.', 'error')
    return
  }
  if (
    confirm(
      `Are you sure you want to delete the event "${eventToDelete.name}"? This action cannot be undone.`
    )
  ) {
    try {
      await api.delete(`/events/${eventToDelete.documentId}`)
      snackbar.showSnackbar('Event deleted successfully.', 'success')
      await eventsStore.fetchEvents() // Refresh the list
    } catch (e) {
      snackbar.showSnackbar('Failed to delete event.', 'error')
      console.error('Error deleting event:', e)
    }
  }
}

function getScoringProgress(category: CategoryData, judges: JudgeData[], eventScores: ScoreData[]) {
  if (!judges || judges.length === 0) return 'No judges assigned'

  // Filter scores for the current category
  const categoryScores = (eventScores || []).filter((s) => s.category?.id === category.id)

  const assignedJudgeIds = new Set(judges.map((j) => j.id))
  const judgesWhoScored = new Set(categoryScores.map((s: any) => s.judge?.id).filter((id) => id))

  const scoredCount = [...judgesWhoScored].filter((id) => assignedJudgeIds.has(id)).length

  return `${scoredCount} of ${judges.length} judges have scored.`
}
</script>
