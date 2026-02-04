<template>
  <v-container>
    <v-row v-if="event">
      <v-col cols="12">
        <header class="d-flex flex-column ga-sm-4 align-start ga-1 flex-sm-row mb-8">
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

    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title class="d-flex justify-space-between text-h5">
            <span>Participant Scores</span>
          </v-card-title>
          <v-card-text>
            <v-tabs
              v-model="activeSegmentTab"
              background-color="primary"
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
            </v-tabs>

            <v-window v-model="activeSegmentTab">
              <div
                v-if="!segmentsForTabs || segmentsForTabs.length < 1"
                class="text-center"
              >
                No segments found.
              </div>
              <v-window-item
                v-for="segment in segmentsForTabs"
                :key="segment.id"
                :value="segment.id"
              >
                <EventScoringCard
                  v-if="event && judgeId"
                  :isAdmin="false"
                  :segment="segment"
                  :event="event"
                  :participants="participants"
                  :judgeId="judgeId"
                  @scores-submitted="refreshEvent"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['judge'],
  layout: 'judge',
})

const route = useRoute()
const eventsStore = useEventsStore()
const authStore = useAuthStore()

type ParticipantScoreMap = Record<string, number | null | undefined>
type ParticipantWithScores = Omit<ParticipantData, 'scores'> & { scores: ParticipantScoreMap }

const eventId = route.params.id as string
const event = computed(() => eventsStore.event)
const judgeId = computed(() => authStore.user?.judge?.documentId)

const activeSegmentTab = ref<number | null>(null)

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
}

onMounted(async () => {
  await refreshEvent()

  if (segmentsForTabs.value.length > 0) {
    activeSegmentTab.value = segmentsForTabs.value[0]?.id || null
  }
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

<style lang="css" scoped>
.score-input {
  min-width: 100px;
}
</style>
