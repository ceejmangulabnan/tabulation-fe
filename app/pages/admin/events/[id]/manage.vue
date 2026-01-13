<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <header class="d-flex flex-column ga-sm-4 align-start ga-1 flex-sm-row">
          <v-chip
            :color="statusColor"
            size="large"
            class="font-weight-bold flex-shrink-0"
          >
            {{ event?.event_status.toUpperCase() }}
          </v-chip>
          <div>
            <h1 class="text-h4 mb-2 mb-sm-0">
              {{ event?.name }}
            </h1>
            <p>
              {{ event?.description || 'No description provided.' }}
            </p>
          </div>
        </header>
      </v-col>
    </v-row>

    <v-tabs
      v-model="activeTab"
      class="my-4"
    >
      <v-tab value="scores">Scores</v-tab>
      <v-tab value="segments">Segment Management</v-tab>
      <v-tab value="progress">Scoring Progress</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="scores">
        <v-card>
          <v-card-title>Participant Scores</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedSegmentId"
              :items="event?.segments"
              item-title="name"
              item-value="id"
              label="Select Segment"
              variant="outlined"
              class="mb-4"
              clearable
              hide-details
            ></v-select>

            <v-tabs
              v-model="activeGenderTab"
              class="mt-4"
            >
              <v-tab value="male">Male Participants</v-tab>
              <v-tab value="female">Female Participants</v-tab>
            </v-tabs>

            <v-window v-model="activeGenderTab">
              <v-window-item value="male">
                <v-card flat>
                  <v-card-text>
                    <!-- Data table for male participants scores -->
                    <v-data-table
                      :headers="scoreTableHeaders"
                      :items="maleParticipantsScores"
                      item-key="id"
                      class="elevation-1"
                    >
                      <template #item.name="{ item }">
                        <div class="d-flex align-center py-2">
                          <v-avatar
                            :image="item.headshot?.formats.thumbnail.url"
                            icon="mdi-account"
                            class="mr-3"
                            size="40"
                          ></v-avatar>
                          <div class="font-weight-bold">{{ item.name }}</div>
                        </div>
                      </template>
                      <template #no-data>No male participants for this segment.</template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <v-window-item value="female">
                <v-card flat>
                  <v-card-text>
                    <!-- Data table for female participants scores -->
                    <v-data-table
                      :headers="scoreTableHeaders"
                      :items="femaleParticipantsScores"
                      item-key="id"
                      class="elevation-1"
                    >
                      <template #item.name="{ item }">
                        <div class="d-flex align-center py-2">
                          <v-avatar
                            :image="item.headshot?.formats.thumbnail.url"
                            icon="mdi-account"
                            class="mr-3"
                            size="40"
                          ></v-avatar>
                          <div class="font-weight-bold">{{ item.name }}</div>
                        </div>
                      </template>
                      <template #no-data>No female participants for this segment.</template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-window-item>

      <v-window-item value="segments">
        <v-card>
          <v-card-title>Segment Management</v-card-title>
          <v-card-text>
            <v-list v-if="event?.segments?.length">
              <v-list-item
                v-for="segment in event.segments"
                :key="segment.id"
                class="mb-4"
              >
                <v-list-item-title class="font-weight-bold">
                  {{ segment.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Order: {{ segment.order }} | Weight: {{ segment.weight * 100 }}%
                </v-list-item-subtitle>
                <template #append>
                  <v-select
                    :model-value="segment.segment_status"
                    :items="['draft', 'inactive', 'active', 'closed']"
                    label="Status"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="ms-4"
                    style="width: 150px"
                    @update:model-value="updateSegmentStatus(segment.id, $event)"
                  ></v-select>
                </template>
              </v-list-item>
            </v-list>
            <div
              v-else
              class="text-center pa-4 text-grey-darken-1"
            >
              No segments defined for this event.
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <v-window-item value="progress">
        <v-card>
          <v-card-title>Scoring Progress</v-card-title>
          <v-card-text>
            <div v-if="!event?.segments || event.segments.length === 0">
              No segments defined for this event.
            </div>
            <v-list v-else>
              <v-list-item
                v-for="segment in event?.segments"
                :key="segment.id"
                class="mb-3"
              >
                <v-list-item-title class="font-weight-bold">
                  {{ segment.name }}
                </v-list-item-title>
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
                      Scoring Progress:
                      {{ getScoringProgress(category, event?.judges || [], event?.scores || []) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="!segment.categories || segment.categories.length === 0">
                    <v-list-item-title class="text-grey">
                      No categories in this segment.
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const eventsStore = useEventsStore()

const eventId = route.params.id as string
const event = computed(() => eventsStore.event)

onMounted(async () => {
  await eventsStore.fetchEvent(eventId)
  console.log('Event:', event.value)
})

const statusColor = computed(() => {
  switch (event.value?.event_status) {
    case 'draft':
      return 'grey'
    case 'active':
      return 'green'
    case 'inactive':
      return 'orange'
    case 'finished':
      return 'blue'
    default:
      return 'grey'
  }
})

const activeTab = ref('scores')
const activeGenderTab = ref('male')
const selectedSegmentId = ref<number | null>(null)

const selectedSegment = computed(() => {
  return event.value?.segments?.find((s) => s.id === selectedSegmentId.value) || null
})

// Helper function to get scores for a participant in a specific segment
function getParticipantScoresForSegment(
  participant: ParticipantData,
  segment: SegmentData,
  allScores: ScoreData[]
) {
  const scores: { [key: string]: number | string } = {
    id: participant.id,
    name: participant.name,
    number: participant.number,
  }

  if (!segment.categories) {
    return scores
  }

  segment.categories.forEach((category) => {
    const score = allScores.find(
      (s) =>
        s.participant?.id === participant.id &&
        s.segment?.id === segment.id &&
        s.category?.id === category.id
    )
    scores[`category_${category.id}`] = score ? score.value : 'N/A'
  })

  return scores
}

const scoreTableHeaders = computed(() => {
  const headers = [
    { title: 'No.', value: 'number', sortable: true, width: '10' },
    { title: 'Name', value: 'name', sortable: true },
  ]

  if (selectedSegment.value && selectedSegment.value.categories) {
    selectedSegment.value.categories.forEach((category) => {
      headers.push({
        title: category.name,
        value: `category_${category.id}`,
        sortable: false,
      })
    })
  }
  return headers
})

const maleParticipantsScores = computed(() => {
  if (!event.value?.participants || !selectedSegment.value || !event.value?.scores) {
    return []
  }
  const maleParticipants = event.value.participants
    .filter((p) => p.gender === 'male')
    .sort((a, b) => a.number - b.number)
  return maleParticipants.map((p) =>
    getParticipantScoresForSegment(p, selectedSegment.value!, event.value!.scores)
  )
})

const femaleParticipantsScores = computed(() => {
  if (!event.value?.participants || !selectedSegment.value || !event.value?.scores) {
    return []
  }
  const femaleParticipants = event.value.participants
    .filter((p) => p.gender === 'female')
    .sort((a, b) => a.number - b.number)
  return femaleParticipants.map((p) =>
    getParticipantScoresForSegment(p, selectedSegment.value!, event.value!.scores)
  )
})

const api = useStrapiApi()

async function updateSegmentStatus(segmentId: number, newStatus: SegmentData['segment_status']) {
  try {
    await api.put(`/segments/${segmentId}`, {
      data: {
        segment_status: newStatus,
      },
    })
    await eventsStore.fetchEvent(eventId)
    console.log('Segment status updated successfully!')
  } catch (error) {
    console.error('Error updating segment status:', error)
  }
}

// Add the getScoringProgress function
function getScoringProgress(category: CategoryData, judges: JudgeData[], eventScores: ScoreData[]) {
  if (!judges || judges.length === 0) return 'No judges assigned'

  // Filter scores for the current category
  const categoryScores = (eventScores || []).filter((s) => s.category?.id === category.id)

  const assignedJudgeIds = new Set(judges.map((j) => j.id))
  const judgesWhoScored = new Set(
    categoryScores.map((s: ScoreData) => s.judge?.id).filter((id) => id)
  )

  const scoredCount = [...judgesWhoScored].filter((id) => assignedJudgeIds.has(id)).length

  return `${scoredCount} of ${judges.length} judges have scored.`
}

// Initialize selectedSegmentId if segments are available
watch(
  () => event.value?.segments,
  (newSegments) => {
    if (newSegments && newSegments.length > 0 && selectedSegmentId.value === null) {
      selectedSegmentId.value = newSegments[0]?.id || 0
    }
  },
  { immediate: true }
)
</script>
