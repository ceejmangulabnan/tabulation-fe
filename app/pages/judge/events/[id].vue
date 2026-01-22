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
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>Participant Scores</span>
            <v-chip
              color="primary"
              variant="flat"
            >
              My Judge ID: {{ judgeId }}
            </v-chip>
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
                  Closed
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
                <v-card flat>
                  <v-card-text>
                    <v-tabs
                      v-model="activeGenderTab"
                      background-color="secondary"
                      show-arrows
                      dark
                    >
                      <v-tab
                        v-for="gender in genders"
                        :key="gender.key"
                        :value="gender.key"
                      >
                        {{ gender.label }}
                      </v-tab>
                    </v-tabs>

                    <v-window v-model="activeGenderTab">
                      <v-window-item
                        v-for="gender in genders"
                        :key="gender.key"
                        :value="gender.key"
                      >
                        <v-data-table
                          v-if="!smAndDown"
                          :headers="getTableHeaders(segment)"
                          :items="getParticipantsByGender(gender.key)"
                          item-value="id"
                          class="elevation-1"
                          :loading="eventsStore.isLoading"
                          :readonly="segment.segment_status === 'closed'"
                        >
                          <template v-slot:item.name="{ item }">
                            <div class="d-flex align-center py-2">
                              <v-avatar
                                v-if="item.headshot?.formats?.thumbnail?.url"
                                :image="getStrapiUrl(item.headshot.formats.thumbnail.url)"
                                icon="mdi-account"
                                class="mr-3"
                                size="40"
                              />
                              <v-avatar
                                v-else
                                icon="mdi-account"
                                class="mr-3"
                                size="40"
                              />
                              <div class="font-weight-bold">{{ item.name }}</div>
                            </div>
                          </template>

                          <template v-slot:item.department="{ item }">
                            {{ item.department?.name || 'N/A' }}
                          </template>

                          <template
                            v-for="category in segment.categories"
                            :key="category.id"
                            v-slot:[`item.category_${category.id}`]="{ item }"
                          >
                            <div class="my-2">
                              <v-text-field
                                v-model.number="item.scores[category.id]"
                                type="number"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                                :rules="scoreRules"
                                min="0"
                                max="10"
                                step="0.1"
                                maxlength="4"
                                style="max-width: 80px"
                                :readonly="segment.segment_status === 'closed'"
                              />
                            </div>
                          </template>

                          <template v-slot:item.total_score="{ item }">
                            <div class="font-weight-bold">
                              {{ calculateTotalScore(item, segment) }}
                            </div>
                          </template>

                          <template v-slot:no-data>
                            <div class="pa-4 text-center">
                              No participants found for this gender.
                            </div>
                          </template>
                        </v-data-table>

                        <!-- Mobile View -->
                        <v-list
                          v-else
                          lines="three"
                        >
                          <v-list-item
                            v-for="item in getParticipantsByGender(gender.key)"
                            :key="item.id"
                            class="pa-0"
                          >
                            <v-card>
                              <v-card-title class="d-flex align-center">
                                <v-avatar
                                  v-if="item.headshot?.formats?.thumbnail?.url"
                                  :image="getStrapiUrl(item.headshot.formats.thumbnail.url)"
                                  icon="mdi-account"
                                  class="mr-3"
                                  size="40"
                                />
                                <v-avatar
                                  v-else
                                  icon="mdi-account"
                                  class="mr-3"
                                  size="40"
                                />
                                <div>
                                  <div class="font-weight-bold text-wrap text-subtitle-1">
                                    {{ item.name }}
                                  </div>
                                  <div class="text-caption">
                                    {{ item.department?.name || 'N/A' }}
                                  </div>
                                </div>
                              </v-card-title>
                              <v-card-text>
                                <v-row
                                  v-for="category in segment.categories"
                                  :key="category.id"
                                  align="center"
                                  class="d-flex justify-space-between"
                                >
                                  <v-col
                                    cols="6"
                                    class="text-subtitle-1"
                                  >
                                    {{ category.name }} ({{ (category.weight * 100).toFixed(0) }}%)
                                  </v-col>
                                  <v-col cols="6">
                                    <v-text-field
                                      align="end"
                                      class="ml-auto"
                                      v-model.number="item.scores[category.id]"
                                      type="number"
                                      variant="outlined"
                                      density="compact"
                                      hide-details="auto"
                                      :rules="scoreRules"
                                      min="0"
                                      max="10"
                                      step="0.1"
                                      maxlength="4"
                                      style="max-width: 80px"
                                      :readonly="segment.segment_status === 'closed'"
                                    />
                                  </v-col>
                                </v-row>
                              </v-card-text>
                              <v-card-actions>
                                <v-spacer />
                                <span class="font-weight-bold text-subtitle-1">
                                  Total Segment Score: {{ calculateTotalScore(item, segment) }} /
                                  100
                                </span>
                              </v-card-actions>
                            </v-card>
                          </v-list-item>
                        </v-list>
                      </v-window-item>
                    </v-window>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      v-if="segment.segment_status !== 'closed'"
                      color="primary"
                      variant="flat"
                      @click="submitScores(segment)"
                    >
                      Submit Scores for {{ segment.name }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
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
  middleware: ['judge', 'auth'],
  layout: 'judge',
})

