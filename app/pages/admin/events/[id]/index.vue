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
                @click="refreshEventData()"
              >
                <v-icon size="28">mdi-refresh</v-icon>
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  Refresh Data
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
                    @click="refreshEventData()"
                  >
                    <template #prepend>
                      <v-icon color="primary">mdi-refresh</v-icon>
                    </template>
                    <v-list-item-title>Refresh Data</v-list-item-title>
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

    <v-row>
      <v-col cols="12">
        <v-tabs
          v-model="selectedSegmentTab"
          color="green"
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
                  color="green"
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
                            v-if="
                              item.isEliminated &&
                              item.eliminated_at_segment?.documentId === segment.documentId
                            "
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
                            v-if="
                              item.isEliminated &&
                              item.eliminated_at_segment?.documentId === segment.documentId
                            "
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
            v-model="selectedSegmentTab"
            :items="event?.segments"
            item-title="name"
            item-value="documentId"
            label="Segment"
            @update:model-value="printCategoryId = null"
          />
          <v-select
            v-if="printType === 'category'"
            v-model="printCategoryId"
            :items="currentSegmentCategories"
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

    <ImagePreviewDialog
      v-model="imagePreviewDialog"
      :image-url="imagePreviewUrl"
    />
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
  eliminated_at_segment: SegmentData
  isEliminated: boolean
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
  participant_status?: string // NEW
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

  if (!event.value) {
    snackbar.showSnackbar('Failed to load event data.', 'error')
    return
  }

  // Determine initial tab and fetch data
  if (event.value.segments && event.value.segments.length > 0) {
    const firstSegmentWithId = event.value.segments.find((s) => s.documentId)
    if (firstSegmentWithId) {
      selectedSegmentTab.value = firstSegmentWithId.documentId
      // Manually trigger fetch for the initial segment, waiting for it to complete
      await fetchSegmentScores(firstSegmentWithId.documentId)
    } else {
      console.warn(
        'No segment with documentId found to select initially. Defaulting to final rankings.'
      )
      selectedSegmentTab.value = 'final-rankings'
      await fetchFinalScores() // Manually trigger fetch for final rankings
    }
  } else {
    // If no segments at all, default to final rankings
    selectedSegmentTab.value = 'final-rankings'
    await fetchFinalScores() // Manually trigger fetch for final rankings
  }
})

watch(selectedSegmentTab, async (newTab) => {
  if (!newTab) return

  if (!eventsStore.event) {
    console.warn(
      'eventsStore.event is null when selectedSegmentTab changed. Deferring score fetch.'
    )
    return // Prevent fetching if event data is not available
  }

  if (newTab === 'final-rankings') {
    if (finalMaleResults.value.length === 0 && finalFemaleResults.value.length === 0) {
      await fetchFinalScores()
    }
  } else {
    await fetchSegmentScores(newTab)
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
    const segment = data.segment
    maleSegmentResults.value = data.results.male.filter((p) => {
      if (!p.eliminated_at_segment) return true
      return p.eliminated_at_segment.order >= segment.order
    })
    femaleSegmentResults.value = data.results.female.filter((p) => {
      if (!p.eliminated_at_segment) return true
      return p.eliminated_at_segment.order >= segment.order
    })
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
    finalMaleResults.value = data.results.male.filter((p) => !p.isEliminated)
    finalFemaleResults.value = data.results.female.filter((p) => !p.isEliminated)
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
    title: `${category.name} (${category.weight * 100}%)`,
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

// Print functionality
const showPrintDialog = ref<boolean>(false)
const printableRef = ref<any | null>(null)
const printType = ref<'segment' | 'category' | 'final'>('segment')
const printCategoryId = ref<string | null>(null)
const printGender = ref<'male' | 'female' | 'both'>('both')
const maleRankings = ref<any[]>([])
const femaleRankings = ref<any[]>([])
const printTitle = ref('')

const imagePreviewDialog = ref(false)
const imagePreviewUrl = ref<string | undefined>('')

const showImagePreview = (url: string) => {
  imagePreviewUrl.value = getStrapiUrl(url)
  imagePreviewDialog.value = true
}

const refreshEventData = async () => {
  await eventsStore.fetchEvent(eventId)
}

const selectedSegment = computed(() => {
  if (
    !event.value?.segments ||
    !selectedSegmentTab.value ||
    selectedSegmentTab.value === 'final-rankings'
  )
    return null
  return event.value.segments.find((s) => s.documentId === selectedSegmentTab.value) || null
})

const currentSegmentCategories = computed(() => {
  if (!selectedSegment.value) return []
  return (
    selectedSegment.value.categories?.map((cat) => ({
      title: cat.name,
      value: cat.documentId,
    })) || []
  )
})

const fetchRankings = async () => {
  let url = ''
  const segmentId = selectedSegment.value?.documentId
  const categoryId = printCategoryId.value

  if (printType.value === 'category') {
    if (!segmentId || !categoryId) {
      snackbar.showSnackbar('Please select a segment and a category.', 'warning')
      return false
    }

    url = `/admin/events/${event.value?.documentId}/segments/${segmentId}/categories/${categoryId}/ranking`

    const categoryName = currentSegmentCategories.value?.find((c) => c.value === categoryId)?.title
    const categoryWeight = selectedSegment.value?.categories?.find(
      (c) => c.documentId === categoryId
    )?.weight

    printTitle.value = `Category Ranking – ${categoryName} (${Number(categoryWeight) * 100}%)`
  } else if (printType.value === 'segment') {
    if (!segmentId) {
      snackbar.showSnackbar('Please select a segment.', 'warning')
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
      snackbar.showSnackbar('No ranking data found.', 'info')
      return false
    }

    return true
  } catch (err) {
    console.error(err)
    snackbar.showSnackbar('Failed to fetch rankings.', 'error')
    return false
  }
}

const confirmPrint = async () => {
  const ok = await fetchRankings()
  if (!ok) return

  showPrintDialog.value = false
  await nextTick()

  await printableRef.value?.generatePdf()
}

watch(printType, (val) => {
  if (val === 'segment') {
    printCategoryId.value = null
  } else if (val === 'final') {
    selectedSegmentTab.value = 'final-rankings' // Ensure the final rankings tab is selected for printing
    printCategoryId.value = null
  }
})

watch(selectedSegmentTab, (newVal) => {
  if (newVal === 'final-rankings') {
    printType.value = 'final'
  } else if (printType.value === 'final') {
    printType.value = 'segment' // Default back to segment if changing from final tab
  }
  printCategoryId.value = null
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
.hover-underline {
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
.participant-table :deep(.v-data-table__td) {
  font-size: 15px !important; /* Increase font size by 2px from default 13px */
  height: 64px !important; /* Increase row height to accommodate larger avatar */
}
</style>
