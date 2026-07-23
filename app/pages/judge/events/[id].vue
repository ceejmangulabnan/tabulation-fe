<template>
  <div class="mx-auto max-w-7xl px-4 py-6" v-if="event">
    <div class="flex justify-between items-start mb-4 flex-wrap gap-2">
      <header class="flex items-center gap-3 w-full">
        <UBadge :color="statusColor" size="lg" class="font-bold flex-shrink-0 capitalize">
          {{ event?.event_status.toUpperCase() }}
        </UBadge>
      </header>

      <NuxtLink :to="`/judge/events/${eventId}`" class="text-decoration-none hover:underline">
        <div class="flex flex-col gap-1">
          <h1 class="text-xl sm:text-2xl font-bold">{{ event?.name }}</h1>
          <p class="text-sm sm:text-base text-muted">{{ event?.description || 'No description provided.' }}</p>
        </div>
      </NuxtLink>
    </div>

    <UCard class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">Participant Scores</h2>
        <UButton
          label="Score Segment"
          @click="showScoringDialog = true"
          :disabled="!event || !judgeId || !activeSegmentTab || currentSegment?.segment_status !== 'active' || allSegmentsClosed"
        />
      </div>

      <UTabs v-model="activeSegmentTab" :items="segmentTabsItems" />

      <div class="mt-4">
        <div v-if="!segmentsForTabs || segmentsForTabs.length < 1" class="text-center py-4 text-muted">
          No segments found or selected.
        </div>

        <div v-for="segment in segmentsForTabs" :key="segment.id">
          <div v-if="activeSegmentTab === String(segment.id)">
            <EventScoringCard
              v-if="event && judgeId && currentSegment"
              :isAdmin="false"
              :segment="currentSegment"
              :event="event"
              :participants="participants"
              :judgeId="judgeId"
              :readonly="true"
            />
            <p v-if="currentSegment?.segment_status === 'closed'" class="text-error py-4 text-center">
              This segment is closed. You can no longer submit scores.
            </p>
            <p v-if="currentSegment?.segment_status === 'inactive'" class="text-warning py-4 text-center">
              This segment is inactive. You cannot submit scores yet.
            </p>
          </div>
        </div>

        <!-- Final Rankings -->
        <div v-if="allSegmentsClosed && activeSegmentTab === 'final-rankings'">
          <UCard class="mt-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg">Final Rankings</h3>
              <UButton icon="i-lucide-refresh-cw" :loading="eventsStore.isLoading" variant="ghost" size="xs" @click="fetchFinalScores" />
            </div>

            <UTabs v-model="activeGenderTab" :items="genderTabs" class="mb-4" />

            <UTable
              v-if="activeGenderTab === 'male'"
              :data="finalMaleResults"
              :columns="finalRankingsHeaders"
            />
            <UTable
              v-else
              :data="finalFemaleResults"
              :columns="finalRankingsHeaders"
            />
          </UCard>
        </div>
      </div>
    </UCard>

    <!-- Scoring Dialog -->
    <UModal v-model:open="showScoringDialog">
      <UCard class="h-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg">Score Event: {{ event?.name }} - {{ currentSegmentName }}</h3>
          <UButton icon="i-lucide-x" variant="ghost" @click="closeScoringDialog" />
        </div>
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
        <div v-else class="text-center py-4 text-muted">
          No active segment selected for scoring.
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['judge'],
  layout: 'judge',
})

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
  ranking_score?: number
  participant_status?: string
}

interface FinalEventScoresResponse {
  event: { documentId: string; name: string; description: string }
  segments: { documentId: string; name: string; order: number; weight: number; scoring_mode?: string }[]
  results: { male: FinalParticipant[]; female: FinalParticipant[] }
}

const route = useRoute()
const eventsStore = useEventsStore()
const authStore = useAuthStore()
const api = useStrapiApi()
const { showSnackbar } = useSnackbar()

type ParticipantScoreMap = Record<string, number | null | undefined>
type ParticipantWithScores = Omit<ParticipantData, 'scores'> & { scores: ParticipantScoreMap }

const participants = ref<ParticipantWithScores[]>([])

const eventId = computed(() => route.params.id as string)
const event = computed(() => eventsStore.event)
const judgeId = computed(() => authStore.user?.judge?.documentId)

const { displaySegmentAvgRank } = useRankingDisplay(participants)

const activeSegmentTab = ref<number | string | undefined>(undefined)
const activeGenderTab = ref('male')
const showScoringDialog = ref(false)

const genderTabs = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

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
  if (typeof activeSegmentTab.value === 'string' && activeSegmentTab.value !== 'final-rankings') {
    return segmentsForTabs.value.find((s) => String(s.id) === activeSegmentTab.value)
  }
  return null
})

