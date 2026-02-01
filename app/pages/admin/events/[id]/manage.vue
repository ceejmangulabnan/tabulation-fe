<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-top mb-4 flex-wrap ga-2">
          <header class="d-flex flex-column w-100 ga-sm-3 align-start ga-1 flex-shrink-1">
            <v-chip
              :color="statusColor"
              size="large"
              class="font-weight-bold flex-shrink-0 ml-n1"
            >
              {{ event?.event_status.toUpperCase() }}
            </v-chip>
            <div class="d-flex flex-column ga-1">
              <h1 class="text-sm-h4 text-h5 mb-2 mb-sm-0 font-weight-bold">
                {{ event?.name }}
              </h1>
              <p class="text-sm-body-1 text-subtitle-2">
                {{ event?.description || 'No description provided.' }}
              </p>
            </div>
          </header>
        </div>
      </v-col>
    </v-row>

    <v-tabs
      v-model="activeTab"
      class="my-4"
    >
      <v-tab value="view-scores">View Scores</v-tab>
      <v-tab value="update-scores">Update Scores</v-tab>
      <v-tab value="segments">Segment Management</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="view-scores">
        <v-card>
          <v-card-title>Participant Scores</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedSegmentId"
              :items="event?.segments"
              item-title="name"
              item-value="documentId"
              label="Select Segment"
              variant="outlined"
              class="mb-4"
              clearable
              hide-details
            ></v-select>
            <v-btn
              variant="outlined"
              color="primary"
              @click="showPrintDialog = true"
            >
              Print Rankings
            </v-btn>
            <v-btn
              variant="flat"
              color="info"
              class="ml-2"
              @click="refreshEventData"
              :loading="eventsStore.isLoading"
            >
              <v-icon
                start
                icon="mdi-refresh"
              ></v-icon>
              Refetch Scores
            </v-btn>

            <v-tabs
              v-model="activeGenderTab"
              class="mt-4"
            >
              <v-tab value="male">Male Participants</v-tab>
              <v-tab value="female">Female Participants</v-tab>
            </v-tabs>

            <v-window v-model="activeGenderTab">
              <v-window-item value="male">
                <v-data-table
                  :headers="scoreTableHeaders"
                  :items="maleParticipantsData"
                  item-value="id"
                  show-expand
                  class="elevation-1"
                >
                  <template #item.name="{ item }">
                    <div class="d-flex align-center py-2">
                      <v-avatar
                        v-if="item.headshot"
                        :image="getStrapiUrl(item.headshot.formats.thumbnail.url)"
                        class="mr-3"
                        size="40"
                        @click="showImagePreview(item.headshot.url)"
                      />
                      <v-avatar
                        v-else
                        icon="mdi-account"
                        class="mr-3"
                        size="40"
                      />
                      <div class="font-weight-bold">{{ item.name }}</div>
                      <v-chip
                        v-if="item.isEliminated"
                        color="red"
                        class="ml-2"
                        size="small"
                        label
                      >
                        Eliminated
                      </v-chip>
                    </div>
                  </template>

                  <template #item.department.name="{ value }">
                    {{ value || 'N/A' }}
                  </template>

                  <template #item.totalSegmentScorePercent="{ value }">
                    <strong class="text-h6">{{ value }}%</strong>
                  </template>

                  <template #expanded-row="{ columns, item }">
                    <tr>
                      <td :colspan="columns.length">
                        <v-card
                          flat
                          class="my-4"
                        >
                          <v-card-text>
                            <div class="text-h6 mb-2">Score Details</div>
                            <v-expansion-panels v-if="selectedSegment?.categories?.length">
                              <v-expansion-panel
                                v-for="cat in selectedSegment?.categories"
                                :key="cat.id"
                              >
                                <v-expansion-panel-title>
                                  <div class="d-flex justify-space-between w-100 align-center">
                                    <span>
                                      {{ cat.name }} ({{ Math.round(cat.weight * 100) }}%)
                                    </span>
                                    <strong class="mr-4">
                                      Avg:
                                      {{
                                        getParticipantCategoryAverage(item.documentId, cat).toFixed(
                                          2
                                        )
                                      }}
                                    </strong>
                                  </div>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                  <v-list density="compact">
                                    <v-list-item
                                      v-for="judge in event?.judges"
                                      :key="judge.id"
                                    >
                                      <v-list-item-title>{{ judge.name }}</v-list-item-title>
                                      <template #append>
                                        <strong class="ml-4">
                                          {{
                                            getParticipantScoreForCategoryByJudge(
                                              item.documentId,
                                              cat.documentId,
                                              judge.documentId
                                            )
                                          }}
                                        </strong>
                                      </template>
                                    </v-list-item>
                                  </v-list>
                                </v-expansion-panel-text>
                              </v-expansion-panel>
                            </v-expansion-panels>
                          </v-card-text>
                        </v-card>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-window-item>
              <v-window-item value="female">
                <v-data-table
                  :headers="scoreTableHeaders"
                  :items="femaleParticipantsData"
                  item-value="id"
                  show-expand
                  class="elevation-1"
                >
                  <template #item.name="{ item }">
                    <div class="d-flex align-center py-2">
                      <v-avatar
                        v-if="item.headshot"
                        :image="getStrapiUrl(item.headshot.formats.thumbnail.url)"
                        @click="showImagePreview(item.headshot.url)"
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
                      <v-chip
                        v-if="item.isEliminated"
                        color="red"
                        class="ml-2"
                        size="small"
                        label
                      >
                        Eliminated
                      </v-chip>
                    </div>
                  </template>

                  <template #item.department.name="{ value }">
                    {{ value || 'N/A' }}
                  </template>

                  <template #item.totalSegmentScorePercent="{ value }">
                    <strong class="text-h6">{{ value }}%</strong>
                  </template>

                  <template #expanded-row="{ columns, item }">
                    <tr>
                      <td :colspan="columns.length">
                        <v-card
                          flat
                          class="my-4"
                        >
                          <v-card-text>
                            <div class="text-h6 mb-2">Score Details</div>
                            <v-expansion-panels v-if="selectedSegment?.categories?.length">
                              <v-expansion-panel
                                v-for="cat in selectedSegment?.categories"
                                :key="cat.id"
                              >
                                <v-expansion-panel-title>
                                  <div class="d-flex justify-space-between w-100 align-center">
                                    <span>
                                      {{ cat.name }} ({{ Math.round(cat.weight * 100) }}%)
                                    </span>
                                    <strong class="mr-4">
                                      Avg:
                                      {{
                                        getParticipantCategoryAverage(item.documentId, cat).toFixed(
                                          2
                                        )
                                      }}
                                    </strong>
                                  </div>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                  <v-list density="compact">
                                    <v-list-item
                                      v-for="judge in event?.judges"
                                      :key="judge.id"
                                    >
                                      <v-list-item-title>{{ judge.name }}</v-list-item-title>
                                      <template #append>
                                        <strong class="ml-4">
                                          {{
                                            getParticipantScoreForCategoryByJudge(
                                              item.documentId,
                                              cat.documentId,
                                              judge.documentId
                                            )
                                          }}
                                        </strong>
                                      </template>
                                    </v-list-item>
                                  </v-list>
                                </v-expansion-panel-text>
                              </v-expansion-panel>
                            </v-expansion-panels>
                          </v-card-text>
                        </v-card>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-window-item>

      <v-window-item value="update-scores">
        <v-card>
          <v-card-title>Update Scores on Behalf of a Judge</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedJudgeId"
              :items="event?.judges"
              item-title="name"
              item-value="documentId"
              label="Select Judge"
              variant="outlined"
              class="mb-4"
              hide-details
            ></v-select>

            <v-select
              v-model="selectedSegmentId"
              :items="event?.segments"
              item-title="name"
              item-value="documentId"
              label="Select Segment"
              variant="outlined"
              class="mb-4"
              clearable
              hide-details
            ></v-select>

            <template v-if="selectedJudgeId && selectedSegment">
              <EventScoringCard
                :isAdmin="true"
                :segment="selectedSegment"
                :event="event"
                :participants="participantsWithScoresForJudge"
                :judgeId="selectedJudgeId"
                @scores-submitted="refreshEvent"
              />
            </template>
            <div
              v-else
              class="text-center pa-4 text-grey-darken-1"
            >
              Please select a judge and a segment to start scoring.
            </div>
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
                class="mb-4 d-flex align-start justify-space-between w-100"
              >
                <v-list-item-title class="font-weight-bold">
                  {{ segment.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Order: {{ segment.order }} | Weight: {{ segment.weight * 100 }}% | Total Weight of
                  Categories: {{ segmentTotalWeight(segment) * 100 }}%
                </v-list-item-subtitle>

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
                      Weight: {{ category.weight * 100 }}%
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                      Scoring Progress:
                      {{ getScoringProgress(category, event?.judges || [], event?.scores || []) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>

                <template #append>
                  <v-select
                    :model-value="pendingSegmentChanges[segment.id] || segment.segment_status"
                    :items="['draft', 'inactive', 'active', 'closed']"
                    label="Status"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="ms-4 align-self-auto"
                    style="width: 150px"
                    @update:model-value="handleStatusChange(segment.id, $event)"
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

            <v-card-actions v-if="Object.keys(pendingSegmentChanges).length > 0">
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="submitSegmentChanges"
              >
                Submit Changes
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

    <v-dialog
      v-model="imagePreviewDialog"
      max-width="500px"
    >
      <v-card>
        <v-img :src="imagePreviewUrl" />
      </v-card>
    </v-dialog>

    <!-- Print Rankings Dialog -->
    <v-dialog
      v-model="showPrintDialog"
      max-width="700px"
    >
      <v-card>
        <v-card-title>Print Rankings</v-card-title>
        <v-card-text>
          <v-select
            v-model="printType"
            :items="[
              { title: 'Per Segment', value: 'segment' },
              { title: 'Per Category', value: 'category' },
              { title: 'Final Ranking', value: 'final' },
            ]"
            label="Ranking Type"
          />
          <v-select
            v-if="printType !== 'final'"
            v-model="selectedSegmentId"
            :items="event?.segments"
            item-title="name"
            item-value="documentId"
            label="Segment"
            @update:model-value="printCategoryId = null"
          />
          <v-select
            v-if="printType === 'category'"
            v-model="printCategoryId"
            :items="segmentCategories"
            item-title="title"
            item-value="value"
            label="Category"
          />
          <v-select
            v-model="printGender"
            :items="[
              { title: 'Both', value: 'both' },
              { title: 'Male', value: 'male' },
              { title: 'Female', value: 'female' },
            ]"
            label="Gender"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showPrintDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmPrint"
          >
            Print
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Printable Rankings Component (hidden, used for PDF only) -->
    <PrintableRankings
      v-if="event"
      ref="printableRef"
      :male="maleRankings"
      :female="femaleRankings"
      :title="printTitle"
      :event="event"
      style="position: fixed; left: -9999px; top: 0"
    />
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const eventsStore = useEventsStore()
const { showSnackbar } = useSnackbar()
const eventId = route.params.id as string
const event = computed<EventData>(() => eventsStore.event as EventData)
const showPrintDialog = ref<boolean>(false)
const printableRef = ref<any | null>(null)

const imagePreviewDialog = ref(false)
const imagePreviewUrl = ref<string | undefined>('')

const pendingSegmentChanges = ref<{ [key: number]: SegmentData['segment_status'] }>({})

const printType = ref<'segment' | 'category' | 'final'>('segment')
const printCategoryId = ref<string | null>(null)
const printGender = ref<'male' | 'female' | 'both'>('both')
console.log('printCategoryId', printCategoryId.value)

const maleRankings = ref<any[]>([])
const femaleRankings = ref<any[]>([])
const printTitle = ref('')

type ParticipantScoreMap = Record<string, number | null | undefined>
type ParticipantWithScores = Omit<ParticipantData, 'scores'> & { scores: ParticipantScoreMap }

const participantsWithScoresForJudge = ref<ParticipantWithScores[]>([])
const selectedJudgeId = ref<string | null>(null)

const refetchInterval = ref<NodeJS.Timeout | null>(null) // Added ref for interval

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

async function refreshEventData() {
  // New function for manual/auto refetch
  await eventsStore.fetchEvent(eventId)
}

async function refreshEvent() {
  await eventsStore.fetchEvent(eventId)
  prepareScoresForJudge()
}

function prepareScoresForJudge() {
  const currentEvent = event.value
  if (!currentEvent?.participants || !selectedJudgeId.value) {
    participantsWithScoresForJudge.value = []
    return
  }
  participantsWithScoresForJudge.value = currentEvent.participants.map((p: ParticipantData) => {
    const scores: ParticipantScoreMap = {}
    currentEvent.scores?.forEach((score: ScoreData) => {
      const scoreParticipantId = score.participant?.documentId
      const scoreJudgeId = score.judge?.documentId
      const scoreCategoryId = score.category?.documentId

      if (
        scoreParticipantId === p.documentId &&
        scoreJudgeId === selectedJudgeId.value &&
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

watch(selectedJudgeId, prepareScoresForJudge)

onMounted(async () => {
  await eventsStore.fetchEvent(eventId)
})

const activeTab = ref('scores')

onUnmounted(() => {
  // Added onUnmounted hook to clear interval
  if (refetchInterval.value) {
    clearInterval(refetchInterval.value)
  }
})

watch(activeTab, (newTab, oldTab) => {
  // Added watch for activeTab
  if (newTab === 'view-scores') {
    // Start auto-refetch when entering 'view-scores' tab
    refetchInterval.value = setInterval(() => {
      refreshEventData()
    }, 10000) // 10 seconds
  } else if (oldTab === 'view-scores' && refetchInterval.value) {
    // Clear interval when leaving 'view-scores' tab
    clearInterval(refetchInterval.value)
    refetchInterval.value = null
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

const activeGenderTab = ref('male')
const selectedSegmentId = ref<string | null>(null)

const selectedSegment = computed(() => {
  return event.value?.segments?.find((s) => s.documentId === selectedSegmentId.value) || null
})

const segmentCategories = computed(() => {
  if (!selectedSegment.value) return []
  return (
    selectedSegment.value.categories?.map((cat) => ({
      title: cat.name,
      value: cat.documentId,
    })) || []
  )
})

const showImagePreview = (url: string) => {
  imagePreviewUrl.value = getStrapiUrl(url)
  imagePreviewDialog.value = true
}

function getParticipantScoreForCategoryByJudge(
  participantId: string,
  categoryId: string,
  judgeId: string
) {
  const score = event.value?.scores?.find(
    (s: any) =>
      s.category?.documentId === categoryId &&
      s.judge?.documentId === judgeId &&
      s.participant?.documentId === participantId
  )
  return score ? score.value : '–'
}

function getParticipantCategoryAverage(participantId: string, category: any) {
  const categoryScores = event.value?.scores?.filter(
    (s: any) =>
      s.category?.documentId === category.documentId &&
      s.participant?.documentId === participantId &&
      s.value !== null
  )
  if (!categoryScores || categoryScores.length === 0) return 0
  const sum = categoryScores.reduce((acc, s) => acc + s.value, 0)
  return sum / categoryScores.length
}

function getParticipantSegmentScore(participant: any, segment: any) {
  if (!segment?.categories) return 0

  const total = segment.categories.reduce((total: number, cat: any) => {
    const avgCategoryScore = getParticipantCategoryAverage(participant.documentId, cat) // 1-10 scale
    return total + (avgCategoryScore / 10) * cat.weight
  }, 0)

  return total // 0-1 scale
}

const scoreTableHeaders = computed(() => [
  { title: 'No.', key: 'number', sortable: true, width: '60px' },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Department', key: 'department.name', sortable: true },
  { title: 'Total Score', key: 'totalSegmentScorePercent', sortable: true },
  { title: '', key: 'data-table-expand' },
])

const participantsWithScores = computed(() => {
  if (!event.value?.participants || !selectedSegment.value) return []

  return event.value.participants.map((p: any) => {
    const segmentScore = getParticipantSegmentScore(p, selectedSegment.value)
    return {
      ...p,
      totalSegmentScorePercent: (segmentScore * 100).toFixed(3),
      isEliminated: p.participant_status === 'eliminated',
    }
  })
})

const maleParticipantsData = computed(() => {
  return participantsWithScores.value
    .filter((p) => p.gender === 'male')
    .sort((a, b) => parseFloat(b.totalSegmentScorePercent) - parseFloat(a.totalSegmentScorePercent))
})

const femaleParticipantsData = computed(() => {
  return participantsWithScores.value
    .filter((p) => p.gender === 'female')
    .sort((a, b) => parseFloat(b.totalSegmentScorePercent) - parseFloat(a.totalSegmentScorePercent))
})

function handleStatusChange(segmentId: number, newStatus: SegmentData['segment_status']) {
  pendingSegmentChanges.value[segmentId] = newStatus
}

const api = useStrapiApi()

async function submitSegmentChanges() {
  const changes = Object.entries(pendingSegmentChanges.value)
  if (changes.length === 0) {
    return
  }

  try {
    await Promise.all(
      changes.map(([segmentId, status]) => {
        const segment = event.value?.segments?.find((s) => s.id === Number(segmentId))

        if (segment) {
          const payload = {
            documentId: segment.documentId,
            data: { segment_status: status },
          }
          if (status === 'closed') {
            return api.post(`/segments/${segment.documentId}/lock`, payload)
          }
          return api.put(`/segments/activate`, payload)
        } else {
          pendingSegmentChanges.value = {}
          return Promise.reject(new Error(`Segment with ID ${segmentId} not found.`))
        }
      })
    )

    showSnackbar('Segment statuses updated successfully!', 'success')
    await eventsStore.fetchEvent(eventId)
    pendingSegmentChanges.value = {}
  } catch (error) {
    console.error('Error updating segment statuses:', error)
    showSnackbar('Failed to update segment statuses.', 'error')
  }
}

function getScoringProgress(category: CategoryData, judges: JudgeData[], eventScores: ScoreData[]) {
  if (!judges || judges.length === 0) return 'No judges assigned'

  const categoryScores = (eventScores || []).filter((s) => s.category?.id === category.id)
  const assignedJudgeIds = new Set(judges.map((j) => j.id))
  const judgesWhoScored = new Set(
    categoryScores.map((s: ScoreData) => s.judge?.id).filter((id) => id)
  )

  const scoredCount = [...judgesWhoScored].filter((id) => assignedJudgeIds.has(id)).length
  return `${scoredCount} of ${judges.length} judges have scored.`
}

const segmentTotalWeight = computed(() => (segment: SegmentData) => {
  if (!segment.categories) return 0
  return segment.categories.reduce((total, category) => total + (category.weight || 0), 0)
})

const fetchRankings = async () => {
  let url = ''
  const segmentId = selectedSegmentId.value
  const categoryId = printCategoryId.value

  if (printType.value === 'category') {
    if (!segmentId || !categoryId) {
      showSnackbar('Please select a segment and a category.', 'warning')
      return false
    }

    url = `/admin/events/${event.value?.documentId}/segments/${segmentId}/categories/${categoryId}/ranking`

    const categoryName = selectedSegment.value?.categories?.find(
      (c) => c.documentId === categoryId
    )?.name

    printTitle.value = `Category Ranking – ${categoryName}`
  } else if (printType.value === 'segment') {
    if (!segmentId) {
      showSnackbar('Please select a segment.', 'warning')
      return false
    }
    url = `/admin/events/${event.value?.documentId}/segments/${segmentId}/ranking`
    printTitle.value = `Segment Ranking – ${selectedSegment.value?.name}`
  } else if (printType.value === 'final') {
    url = `/admin/events/${event.value?.documentId}/ranking`
    printTitle.value = 'Final Event Ranking'
  }

  try {
    const { data } = await api.get(url)
    const results = data.results

    maleRankings.value = []
    femaleRankings.value = []

    if (printGender.value === 'male' || printGender.value === 'both') {
      maleRankings.value = results.male
    }

    if (printGender.value === 'female' || printGender.value === 'both') {
      femaleRankings.value = results.female
    }

    if (!maleRankings.value.length && !femaleRankings.value.length) {
      showSnackbar('No ranking data found.', 'info')
      return false
    }

    return true
  } catch (err) {
    console.error(err)
    showSnackbar('Failed to fetch rankings.', 'error')
    return false
  }
}

const confirmPrint = async () => {
  const ok = await fetchRankings()
  if (!ok) return

  showPrintDialog.value = false
  console.log('Male Ranking:', maleRankings.value, 'Female Ranking:', femaleRankings.value)

  await nextTick()

  await printableRef.value?.generatePdf()
}

// Initialize selectedSegmentId if segments are available
watch(
  () => event.value?.segments,
  (newSegments) => {
    if (newSegments && newSegments.length > 0 && selectedSegmentId.value === null) {
      selectedSegmentId.value = newSegments[0]?.documentId || ''
    }
  },
  { immediate: true }
)

watch(printType, (val) => {
  if (val === 'segment') {
    printCategoryId.value = null
  } else if (val === 'final') {
    selectedSegmentId.value = null
    printCategoryId.value = null
  }
})
</script>

<style scoped>
.pdf-content {
  font-family: 'Roboto', sans-serif;
  color: #333;
}
</style>
