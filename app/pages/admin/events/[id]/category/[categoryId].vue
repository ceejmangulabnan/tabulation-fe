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
            <div class="d-flex flex-wrap ga-2 flex-shrink-0">
              <v-btn
                icon
                color="purple"
                variant="text"
                @click="handlePrint"
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
                @click="fetchData"
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
        <h1 class="text-h6 font-weight-bold">
          {{ category?.name }} - {{ (category?.weight || 0) * 100 }}%
        </h1>
        <v-tabs
          color="green"
          v-model="tab"
          class="mb-4"
        >
          <v-tab value="male">Male</v-tab>
          <v-tab value="female">Female</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="male">
            <v-data-table
              :headers="headers"
              :items="maleItems"
              item-key="participant_number"
              class="elevation-1 participant-table"
            >
              <template #[`item.headshot`]="{ item }">
                <v-avatar size="50px">
                  <v-img
                    v-if="item.headshot"
                    :src="getStrapiImageUrl(item.headshot)"
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
                      item.eliminated_at_segment?.documentId === segment?.documentId
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
                v-for="judge in allJudges"
                #[`header.${getJudgeHeaderKey(judge.name)}`]="{ column }"
                :key="`judge-header-male-${judge.documentId}`"
              >
                <span
                  :class="{ 'active-judge-header': isJudgeActive(judge) }"
                  class="font-weight-bold judge-col-header"
                >
                  {{ column.title }}
                </span>
              </template>
            </v-data-table>
          </v-window-item>
          <v-window-item value="female">
            <v-data-table
              :headers="headers"
              :items="femaleItems"
              item-key="participant_number"
              class="elevation-1 participant-table"
              density="default"
            >
              <template #[`item.headshot`]="{ item }">
                <v-avatar size="50px">
                  <v-img
                    v-if="item.headshot"
                    :src="getStrapiImageUrl(item.headshot)"
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
                      item.eliminated_at_segment?.documentId === segment?.documentId
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
                v-for="judge in allJudges"
                #[`header.${getJudgeHeaderKey(judge.name)}`]="{ column }"
                :key="`judge-header-female-${judge.documentId}`"
              >
                <span
                  :class="{ 'active-judge-header': isJudgeActive(judge) }"
                  class="font-weight-bold judge-col-header"
                >
                  {{ column.title }}
                </span>
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <PrintableRankings
      v-if="event"
      ref="printableRef"
      gender="both"
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
interface DataTableHeader {
  key: string
  title: string
  align?: 'start' | 'end' | 'center'
  sortable?: boolean
  class?: string
  fixed?: 'end' | 'start' | boolean | undefined
}

interface RankedParticipant {
  eliminated_at_segment: SegmentData
  isEliminated: boolean
  participant_number: number
  name: string
  department: string
  gender: 'male' | 'female'
  headshot: string
  averaged_score: number
  raw_averaged_score: number
  rank: number
  participant_status?: string // NEW
  [key: `judge_${string}`]: number | null // Dynamic judge scores, e.g., 'judge_Judge_1': number | null
}

interface JudgeScoresApiResponse {
  event: any // Assuming similar structure to existing event
  activeJudges: {
    documentId: string
    name: string
  }[]
  results: {
    male: RankedParticipant[]
    female: RankedParticipant[]
  }
}

interface JudgeData {
  id: number
  name: string
  documentId: string
}

const route = useRoute()
const eventId = route.params.id as string
const categoryId = computed(() => route.params.categoryId as string)
const eventsStore = useEventsStore()
const snackbar = useSnackbar()
const api = useStrapiApi()
const router = useRouter()
const tab = ref('male')
let refreshInterval: NodeJS.Timeout | null = null
const printableRef = ref<any | null>(null)
const maleRankings = ref<RankedParticipant[]>([])
const femaleRankings = ref<RankedParticipant[]>([])
const printTitle = ref('')

const maleItems = ref<RankedParticipant[]>([])
const femaleItems = ref<RankedParticipant[]>([])
const activeJudgesFromApi = ref<{ documentId: string; name: string }[]>([])

const imagePreviewDialog = ref(false)
const imagePreviewUrl = ref<string | undefined>('')

const event = computed(() => eventsStore.event)
const allJudges = computed(() => eventsStore.event?.judges || [])