const currentSegmentName = computed(() => currentSegment.value?.name || 'N/A')

function closeScoringDialog() {
  showScoringDialog.value = false
}

const finalMaleResults = ref<FinalParticipant[]>([])
const finalFemaleResults = ref<FinalParticipant[]>([])
const finalSegments = ref<FinalEventScoresResponse['segments']>([])

const finalRankingsHeaders = computed(() => {
  const staticHeaders = [
    { accessorKey: 'participant_number', header: 'No.' },
    { accessorKey: 'name', header: 'Participant' },
    { accessorKey: 'department', header: 'Department' },
  ]
  const segHeaders = finalSegments.value.map((segment) => ({
    accessorKey: `segment_score_${segment.documentId}`,
    header: segment.scoring_mode === 'ranking' ? segment.name : `${segment.name} (${segment.weight * 100}%)`,
  }))
  return [
    ...staticHeaders,
    ...segHeaders,
    { accessorKey: 'averaged_score', header: 'Total Score' },
    { accessorKey: 'rank', header: 'Rank' },
  ]
})

const segmentTabsItems = computed(() => {
  const segTabs = segmentsForTabs.value.map(s => ({
    label: s.name,
    value: String(s.id),
  }))
  if (allSegmentsClosed.value) {
    segTabs.push({ label: 'Final Rankings', value: 'final-rankings' })
  }
  return segTabs
})

async function fetchFinalScores() {
  if (!event.value) { showSnackbar('Event data not available.', 'error'); return }
  eventsStore.isLoading = true
  try {
    const apiUrl = `/judge/events/${event.value.documentId}/scores`
    const { data } = await api.get<FinalEventScoresResponse>(apiUrl)
    finalMaleResults.value = data.results.male.filter((p) => !p.isEliminated)
    finalFemaleResults.value = data.results.female.filter((p) => !p.isEliminated)
    finalSegments.value = data.segments
  } catch (e) {
    showSnackbar('Failed to fetch final scores.', 'error')
    console.error(e)
  } finally { eventsStore.isLoading = false }
}

async function refreshEvent() {
  await eventsStore.fetchEvent(eventId.value)
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
      if (scoreParticipantId === p.documentId && scoreJudgeId === judgeId.value && scoreCategoryId) {
        scores[scoreCategoryId] = score.value
      }
    })
    return { ...p, scores }
  })

  if (allSegmentsClosed.value) {
    await fetchFinalScores()
    activeSegmentTab.value = 'final-rankings'
  } else if (segmentsForTabs.value.length > 0) {
    if (activeSegmentTab.value === 'final-rankings') {
      activeSegmentTab.value = segmentsForTabs.value[0] ? String(segmentsForTabs.value[0].id) : undefined
    } else if (activeSegmentTab.value === null || activeSegmentTab.value === undefined) {
      activeSegmentTab.value = segmentsForTabs.value[0] ? String(segmentsForTabs.value[0].id) : undefined
    }
  } else {
    activeSegmentTab.value = undefined
  }
}

async function handleScoresSubmitted() {
  await refreshEvent()
}

const refreshTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const startAutoRefresh = () => {
  stopAutoRefresh()
  refreshTimer.value = setTimeout(async () => {
    if (!showScoringDialog.value) await refreshEvent()
    startAutoRefresh()
  }, 10000)
}

const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
    refreshTimer.value = null
  }
}

watch(showScoringDialog, (newValue) => {
  if (newValue) stopAutoRefresh()
  else startAutoRefresh()
})

watch(eventId, async (id) => {
  if (!id) return
  stopAutoRefresh()
  await eventsStore.fetchEvent(id)
  startAutoRefresh()
}, { immediate: true })

onMounted(async () => {
  await refreshEvent()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

const statusColor = computed(() => {
  switch (event.value?.event_status) {
    case 'draft': return 'neutral'
    case 'active': return 'success'
    case 'inactive': return 'warning'
    case 'finished': return 'info'
    default: return 'neutral'
  }
})

const allSegmentsClosed = computed(() => {
  if (!event.value?.segments || event.value.segments.length === 0) return false
  return event.value.segments.every((s) => s.segment_status === 'closed')
})

const segmentsForTabs = computed(() => {
  if (!event.value?.segments) return []
  const order = ['active', 'inactive', 'closed']
  return event.value.segments
    .filter((s: SegmentData) =>
      s.segment_status === 'active' || s.segment_status === 'inactive' || s.segment_status === 'closed'
    )
    .sort((a, b) => order.indexOf(a.segment_status) - order.indexOf(b.segment_status))
})
</script>