const scoreRules = [
  (v: number | null | undefined | string) => {
    if (v === null || v === undefined || v === '') return true
    const numericValue = parseFloat(v as string)
    return (numericValue >= 0 && numericValue <= 10) || 'Score must be between 0 and 10'
  },
]

const { smAndDown } = useDisplay()
const route = useRoute()
const eventsStore = useEventsStore()
const authStore = useAuthStore()
const { showSnackbar } = useSnackbar()
const api = useStrapiApi()

// Represents a map of categoryId -> score for a single participant, used for v-model.
type ParticipantScoreMap = Record<number, number | null | undefined>

const eventId = route.params.id as string
const event = computed(() => eventsStore.event)
const judgeId = computed(() => authStore.user?.judge?.id)

const activeSegmentTab = ref<number | null>(null)
const activeGenderTab = ref<string>('male')

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

onMounted(async () => {
  await eventsStore.fetchEvent(eventId)
  const currentEvent = eventsStore.event
  if (!currentEvent?.participants || !judgeId.value) {
    participants.value = []
    return
  }
  participants.value = currentEvent.participants.map((p: ParticipantData) => {
    const scores: ParticipantScoreMap = {}
    currentEvent.scores?.forEach((score: ScoreData) => {
      const scoreParticipantId = score.participant?.id
      const scoreJudgeId = score.judge?.id
      const scoreCategoryId = score.category?.id

      if (scoreParticipantId === p.id && scoreJudgeId === judgeId.value && scoreCategoryId) {
        scores[scoreCategoryId] = score.value
      }
    })
    return {
      ...p,
      scores,
    }
  })

  if (segmentsForTabs.value.length > 0) {
    activeSegmentTab.value = segmentsForTabs.value[0]?.id || null
  }
})

const genders = [
  {
    key: 'male',
    label: 'Male',
  },
  {
    key: 'female',
    label: 'Female',
  },
  {
    key: 'other',
    label: 'Other',
  },
]

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

type ParticipantWithScores = Omit<ParticipantData, 'scores'> & { scores: ParticipantScoreMap }
const participants = ref<ParticipantWithScores[]>([])

function getTableHeaders(segment: SegmentData) {
  const categoryHeaders =
    segment.categories?.map((category: CategoryData) => ({
      title: `${category.name} (${category.weight * 100}%)`,
      value: `category_${category.id}`,
      sortable: false,
    })) || []

  return [
    { title: 'No.', value: 'number', sortable: true, width: '10' },
    { title: 'Name', value: 'name', sortable: true, width: '250' },
    { title: 'Department', value: 'department', sortable: true },
    ...categoryHeaders,
    { title: 'Total Score', value: 'total_score', sortable: false, width: '120' },
  ]
}

function getParticipantsByGender(gender: string) {
  return participants.value.filter((p) => p.gender === gender).sort((a, b) => a.number - b.number)
}

function calculateTotalScore(participant: ParticipantWithScores, segment: SegmentData) {
  if (!segment.categories) return 0
  const total = segment.categories.reduce((acc, category) => {
    const score = participant.scores[category.id]
    if (score !== null && score !== undefined) {
      return acc + score * category.weight
    }
    return acc
  }, 0)
  const finalTotal = total * 10
  return finalTotal.toFixed(2)
}

async function submitScores(segment: SegmentData) {
  console.log('Clicked Submit')
  if (!judgeId.value) {
    showSnackbar('Judge ID not found.', 'error')
    return
  }

  const segmentParticipants = participants.value.filter((p) =>
    segment.categories.some((c) => p.scores[c.id] !== undefined)
  )

  const promises = []

  for (const p of segmentParticipants) {
    for (const category of segment.categories) {
      const scoreValue = p.scores[category.id]
      const existingScore = event.value?.scores?.find(
        (s: ScoreData) =>
          s.participant?.id === p.id &&
          s.category?.id === category.id &&
          s.judge?.id === judgeId.value
      )

      if (existingScore) {
        if (scoreValue === null || scoreValue === undefined) {
          // Delete score if it's cleared
          promises.push(api.delete(`/scores/${existingScore.documentId}`))
        } else if (existingScore.value !== scoreValue) {
          // Update only if the score has changed
          promises.push(
            api.put(`/scores/${existingScore.documentId}`, { data: { value: scoreValue } })
          )
        }
      } else if (scoreValue !== null && scoreValue !== undefined) {
        // Create if it's a new score
        promises.push(
          api.post('/scores', {
            data: {
              value: scoreValue,
              participant: p.id,
              category: category.id,
              judge: judgeId.value,
              event: eventId,
              segment: segment.id,
            },
          })
        )
      }
    }
  }

  if (promises.length === 0) {
    showSnackbar('No changes to submit.', 'info')
    return
  }

  try {
    await Promise.all(promises)
    showSnackbar('Scores submitted successfully!', 'success')
    // Refresh event data to get the latest scores
    await eventsStore.fetchEvent(eventId)
  } catch (error) {
    console.error('Failed to submit scores:', error)
    showSnackbar('Failed to submit some scores.', 'error')
  }
}
</script>
