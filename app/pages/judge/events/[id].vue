<template>
  <v-container fluid>
    <v-row v-if="event">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-top mb-4 flex-wrap ga-2">
          <header
            class="d-flex ml-n1 justify-space-between w-100 ga-sm-3 align-center ga-1 flex-shrink-1"
          >
            <v-chip
              :color="statusColor"
              size="large"
              class="font-weight-bold flex-shrink-0"
            >
              {{ event?.event_status.toUpperCase() }}
            </v-chip>
          </header>

          <NuxtLink
            :to="`/judge/events/${eventId}`"
            class="text-decoration-none text-high-emphasis hover-underline"
          >
            <div class="d-flex flex-column ga-1">
              <h1 class="text-sm-h4 text-h5 mb-2 mb-sm-0 font-weight-bold">
                {{ event?.name }}
              </h1>
              <p class="text-sm-body-1 text-subtitle-2">
                {{ event?.description || 'No description provided.' }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title class="d-flex justify-space-between text-h5">
            <span>Participant Scores</span>
            <v-btn
              color="green"
              @click="showScoringDialog = true"
              :disabled="
                !event ||
                !judgeId ||
                !activeSegmentTab ||
                currentSegment?.segment_status !== 'active' ||
                allSegmentsClosed // New condition to disable scoring if all segments are closed
              "
            >
              Score {{ currentSegmentName }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-tabs
              v-model="activeSegmentTab"
              background-color="primary"
              color="green"
              show-arrows
              dark
            >
              <v-tab
                v-for="segment in segmentsForTabs"
                :key="segment.id"
                :value="segment.id"
              >
                {{ segment.name }}
                <v-chip
                  v-if="segment.segment_status === 'active'"
                  color="green"
                  class="ml-2"
                  size="small"
                  label
                >
                  Active
                </v-chip>
                <v-chip
                  v-if="segment.segment_status === 'closed'"
                  color="red"
                  class="ml-2"
                  size="small"
                  label
                >
                  Closed
                </v-chip>
                <v-chip
                  v-if="segment.segment_status === 'inactive'"
                  color="gray"
                  class="ml-2"
                  size="small"
                  label
                >
                  Inactive
                </v-chip>
              </v-tab>
              <v-tab
                v-if="allSegmentsClosed"
                value="final-rankings"
                @click="fetchFinalScores"
              >
                Final Rankings
              </v-tab>
            </v-tabs>
            <v-window v-model="activeSegmentTab">
              <div
                v-if="!segmentsForTabs || segmentsForTabs.length < 1"
                class="text-center pa-4"
              >
                No segments found or selected.
              </div>
              <v-window-item
                v-for="segment in segmentsForTabs"
                :key="segment.id"
                :value="segment.id"
              >
                <!-- Read-only EventScoringCard for main view -->
                <EventScoringCard
                  v-if="event && judgeId && currentSegment"
                  :isAdmin="false"
                  :segment="currentSegment"
                  :event="event"
                  :participants="participants"
                  :judgeId="judgeId"
                  :readonly="true"
                />
                <p
                  v-if="currentSegment?.segment_status === 'closed'"
                  class="text-error pa-4 text-center"
                >
                  This segment is closed. You can no longer submit scores.
                </p>
                <p
                  v-if="currentSegment?.segment_status === 'inactive'"
                  class="text-warning pa-4 text-center"
                >
                  This segment is inactive. You cannot submit scores yet.
                </p>
              </v-window-item>
              <v-window-item
                v-if="allSegmentsClosed"
                value="final-rankings"
              >
                <v-card class="mt-4">
                  <v-card-title>
                    Final Rankings
                    <v-btn
                      :loading="eventsStore.isLoading"
                      icon
                      color="primary"
                      variant="text"
                      @click="fetchFinalScores"
                      class="ml-2"
                    >
                      <v-icon>mdi-refresh</v-icon>
                      <v-tooltip
                        activator="parent"
                        location="bottom"
                      >
                        Refresh Scores
                      </v-tooltip>
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-tabs
                      color="green"
                      v-model="activeGenderTab"
                      class="mb-4"
                    >
                      <v-tab value="male">Male ({{ finalMaleResults.length }})</v-tab>
                      <v-tab value="female">Female ({{ finalFemaleResults.length }})</v-tab>
                    </v-tabs>

                    <v-window v-model="activeGenderTab">
                      <v-window-item value="male">
                        <v-data-table
                          :headers="finalRankingsHeaders"
                          :items="finalMaleResults"
                          item-key="participant_number"
                          class="elevation-1 participant-table"
                          :sort-by="[{ key: 'rank', order: 'asc' }]"
                        >
                          <template #[`item.headshot`]="{ item }">
                            <v-avatar size="50px">
                              <v-img
                                v-if="item.headshot"
                                :src="getStrapiUrl(item.headshot)"
                                @click="showImagePreview(item.headshot)"
                              ></v-img>
                              <v-icon v-else>mdi-account-circle</v-icon>
                            </v-avatar>
                          </template>
                          <template #[`item.name`]="{ item }">
                            <div class="d-flex align-center py-2">
                              <v-chip
                                v-if="item.isEliminated"
                                color="red"
                                class="mr-2"
                                size="small"
                                label
                              >
                                E
                              </v-chip>
                              <div class="font-weight-bold">{{ item.name }}</div>
                            </div>
                          </template>

                          <template
                            v-for="segment in finalSegments"
                            #[`item.segment_score_${segment.documentId}`]="{ item }"
                            :key="`segment-score-${segment.documentId}-${item.participant_number}`"
                          >
                            {{ item.segment_scores[segment.name]?.averaged_score || '-' }}
                          </template>
                        </v-data-table>
                      </v-window-item>
                      <v-window-item value="female">
                        <v-data-table
                          :headers="finalRankingsHeaders"
                          :items="finalFemaleResults"
                          item-key="participant_number"
                          class="elevation-1 participant-table"
                          :sort-by="[{ key: 'rank', order: 'asc' }]"
                        >
                          <template #[`item.headshot`]="{ item }">
                            <v-avatar size="50px">
                              <v-img
                                v-if="item.headshot"
                                :src="getStrapiUrl(item.headshot)"
                                @click="showImagePreview(item.headshot)"
                              ></v-img>
                              <v-icon v-else>mdi-account-circle</v-icon>
                            </v-avatar>
                          </template>
                          <template #[`item.name`]="{ item }">
                            <div class="d-flex align-center py-2">
                              <v-chip
                                v-if="item.isEliminated"
                                color="red"
                                class="mr-2"
                                size="small"
                                label
                              >
                                E
                              </v-chip>
                              <div class="font-weight-bold">{{ item.name }}</div>
                            </div>
                          </template>
                          <template
                            v-for="segment in finalSegments"
                            #[`item.segment_score_${segment.documentId}`]="{ item }"
                            :key="`segment-score-${segment.documentId}-${item.participant_number}`"
                          >
                            {{ item.segment_scores[segment.name]?.averaged_score || '-' }}
                          </template>
                        </v-data-table>
                      </v-window-item>
                    </v-window>
                  </v-card-text>
                </v-card>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Scoring Dialog -->
    <v-dialog
      v-model="showScoringDialog"
      :scrim="true"
      persistent
      max-width="1400px"
    >
      <v-card>
        <v-toolbar
          dark
          color="green"
        >
          <v-toolbar-title>
            Score Event: {{ event?.name }} - {{ currentSegmentName }}
          </v-toolbar-title>
          <v-spacer></v-spacer>

          <v-btn
            icon
            dark
            @click="closeScoringDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <EventScoringCard
            v-if="event && judgeId && currentSegment"
            :isAdmin="false"
            :segment="currentSegment"
            :event="event"
            :participants="participants"
            :judgeId="judgeId"
            @scores-submitted="handleScoresSubmitted"
            @cancel-scoring="closeScoringDialog"
            @refetch-event="eventsStore.fetchEvent(eventId)"
          />
          <div
            v-else
            class="text-center pa-4"
          >
            No active segment selected for scoring.
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['judge'],
  layout: 'judge',
})

