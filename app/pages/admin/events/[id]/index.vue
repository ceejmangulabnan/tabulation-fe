<template>
  <v-container>
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
            <div class="d-flex flex-wrap ga-2 flex-shrink-0">
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
          </header>

          <div class="d-flex flex-column ga-1">
            <h1 class="text-sm-h4 text-h5 mb-2 mb-sm-0 font-weight-bold">
              {{ event?.name }}
            </h1>
            <p class="text-sm-body-1 text-subtitle-2">
              {{ event?.description || 'No description provided.' }}
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-tabs
          v-model="selectedSegmentTab"
          show-arrows
        >
          <v-tab
            v-for="segment in event?.segments"
            :key="segment.documentId"
            :value="segment.documentId"
          >
            {{ segment.name }}
          </v-tab>
          <v-tab
            value="final-rankings"
            @click="fetchFinalScores"
          >
            Final Rankings
          </v-tab>
        </v-tabs>

        <v-window v-model="selectedSegmentTab">
          <v-window-item
            v-for="segment in event?.segments"
            :key="segment.documentId"
            :value="segment.documentId"
          >
            <v-card class="mt-4">
              <v-card-title>
                {{ segment.name }} Scores
                <v-btn
                  :loading="eventsStore.isLoading"
                  icon
                  color="primary"
                  variant="text"
                  @click="fetchSegmentScores(segment.documentId)"
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
                  v-model="activeGenderTab"
                  class="mb-4"
                >
                  <v-tab value="male">Male ({{ maleSegmentResults.length }})</v-tab>
                  <v-tab value="female">Female ({{ femaleSegmentResults.length }})</v-tab>
                </v-tabs>

                <v-window v-model="activeGenderTab">
                  <v-window-item value="male">
                    <v-data-table
                      :headers="segmentHeaders"
                      :items="maleSegmentResults"
                      item-key="participant_number"
                      class="elevation-1"
                      :sort-by="[{ key: 'rank', order: 'asc' }]"
                    >
                      <template #[`item.headshot`]="{ item }">
                        <v-avatar size="36px">
                          <v-img
                            v-if="item.headshot"
                            :src="getStrapiUrl(item.headshot)"
                          ></v-img>
                          <v-icon v-else>mdi-account-circle</v-icon>
                        </v-avatar>
                      </template>
                      <template
                        v-for="category in segmentCategories"
                        #[`item.category_score_${category.documentId}`]="{ item }"
                        :key="`category-score-${category.documentId}-${item.participant_number}`"
                      >
                        {{ item.category_scores[category.name]?.averaged_score || '-' }}
                      </template>
                    </v-data-table>
                  </v-window-item>
                  <v-window-item value="female">
                    <v-data-table
                      :headers="segmentHeaders"
                      :items="femaleSegmentResults"
                      item-key="participant_number"
                      class="elevation-1"
                      :sort-by="[{ key: 'rank', order: 'asc' }]"
                    >
                      <template #[`item.headshot`]="{ item }">
                        <v-avatar size="36px">
                          <v-img
                            v-if="item.headshot"
                            :src="getStrapiUrl(item.headshot)"
                          ></v-img>
                          <v-icon v-else>mdi-account-circle</v-icon>
                        </v-avatar>
                      </template>
                      <template
                        v-for="category in segmentCategories"
                        #[`item.category_score_${category.documentId}`]="{ item }"
                        :key="`category-score-${category.documentId}-${item.participant_number}`"
                      >
                        {{ item.category_scores[category.name]?.averaged_score || '-' }}
                      </template>
                    </v-data-table>
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item value="final-rankings">
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
                      class="elevation-1"
                      :sort-by="[{ key: 'rank', order: 'asc' }]"
                    >
                      <template #[`item.headshot`]="{ item }">
                        <v-avatar size="36px">
                          <v-img
                            v-if="item.headshot"
                            :src="getStrapiUrl(item.headshot)"
                          ></v-img>
                          <v-icon v-else>mdi-account-circle</v-icon>
                        </v-avatar>
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
                      class="elevation-1"
                      :sort-by="[{ key: 'rank', order: 'asc' }]"
                    >
                      <template #[`item.headshot`]="{ item }">
                        <v-avatar size="36px">
                          <v-img
                            v-if="item.headshot"
                            :src="getStrapiUrl(item.headshot)"
                          ></v-img>
                          <v-icon v-else>mdi-account-circle</v-icon>
                        </v-avatar>
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
      </v-col>
    </v-row>

    <v-row>
      <!-- Judges -->
      <v-col
        md="6"
        cols="12"
      >
        <v-card class="d-flex flex-column w-100 me-1 pa-2">
          <v-card-title>Assigned Judges ({{ event?.judges?.length || 0 }})</v-card-title>
          <v-list lines="two">
            <v-list-item
              v-if="!event?.judges?.length"
              class="text-grey-darken-1"
            >
              No judges assigned.
            </v-list-item>
            <v-list-item
              v-for="judge in event?.judges"
              :key="judge.id"
              :title="judge.name"
              :subtitle="judge.users_permissions_user?.email"
            >
              <template #prepend>
                <v-avatar icon="mdi-account-tie"></v-avatar>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <!-- Segment Status -->
      <v-col
        md="6"
        cols="12"
      >
        <v-card class="d-flex flex-column w-100 me-1 pa-2">
          <v-card-title>
            Segment & Scoring Overview ({{ event?.segments?.length || 0 }})
          </v-card-title>
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
                <v-list-item-title class="font-weight-bold d-flex align-center">
                  <v-chip
                    :color="getSegmentStatusColor(segment.segment_status)"
                    size="small"
                    class="mr-1 text-capitalize"
                  >
                    {{ segment.segment_status }}
                  </v-chip>
                  {{ segment.name }} (Weight: {{ segment.weight * 100 }}%)
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
                      <!--
                        NOTE: The scoring progress is based on an assumed data structure where `event.scores`
                        is an array of score objects. Each score is expected to have a
                        `judge_id` and a `category_id`.
                      -->
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
            <p class="font-weight-bold text-right mt-6">
              Total Segment Weight: {{ totalSegmentWeight }}%
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Judge Requests -->
      <v-col
        class="d-flex"
        cols="12"
      >
        <div class="w-100">
          <AdminEventRequestTable />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

