<template>
  <v-container fluid>
    <v-row>
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
            <div
              v-if="!smAndDown"
              class="d-flex flex-wrap ga-2 flex-shrink-0"
            >
              <v-btn
                icon
                color="purple"
                variant="text"
                @click="showPrintDialog = true"
              >
                <v-icon size="28">mdi-printer</v-icon>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  Print Rankings
                </v-tooltip>
              </v-btn>
              <v-btn
                :loading="eventsStore.isLoading"
                icon
                color="primary"
                variant="text"
                @click="refreshEventData"
              >
                <v-icon size="28">mdi-refresh</v-icon>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  Refetch Scores
                </v-tooltip>
              </v-btn>
              <v-btn
                :to="`/admin/events/${eventId}/manage`"
                icon
                color="blue"
                variant="text"
              >
                <v-icon size="28">mdi-cog</v-icon>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  Manage Event
                </v-tooltip>
              </v-btn>

              <v-btn
                :to="`/admin/events/${eventId}/setup`"
                icon
                color="green"
                variant="text"
              >
                <v-icon size="28">mdi-pencil</v-icon>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  Setup Event
                </v-tooltip>
              </v-btn>

              <v-btn
                icon
                color="red"
                variant="text"
                @click="deleteEvent"
              >
                <v-icon size="28">mdi-delete</v-icon>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  Delete Event
                </v-tooltip>
              </v-btn>
            </div>
            <div v-else>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon
                    v-bind="props"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="showPrintDialog = true">
                    <template #prepend>
                      <v-icon color="purple">mdi-printer</v-icon>
                    </template>
                    <v-list-item-title>Print Rankings</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :loading="eventsStore.isLoading"
                    @click="refreshEventData"
                  >
                    <template #prepend>
                      <v-icon color="primary">mdi-refresh</v-icon>
                    </template>
                    <v-list-item-title>Refetch Scores</v-list-item-title>
                  </v-list-item>
                  <v-list-item :to="`/admin/events/${eventId}/manage`">
                    <template #prepend>
                      <v-icon color="blue">mdi-cog</v-icon>
                    </template>
                    <v-list-item-title>Manage Event</v-list-item-title>
                  </v-list-item>
                  <v-list-item :to="`/admin/events/${eventId}/setup`">
                    <template #prepend>
                      <v-icon color="green">mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Setup Event</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteEvent">
                    <template #prepend>
                      <v-icon color="red">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Delete Event</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </header>

          <NuxtLink
            :to="`/admin/events/${eventId}`"
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

    <v-tabs
      color="green"
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

            <v-tabs
              color="green"
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
                  :loading="isFetchingSegmentRanking"
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

                  <template #item.department.name="{ value }">
                    {{ value || 'N/A' }}
                  </template>

                  <template #item.averaged_score="{ value }">
                    <strong class="text-h6">{{ value }}</strong>
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
                                      v-for="judge in event?.judges.sort(
                                        (a: JudgeData, b: JudgeData) => a.name.localeCompare(b.name)
                                      )"
                                      :key="judge.id"
                                    >
                                      <v-list-item-title
                                        :class="{
                                          'active-judge-item': isJudgeActiveForCategory(
                                            judge.documentId,
                                            cat.documentId
                                          ),
                                        }"
                                      >
                                        {{ judge.name }}
                                      </v-list-item-title>
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
                  :loading="isFetchingSegmentRanking"
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

                  <template #item.department.name="{ value }">
                    {{ value || 'N/A' }}
                  </template>

                  <template #item.averaged_score="{ value }">
                    <strong class="text-h6">{{ value }}</strong>
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
                                      v-for="judge in event?.judges.sort(
                                        (a: JudgeData, b: JudgeData) => a.name.localeCompare(b.name)
                                      )"
                                      :key="judge.id"
                                    >
                                      <v-list-item-title
                                        :class="{
                                          'active-judge-item': isJudgeActiveForCategory(
                                            judge.documentId,
                                            cat.documentId
                                          ),
                                        }"
                                      >
                                        {{ judge.name }}
                                      </v-list-item-title>
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
              :items="
                event?.judges.sort((a: JudgeData, b: JudgeData) => a.name.localeCompare(b.name))
              "
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

    <ImagePreviewDialog
      v-model="imagePreviewDialog"
      :image-url="imagePreviewUrl"
    />

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
      :gender="printGender"
      :male="maleRankings"
      :female="femaleRankings"
      :title="printTitle"
      :event="event"
      style="position: fixed; left: -9999px; top: 0"
    />
  </v-container>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()