interface DataTableHeader {
  key: string
  title: string
  align?: 'start' | 'end' | 'center'
  sortable?: boolean
  class?: string
  fixed?: 'end' | 'start' | boolean | undefined
}

// Define interfaces for the final scores API response (copied from admin/events/[id]/index.vue)
interface FinalAveragedScore {
  averaged_score: number
  raw_averaged_score: number
}

interface FinalSegmentScores {
  [key: string]: FinalAveragedScore
}

interface FinalParticipant {
  eliminated_at_segment?: SegmentData
  isEliminated: boolean
  participant_number: number
  name: string
  department: string
  gender: 'male' | 'female'
  headshot: string
  segment_scores: FinalSegmentScores
  averaged_score: number
  raw_averaged_score: number
  rank: number
  participant_status?: string
}

interface FinalEventScoresResponse {
  event: {
    documentId: string
    name: string
    description: string
  }
  segments: {
    documentId: string
    name: string
    order: number
    weight: number
  }[]
  results: {
    male: FinalParticipant[]
    female: FinalParticipant[]
  }
}

const route = useRoute()
const eventsStore = useEventsStore()
const authStore = useAuthStore()
const api = useStrapiApi()
const { showSnackbar } = useSnackbar()

type ParticipantScoreMap = Record<string, number | null | undefined>
type ParticipantWithScores = Omit<ParticipantData, 'scores'> & { scores: ParticipantScoreMap }