interface DataTableHeader {
  key: string
  title: string
  align?: 'start' | 'end' | 'center'
  sortable?: boolean
  class?: string
  fixed?: 'end' | 'start' | boolean | undefined
}

// Define interfaces for the segment-specific API response
interface CategoryScoreDetail {
  averaged_score: number
  raw_averaged_score: number
}

interface SegmentResultParticipant {
  participant_number: number
  name: string
  department: string
  gender: 'male' | 'female'
  headshot: string
  category_scores: {
    [categoryName: string]: CategoryScoreDetail
  }
  averaged_score: number
  raw_averaged_score: number
  rank: number
}

interface CategoryDataFromSegmentApi {
  documentId: string
  name: string
  weight: number
}

interface SegmentScoresApiResponse {
  event: any // Assuming EventData structure
  segment: {
    documentId: string
    name: string
    order: number
    weight: number
  }
  categories: CategoryDataFromSegmentApi[]
  results: {
    male: SegmentResultParticipant[]
    female: SegmentResultParticipant[]
  }
}

// Define interfaces for the final scores API response
interface FinalAveragedScore {
  averaged_score: number
  raw_averaged_score: number
}

interface FinalSegmentScores {
  [key: string]: FinalAveragedScore
}

interface FinalParticipant {
  participant_number: number
  name: string
  department: string
  gender: 'male' | 'female'
  headshot: string
  segment_scores: FinalSegmentScores
  averaged_score: number
  raw_averaged_score: number
  rank: number
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

// Re-defining JudgeData locally for consistency with new API structures, if not globally available
interface JudgeData {
  id: number
  name: string
  documentId: string
}

// event id index page
definePageMeta({
  layout: 'admin-event',
})
const route = useRoute()
const eventsStore = useEventsStore()
const router = useRouter()
const api = useStrapiApi()
const snackbar = useSnackbar()

const { smAndDown } = useDisplay()

const eventId = route.params.id as string
const event = computed(() => eventsStore.event)

const selectedSegmentTab = ref<string | null>(null) // To control segment tabs
const activeGenderTab = ref('male') // To control male/female tabs within a segment

// For segment-specific scores
const maleSegmentResults = ref<SegmentResultParticipant[]>([])
const femaleSegmentResults = ref<SegmentResultParticipant[]>([])
const segmentCategories = ref<CategoryDataFromSegmentApi[]>([]) // Categories for the selected segment

// For final rankings
const finalMaleResults = ref<FinalParticipant[]>([])
const finalFemaleResults = ref<FinalParticipant[]>([])
const finalSegments = ref<FinalEventScoresResponse['segments']>([])

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

onMounted(async () => {
  await eventsStore.fetchEvent(eventId)
  if (event.value?.segments && event.value.segments.length > 0) {
    const firstSegmentWithId = event.value.segments.find((s) => s.documentId)
    if (firstSegmentWithId) {
      selectedSegmentTab.value = firstSegmentWithId.documentId
    } else {
      console.warn('No segment with documentId found to select initially.')
    }
  }
})

watch(selectedSegmentTab, (newTab) => {
  if (!newTab) return
  if (newTab === 'final-rankings') {
    if (finalMaleResults.value.length === 0 && finalFemaleResults.value.length === 0) {
      fetchFinalScores()
    }
  } else {
    fetchSegmentScores(newTab)
  }
})

const fetchSegmentScores = async (segmentDocumentId: string) => {
  if (!event.value) {
    snackbar.showSnackbar('Event data not available.', 'error')
    return
  }

  eventsStore.isLoading = true
  try {
    const apiUrl = `/admin/events/${event.value.documentId}/segments/${segmentDocumentId}/scores`
    const { data } = await api.get<SegmentScoresApiResponse>(apiUrl)
    maleSegmentResults.value = data.results.male
    femaleSegmentResults.value = data.results.female
    segmentCategories.value = data.categories
  } catch (e) {
    snackbar.showSnackbar('Failed to fetch segment scores.', 'error')
    console.error(e)
  } finally {
    eventsStore.isLoading = false
  }
}

const fetchFinalScores = async () => {
  if (!event.value) {
    snackbar.showSnackbar('Event data not available.', 'error')
    return
  }

  eventsStore.isLoading = true
  try {
    const apiUrl = `/admin/events/${event.value.documentId}/scores`
    const { data } = await api.get<FinalEventScoresResponse>(apiUrl)
    finalMaleResults.value = data.results.male
    finalFemaleResults.value = data.results.female
    finalSegments.value = data.segments
  } catch (e) {
    snackbar.showSnackbar('Failed to fetch final scores.', 'error')
    console.error(e)
  } finally {
    eventsStore.isLoading = false
  }
}

const deleteEvent = async () => {
  if (!event.value?.documentId) {
    snackbar.showSnackbar('Cannot delete event without a documentId.', 'error')
    return
  }
  if (confirm('Are you sure you want to delete this event? This cannot be undone.')) {
    try {
      await api.delete(`/events/${event.value.documentId}`)
      snackbar.showSnackbar('Event deleted successfully.', 'success')
      router.push('/admin/events')
    } catch (e) {
      snackbar.showSnackbar('Failed to delete event.', 'error')
      console.error(e)
    }
  }
}

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

function getSegmentStatusColor(status: 'draft' | 'inactive' | 'active' | 'closed') {
  switch (status) {
    case 'draft':
      return 'grey'
    case 'inactive':
      return 'orange'
    case 'active':
      return 'green'
    case 'closed':
      return 'blue'
    default:
      return 'grey'
  }
}

const totalSegmentWeight = computed(() =>
  (event.value?.segments || []).reduce((sum: number, s: SegmentData) => sum + s.weight * 100, 0)
)

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

const segmentHeaders = computed<DataTableHeader[]>(() => {
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

  const categoryScoreHeaders: DataTableHeader[] = segmentCategories.value.map((category) => ({
    title: category.name,
    key: `category_score_${category.documentId}`,
    align: 'end',
    sortable: true,
  }))

  return [
    ...staticHeaders,
    ...categoryScoreHeaders,
    {
      title: 'Total Segment Score',
      key: 'averaged_score',
      align: 'end',
      sortable: true,
    },
    { title: 'Rank', key: 'rank', align: 'end', sortable: true, fixed: 'end' },
  ]
})

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
</script>

<style scoped>
.v-data-table {
  overflow-x: auto;
}

.min-w-60px {
  min-width: 60px;
}

.min-w-80px {
  min-width: 80px;
}

.min-w-100px {
  min-width: 100px;
}

.min-w-120px {
  min-width: 120px;
}

.min-w-150px {
  min-width: 150px;
}
</style>