const config = useRuntimeConfig()
const getStrapiImageUrl = (relativePath: string) => {
  if (!relativePath) return ''
  return `${config.public.strapiUrl}${relativePath}`
}

const showImagePreview = (url: string) => {
  imagePreviewUrl.value = getStrapiImageUrl(url)
  imagePreviewDialog.value = true
}

const getJudgeHeaderKey = (judgeName: string) => {
  return `judge_${judgeName.replace(/\s/g, '_')}`
}

const fetchData = async () => {
  await eventsStore.fetchEvent(eventId) // Ensure event data is available
  if (!event.value || !segment.value || !category.value) {
    snackbar.showSnackbar('Failed to load event, segment or category data.', 'error')
    return
  }

  const segmentDocumentId = segment.value.documentId
  const categoryDocumentId = category.value.documentId

  const apiUrl = `/admin/events/${event.value.documentId}/segments/${segmentDocumentId}/categories/${categoryDocumentId}/judge-scores`
  try {
    const { data } = await api.get<JudgeScoresApiResponse>(apiUrl)

    const filterAndSort = (participants: RankedParticipant[]) => {
      return participants
        .filter((p) => {
          if (!p.eliminated_at_segment) return true
          return segment.value ? p.eliminated_at_segment.order >= segment.value.order : true
        })
        .sort((a, b) => a.participant_number - b.participant_number)
    }

    maleItems.value = filterAndSort(data.results.male)
    femaleItems.value = filterAndSort(data.results.female)
    activeJudgesFromApi.value = data.activeJudges
  } catch (e) {
    snackbar.showSnackbar('Failed to fetch judge scores.', 'error')
    console.error(e)
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

onMounted(async () => {
  await fetchData()
  refreshInterval = setInterval(fetchData, 10000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
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

const category = computed(() => {
  if (!event.value?.segments) return null
  return event.value.segments
    .flatMap((segment) => segment.categories)
    .find((cat) => cat.id.toString() === categoryId.value)
})

const segment = computed(() => {
  if (!event.value?.segments) return null
  return event.value.segments.find((s) =>
    s.categories.some((c) => c.id.toString() === categoryId.value)
  )
})

const handlePrint = async () => {
  if (!event.value || !segment.value || !category.value) {
    snackbar.showSnackbar('Cannot print without event, segment or category.', 'error')
    return
  }

  maleRankings.value = maleItems.value.filter((p) => p.rank === 1).slice(0, 3)
  femaleRankings.value = femaleItems.value.filter((p) => p.rank === 1).slice(0, 3)
  printTitle.value = `Category Ranking – ${category.value.name} (${Number(category.value.weight) * 100}%)`

  if (!maleRankings.value.length && !femaleRankings.value.length) {
    snackbar.showSnackbar('No ranking data found.', 'info')
    return
  }

  await nextTick()
  await printableRef.value?.generatePdf()
}

const isJudgeActive = (judge: JudgeData) => {
  return activeJudgesFromApi.value.some(
    (activeApiJudge) => String(activeApiJudge.documentId) === String(judge.documentId)
  )
}

const headers = computed<DataTableHeader[]>(() => {
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

  const judgeHeaders: DataTableHeader[] = allJudges.value
    .sort((a: JudgeData, b: JudgeData) => a.name.localeCompare(b.name))
    .map((judge) => {
      const judgeKey = `judge_${judge.name.replace(/\s/g, '_')}`
      return {
        title: judge.name,
        key: judgeKey,
        align: 'end',
        sortable: true,
        width: '300px',
      }
    })

  return [
    ...staticHeaders,
    ...judgeHeaders,
    {
      title: 'Average',
      key: 'averaged_score',
      align: 'end',
      sortable: true,
    },
    { title: 'Rank', key: 'rank', align: 'center', sortable: true, fixed: 'end' },
  ]
})
</script>

<style scoped>
.active-judge-header {
  color: green !important; /* Green text for the header */
}
.judge-col-header {
  min-width: 120px;
  max-width: 150px;
  white-space: nowrap;
  text-align: right;
}
.hover-underline {
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
.participant-table :deep(.v-data-table__td) {
  font-size: 15px !important;
  height: 64px !important;
}
</style>