const eventId = route.params.id as string
const event = computed(() => eventsStore.event)
const judgeId = computed(() => authStore.user?.judge?.documentId)

const activeSegmentTab = ref<number | string | null>(null) // Allow string for 'final-rankings'
const activeGenderTab = ref('male')
const showScoringDialog = ref(false)

const imagePreviewDialog = ref(false)
const imagePreviewUrl = ref<string | undefined>('')

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

const showImagePreview = (url: string) => {
  imagePreviewUrl.value = getStrapiUrl(url)
  imagePreviewDialog.value = true
}

const currentSegment = computed(() => {
  // Check if activeSegmentTab is a number (segment ID)
  if (typeof activeSegmentTab.value === 'number') {
    return segmentsForTabs.value.find((s) => s.id === activeSegmentTab.value)
  }
  return null // If 'final-rankings' or null, return null for currentSegment
})

const currentSegmentName = computed(() => currentSegment.value?.name || 'N/A')

function closeScoringDialog() {
  showScoringDialog.value = false
}

// Refs for final rankings data
const finalMaleResults = ref<FinalParticipant[]>([])
const finalFemaleResults = ref<FinalParticipant[]>([])
const finalSegments = ref<FinalEventScoresResponse['segments']>([])

const finalRankingsHeaders = computed<DataTableHeader[]>(() => {
  const staticHeaders: DataTableHeader[] = [
    {
      title: 'No.',
      key: 'participant_number',
      align: 'start',
      sortable: true,
      fixed: 'start',
    },
    { title: 'Headshot', key: 'headshot', align: 'center', sortable: false },
    { title: 'Participant', key: 'name', align: 'start', sortable: true },
    {
      title: 'Department',
      key: 'department',
      align: 'start',
      sortable: true,
    },
  ]

  const segmentScoreHeaders: DataTableHeader[] = finalSegments.value.map((segment) => ({
    title: `${segment.name} (${segment.weight * 100}%)`,
    key: `segment_score_${segment.documentId}`,
    align: 'end',
    sortable: true,
  }))

  return [
    ...staticHeaders,
    ...segmentScoreHeaders,
    {
      title: 'Total Score',
      key: 'averaged_score',
      align: 'end',
      sortable: true,
    },

    { title: 'Rank', key: 'rank', align: 'end', sortable: true, fixed: 'end' },
  ]
})

async function fetchFinalScores() {
  if (!event.value) {
    showSnackbar('Event data not available.', 'error')
    return
  }

  eventsStore.isLoading = true
  try {
    // Retain the /judge prefix as per user's earlier instruction
    const apiUrl = `/judge/events/${event.value.documentId}/scores`
    const { data } = await api.get<FinalEventScoresResponse>(apiUrl)
    finalMaleResults.value = data.results.male.filter((p) => !p.isEliminated)
    finalFemaleResults.value = data.results.female.filter((p) => !p.isEliminated)
    finalSegments.value = data.segments
  } catch (e) {
    showSnackbar('Failed to fetch final scores.', 'error')
    console.error(e)
  } finally {
    eventsStore.isLoading = false
  }
}