const route = useRoute()
const eventsStore = useEventsStore()
const { showSnackbar } = useSnackbar()
const router = useRouter()
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

const maleRankings = ref<any[]>([])
const femaleRankings = ref<any[]>([])
const printTitle = ref('')

type ParticipantScoreMap = Record<string, number | null | undefined>
type ParticipantWithScores = Omit<ParticipantData, 'scores'> & { scores: ParticipantScoreMap }

const participantsWithScoresForJudge = ref<ParticipantWithScores[]>([])
const selectedJudgeId = ref<string | null>(null)

const refetchInterval = ref<NodeJS.Timeout | null>(null) // Added ref for interval

const deleteEvent = async () => {
  if (!event.value?.documentId) {
    showSnackbar('Cannot delete event without a documentId.', 'error')
    return
  }
  if (confirm('Are you sure you want to delete this event? This cannot be undone.')) {
    try {
      await api.delete(`/events/${event.value.documentId}`)
      showSnackbar('Event deleted successfully.', 'success')
      router.push('/admin/events')
    } catch (e) {
      showSnackbar('Failed to delete event.', 'error')
      console.error(e)
    }
  }
}

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

async function refreshEventData() {
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

const activeTab = ref('view-scores')

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
      refreshEventData() // Re-fetch event data to ensure scores are up-to-date for judge activity check
      fetchSegmentRanking()
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

function isJudgeActiveForCategory(judgeDocumentId: string, categoryDocumentId: string): boolean {
  const category = selectedSegment.value?.categories?.find(
    (cat) => cat.documentId === categoryDocumentId
  )

  if (!category?.active_judges) return false

  return category.active_judges.some((judge: JudgeData) => judge.documentId === judgeDocumentId)
}

function getParticipantCategoryAverage(participantId: string, category: any) {
  // Get only scores from active judges
  const activeJudgeIds = new Set(
    (category.active_judges || []).map((judge: JudgeData) => judge.documentId)
  )

  const categoryScores = event.value?.scores?.filter(
    (s: any) =>
      s.category?.documentId === category.documentId &&
      s.participant?.documentId === participantId &&
      s.value !== null &&
      activeJudgeIds.has(s.judge?.documentId) // Only include active judges
  )
  const totalActiveJudges = category.active_judges?.length || 0

  if (totalActiveJudges === 0) return 0

  if (!categoryScores || categoryScores.length === 0) return 0
  const sum = categoryScores.reduce((acc, s) => acc + s.value, 0)
  // const catAvg = Number(sum / totalActiveJudges).toFixed(2)
  // return catAvg
  return sum / totalActiveJudges
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
//
// function getParticipantCategoryAverage(participantId: string, category: any) {
//   const categoryScores = event.value?.scores?.filter(
//     (s: any) =>
//       s.category?.documentId === category.documentId &&
//       s.participant?.documentId === participantId &&
//       s.value !== null
//   )
//   if (!categoryScores || categoryScores.length === 0) return 0
//   const sum = categoryScores.reduce((acc, s) => acc + s.value, 0)
//   return sum / categoryScores.length
// }

const scoreTableHeaders = computed(() => [
  { title: 'No.', key: 'number', sortable: true, width: '60px' },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Department', key: 'department.name', sortable: true },
  { title: 'Average Score', key: 'averaged_score', sortable: true },
  { title: 'Rank', key: 'rank', sortable: true },
  { title: '', key: 'data-table-expand' },
])

const maleParticipantsData = computed(() => {
  if (!event.value?.participants) return []

  const maleParticipants = event.value.participants.filter((p) => p.gender === 'male')

  return maleParticipants
    .map((p) => {
      const rankingData = segmentRanking.value.male.find((r) => r.participant_number === p.number)
      return {
        ...p,
        averaged_score: rankingData ? rankingData.averaged_score : 'N/A',
        rank: rankingData ? rankingData.rank : 'N/A',
        isEliminated: p.participant_status === 'eliminated',
      }
    })
    .sort((a, b) => {
      if (a.rank === 'N/A' || b.rank === 'N/A' || a.rank === b.rank) return 0
      return Number(a.rank) - Number(b.rank)
    })
})

const femaleParticipantsData = computed(() => {
  if (!event.value?.participants) return []

  const femaleParticipants = event.value.participants.filter((p) => p.gender === 'female')

  return femaleParticipants
    .map((p) => {
      const rankingData = segmentRanking.value.female.find((r) => r.participant_number === p.number)
      return {
        ...p,
        averaged_score: rankingData ? rankingData.averaged_score : 'N/A',
        rank: rankingData ? rankingData.rank : 'N/A',
        isEliminated: p.participant_status === 'eliminated',
      }
    })
    .sort((a, b) => {
      if (a.rank === 'N/A' || b.rank === 'N/A' || a.rank === b.rank) return 0
      return Number(a.rank) - Number(b.rank)
    })
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
    const categoryWeight = selectedSegment.value?.categories?.find(
      (c) => c.documentId === categoryId
    )?.weight

    printTitle.value = `Category Ranking – ${categoryName} (${Number(categoryWeight) * 100}%)`
  } else if (printType.value === 'segment') {
    if (!segmentId) {
      showSnackbar('Please select a segment.', 'warning')
      return false
    }
    url = `/admin/events/${event.value?.documentId}/segments/${segmentId}/ranking`
    printTitle.value = `Segment Ranking – ${selectedSegment.value?.name} (${Number(selectedSegment.value?.weight || 0) * 100}%)`
  } else if (printType.value === 'final') {
    url = `/admin/events/${event.value?.documentId}/ranking`
    printTitle.value = 'Final Event Ranking'
  }

  try {
    const { data } = await api.get(url)
    const results: {
      male: {
        averaged_score: number
        department: string
        gender: 'male'
        participant_number: number
        name: string
        rank: number
      }[]
      female: {
        averaged_score: number
        department: string
        gender: 'female'
        participant_number: number
        name: string
        rank: number
      }[]
    } = data.results
    console.log('Ranking Results:', results)

    maleRankings.value = []
    femaleRankings.value = []

    if (printType.value === 'category') {
      if (printGender.value === 'male' || printGender.value === 'both') {
        maleRankings.value = results.male.filter((p) => p.rank === 1).slice(0, 3) // Slice until 3 to see possible ties at Rank 1
      }
      if (printGender.value === 'female' || printGender.value === 'both') {
        femaleRankings.value = results.female.filter((p) => p.rank === 1).slice(0, 3)
      }
    } else if (printType.value === 'segment' || printType.value === 'final') {
      if (printGender.value === 'male' || printGender.value === 'both') {
        maleRankings.value = results.male.slice(0, 5)
      }
      if (printGender.value === 'female' || printGender.value === 'both') {
        femaleRankings.value = results.female.slice(0, 5)
      }
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

interface SegmentRanking {
  averaged_score: number
  department: string
  gender: 'male' | 'female'
  participant_number: number
  name: string
  rank: number
}

const segmentRanking = ref<{
  male: SegmentRanking[]
  female: SegmentRanking[]
}>({ male: [], female: [] })

const isFetchingSegmentRanking = ref(false)

async function fetchSegmentRanking() {
  if (!selectedSegmentId.value || !event.value?.documentId) {
    segmentRanking.value = { male: [], female: [] }
    return
  }
  isFetchingSegmentRanking.value = true
  try {
    const url = `/admin/events/${event.value.documentId}/segments/${selectedSegmentId.value}/scores`
    const { data } = await api.get(url)
    segmentRanking.value = data.results
  } catch (error) {
    console.error('Failed to fetch segment ranking:', error)
    showSnackbar('Failed to fetch segment ranking.', 'error')
    segmentRanking.value = { male: [], female: [] }
  } finally {
    isFetchingSegmentRanking.value = false
  }
}

watch(selectedSegmentId, fetchSegmentRanking, { immediate: true })

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
.active-judge-item {
  color: green;
  font-weight: bold;
}
.pdf-content {
  font-family: 'Roboto', sans-serif;
  color: #333;
}
.hover-underline {
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
</style>