async function refreshEvent() {
  await eventsStore.fetchEvent(eventId)
  const currentEvent = eventsStore.event
  if (!currentEvent?.participants || !judgeId.value) {
    participants.value = []
    return
  }
  participants.value = currentEvent.participants.map((p: ParticipantData) => {
    const scores: ParticipantScoreMap = {}
    currentEvent.scores?.forEach((score: ScoreData) => {
      const scoreParticipantId = score.participant?.documentId
      const scoreJudgeId = score.judge?.documentId
      const scoreCategoryId = score.category?.documentId

      if (
        scoreParticipantId === p.documentId &&
        scoreJudgeId === judgeId.value &&
        scoreCategoryId
      ) {
        scores[scoreCategoryId] = score.value
      }
    })
    return {
      ...p,
      scores,
    }
  })

  // Determine if all segments are closed and set initial tab
  if (allSegmentsClosed.value) {
    await fetchFinalScores()
    activeSegmentTab.value = 'final-rankings'
  } else if (segmentsForTabs.value.length > 0) {
    // If not all segments are closed, but the current tab is 'final-rankings', switch to first segment
    if (activeSegmentTab.value === 'final-rankings') {
      activeSegmentTab.value = segmentsForTabs.value[0]?.id || null
    }
    // If activeSegmentTab is still null or undefined, set it to the first segment
    else if (activeSegmentTab.value === null || activeSegmentTab.value === undefined) {
      activeSegmentTab.value = segmentsForTabs.value[0]?.id || null
    }
  } else {
    activeSegmentTab.value = null
  }
}

async function handleScoresSubmitted() {
  await refreshEvent()
}

// Start auto-refresh logic
const refreshTimer = ref<NodeJS.Timeout | null>(null)

const startAutoRefresh = () => {
  console.log('startAutoRefresh: Current eventId', eventId.value)
  stopAutoRefresh() // Clear any existing timer first
  refreshTimer.value = setTimeout(async () => {
    // Only refresh if the scoring dialog is NOT open
    if (!showScoringDialog.value) {
      console.log('Auto-refreshing event data for eventId', eventId.value)
      await refreshEvent()
    }
    startAutoRefresh() // Restart the timer for the next interval
  }, 10000) // 10 seconds
}

const stopAutoRefresh = () => {
  console.log('stopAutoRefresh: Stopping timer for eventId', eventId.value)
  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
    refreshTimer.value = null
  }
}

watch(showScoringDialog, (newValue) => {
  if (newValue) {
    stopAutoRefresh() // Stop when dialog opens
  } else {
    startAutoRefresh() // Restart when dialog closes
  }
})

watch(
  eventId,
  async (id) => {
    console.log('eventId watcher: id changed to', id)
    if (!id) return
    stopAutoRefresh() // Stop any ongoing refresh for the previous event
    await eventsStore.fetchEvent(id)
    startAutoRefresh() // Start refresh for the new event
    console.log('eventId watcher: auto-refresh started for id', id)
  },
  { immediate: true }
)

onMounted(async () => {
  console.log('onMounted: Component mounted, initial eventId', eventId.value)
  await refreshEvent()
  startAutoRefresh() // Start auto-refresh after initial load
})

onUnmounted(() => {
  console.log('onUnmounted: Component unmounted, eventId was', eventId.value)
  stopAutoRefresh() // Stop auto-refresh when component is unmounted
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

const allSegmentsClosed = computed(() => {
  if (!event.value?.segments || event.value.segments.length === 0) {
    return false
  }
  return event.value.segments.every((s) => s.segment_status === 'closed')
})

const segmentsForTabs = computed(() => {
  if (!event.value?.segments) return []

  const order = ['active', 'inactive', 'closed']

  return event.value.segments
    .filter(
      (s: SegmentData) =>
        s.segment_status === 'active' ||
        s.segment_status === 'inactive' ||
        s.segment_status === 'closed'
    )
    .sort((a, b) => order.indexOf(a.segment_status) - order.indexOf(b.segment_status))
})

const participants = ref<ParticipantWithScores[]>([])
</script>
