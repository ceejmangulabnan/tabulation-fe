<template>
  <div
    class="mx-auto max-w-7xl px-4 py-6"
    v-if="event"
  >
    <div class="flex justify-between items-start mb-4 flex-wrap gap-2">
      <header class="flex items-center gap-3 w-full justify-between">
        <UBadge
          :color="statusColor"
          size="lg"
          class="font-bold flex-shrink-0 capitalize"
        >
          {{ event?.event_status.toUpperCase() }}
        </UBadge>
        <div class="hidden md:flex flex-wrap gap-2 flex-shrink-0">
          <UTooltip text="Print Rankings">
            <UButton
              icon="i-lucide-printer"
              variant="ghost"
              @click="showPrintDialog = true"
            />
          </UTooltip>
          <UTooltip text="Refresh Data">
            <UButton
              icon="i-lucide-refresh-cw"
              :loading="eventsStore.isLoading"
              variant="ghost"
              @click="refreshEventData()"
            />
          </UTooltip>
          <UTooltip text="Manage Event">
            <UButton
              icon="i-lucide-settings"
              variant="ghost"
              :to="`/admin/events/${eventId}/manage`"
            />
          </UTooltip>
          <UTooltip text="Setup Event">
            <UButton
              icon="i-lucide-pencil"
              variant="ghost"
              :to="`/admin/events/${eventId}/setup`"
            />
          </UTooltip>
          <UTooltip text="Delete Event">
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="deleteEvent"
            />
          </UTooltip>
        </div>
        <div class="block md:hidden">
          <UDropdownMenu :items="mobileMenuItems">
            <UButton
              icon="i-lucide-ellipsis-vertical"
              variant="ghost"
            />
          </UDropdownMenu>
        </div>
      </header>

      <NuxtLink
        :to="`/admin/events/${eventId}`"
        class="text-decoration-none hover:underline"
      >
        <div class="flex flex-col gap-1">
          <h1 class="text-xl sm:text-2xl font-bold my-0">{{ event?.name }}</h1>
          <p class="text-sm sm:text-base text-muted my-0">
            {{ event?.description || 'No description provided.' }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <UTabs
      v-model="selectedSegmentTab"
      :items="segmentTabs"
    />

    <!-- Segment Scores -->
    <div
      v-for="segment in event?.segments"
      :key="segment.documentId"
    >
      <UCard
        v-if="selectedSegmentTab === segment.documentId"
        class="mt-4"
      >
        <div class="flex items-center gap-2 mb-4">
          <h3 class="font-bold text-lg">{{ segment.name }} Scores</h3>
          <UButton
            icon="i-lucide-refresh-cw"
            :loading="eventsStore.isLoading"
            variant="ghost"
            size="xs"
            @click="fetchSegmentScores(segment.documentId)"
          />
        </div>

        <UTabs
          v-model="activeGenderTab"
          :items="genderTabs"
          class="mb-4"
        />

        <div class="overflow-x-auto">
          <UTable
            v-if="activeGenderTab === 'male'"
            :data="maleSegmentResults"
            :columns="segmentHeaders"
          >
            <template #name-cell="{ row }">
              <div class="flex items-center gap-4">
                <img
                  v-if="row.original.headshot"
                  :src="getStrapiUrl(row.original.headshot)"
                  class="w-16 h-16 rounded-full object-cover cursor-pointer"
                  @click="showImagePreview(row.original.headshot)"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-full bg-muted flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-user"
                    class="size-6"
                  />
                </div>
                <span>{{ row.original.name }}</span>
              </div>
            </template>
          </UTable>
          <UTable
            v-else
            :data="femaleSegmentResults"
            :columns="segmentHeaders"
          >
            <template #name-cell="{ row }">
              <div class="flex items-center gap-4">
                <img
                  v-if="row.original.headshot"
                  :src="getStrapiUrl(row.original.headshot)"
                  class="w-16 h-16 rounded-full object-cover cursor-pointer"
                  @click="showImagePreview(row.original.headshot)"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-full bg-muted flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-user"
                    class="size-6"
                  />
                </div>
                <span>{{ row.original.name }}</span>
              </div>
            </template>
          </UTable>
        </div>
      </UCard>
    </div>

    <!-- Final Rankings -->
    <UCard
      v-if="selectedSegmentTab === 'final-rankings'"
      class="mt-4"
    >
      <div class="flex items-center gap-2 mb-4">
        <h3 class="font-bold text-lg">Final Rankings</h3>
        <UButton
          icon="i-lucide-refresh-cw"
          :loading="eventsStore.isLoading"
          variant="ghost"
          size="xs"
          @click="fetchFinalScores"
        />
      </div>

      <UTabs
        v-model="activeGenderTab"
        :items="genderTabs"
        class="mb-4"
      />

      <div class="overflow-x-auto">
        <UTable
          v-if="activeGenderTab === 'male'"
          :data="finalMaleResults"
          :columns="finalRankingsHeaders"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-4">
              <img
                v-if="row.original.headshot"
                :src="getStrapiUrl(row.original.headshot)"
                class="w-16 h-16 rounded-full object-cover cursor-pointer"
                @click="showImagePreview(row.original.headshot)"
              />
              <div
                v-else
                class="w-16 h-16 rounded-full bg-muted flex items-center justify-center"
              >
                <UIcon
                  name="i-lucide-user"
                  class="size-6"
                />
              </div>
              <span>{{ row.original.name }}</span>
            </div>
          </template>
        </UTable>
        <UTable
          v-else
          :data="finalFemaleResults"
          :columns="finalRankingsHeaders"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-4">
              <img
                v-if="row.original.headshot"
                :src="getStrapiUrl(row.original.headshot)"
                class="w-16 h-16 rounded-full object-cover cursor-pointer"
                @click="showImagePreview(row.original.headshot)"
              />
              <div
                v-else
                class="w-16 h-16 rounded-full bg-muted flex items-center justify-center"
              >
                <UIcon
                  name="i-lucide-user"
                  class="size-6"
                />
              </div>
              <span>{{ row.original.name }}</span>
            </div>
          </template>
        </UTable>
      </div>
    </UCard>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <!-- Judges -->
      <UCard>
        <h3 class="font-bold text-lg mb-2">Assigned Judges ({{ event?.judges?.length || 0 }})</h3>
        <div class="space-y-2">
          <div
            v-if="!event?.judges?.length"
            class="text-muted"
          >
            No judges assigned.
          </div>
          <div
            v-for="judge in event?.judges"
            :key="judge.id"
            class="flex items-center gap-3 p-2"
          >
            <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <UIcon name="i-lucide-briefcase" />
            </div>
            <div>
              <div class="font-medium">{{ judge.name }}</div>
              <div class="text-sm text-muted">{{ judge.users_permissions_user?.email }}</div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Segment Status -->
      <UCard>
        <h3 class="font-bold text-lg mb-2">
          Segment & Scoring Overview ({{ event?.segments?.length || 0 }})
        </h3>
        <div v-if="!event?.segments || event.segments.length === 0">
          No segments defined for this event.
        </div>
        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="segment in event?.segments"
            :key="segment.id"
          >
            <div class="font-bold flex items-center gap-2">
              <UBadge
                :color="getSegmentStatusColor(segment.segment_status)"
                size="xs"
                class="capitalize"
              >
                {{ segment.segment_status }}
              </UBadge>
              {{ segment.name }} (Weight: {{ segment.weight * 100 }}%)
            </div>
            <div class="ml-4 space-y-1 mt-1">
              <div
                v-for="category in segment.categories"
                :key="category.id"
                class="text-sm"
              >
                <div class="font-medium">{{ category.name }}</div>
                <div class="text-muted">
                  Scoring Progress:
                  {{ getScoringProgress(category, event?.judges || [], event?.scores || []) }}
                </div>
              </div>
              <div
                v-if="!segment.categories || segment.categories.length === 0"
                class="text-sm text-muted"
              >
                No categories in this segment.
              </div>
            </div>
          </div>
        </div>
        <p class="font-bold text-right mt-4">Total Segment Weight: {{ totalSegmentWeight }}%</p>
      </UCard>
    </div>

    <div class="mt-4">
      <AdminEventRequestTable />
    </div>

    <!-- Print Dialog -->
    <UModal
      v-model:open="showPrintDialog"
      title="Print Rankings"
    >
      <template #body>
        <div class="space-y-4">
          <USelect
            v-model="printType"
            :items="[
              { label: 'Per Segment', value: 'segment' },
              { label: 'Per Category', value: 'category' },
              { label: 'Final Ranking', value: 'final' },
            ]"
            label="Ranking Type"
          />
          <USelect
            v-if="printType !== 'final'"
            :model-value="String(selectedSegmentTab ?? '')"
            :items="event?.segments?.map((s) => ({ label: s.name, value: s.documentId })) || []"
            label="Segment"
            @update:model-value="
              (val: any) => {
                selectedSegmentTab = val
                printCategoryId = undefined
              }
            "
          />
          <USelect
            v-if="printType === 'category'"
            v-model="printCategoryId"
            :items="currentSegmentCategories"
            label="Category"
          />
          <USelect
            v-model="printGender"
            :items="[
              { label: 'Both', value: 'both' },
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ]"
            label="Gender"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="showPrintDialog = false"
          />
          <UButton
            label="Print"
            @click="confirmPrint"
          />
        </div>
      </template>
    </UModal>

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
  </div>
</template>

<script setup lang="ts">
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
  category_scores: { [categoryName: string]: CategoryScoreDetail }
  averaged_score: number
  raw_averaged_score: number
  rank: number
  participant_status?: string
}

interface CategoryDataFromSegmentApi {
  documentId: string
  name: string
  weight: number
}

interface SegmentScoresApiResponse {
  event: any
  segment: { documentId: string; name: string; order: number; weight: number }
  categories: CategoryDataFromSegmentApi[]
  results: { male: SegmentResultParticipant[]; female: SegmentResultParticipant[] }
}

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
  segments: {
    documentId: string
    name: string
    order: number
    weight: number
    scoring_mode?: string
  }[]
  results: { male: FinalParticipant[]; female: FinalParticipant[] }
}

definePageMeta({ layout: 'admin-event' })
const route = useRoute()
const eventsStore = useEventsStore()
const router = useRouter()
const api = useStrapiApi()
const { showSnackbar } = useSnackbar()
const eventId = route.params.id as string
const event = computed(() => eventsStore.event)
const { activeParticipantCount, displayRankScore, displaySegmentAvgRank } = useRankingDisplay(
  computed(() => event.value?.participants || []) as Ref<any[]>
)

const selectedSegmentTab = ref<string | undefined>(undefined)
const activeGenderTab = ref('male')

const genderTabs = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

const mobileMenuItems = [
  [
    {
      label: 'Print Rankings',
      icon: 'i-lucide-printer',
      onSelect: () => (showPrintDialog.value = true),
    },
    { label: 'Refresh Data', icon: 'i-lucide-refresh-cw', onSelect: () => refreshEventData() },
    {
      label: 'Manage Event',
      icon: 'i-lucide-settings',
      onSelect: () => navigateTo(`/admin/events/${eventId}/manage`),
    },
    {
      label: 'Setup Event',
      icon: 'i-lucide-pencil',
      onSelect: () => navigateTo(`/admin/events/${eventId}/setup`),
    },
    {
      label: 'Delete Event',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => deleteEvent(),
    },
  ],
]

const maleSegmentResults = ref<SegmentResultParticipant[]>([])
const femaleSegmentResults = ref<SegmentResultParticipant[]>([])
const segmentCategories = ref<CategoryDataFromSegmentApi[]>([])
const finalMaleResults = ref<FinalParticipant[]>([])
const finalFemaleResults = ref<FinalParticipant[]>([])
const finalSegments = ref<FinalEventScoresResponse['segments']>([])

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

const segmentTabs = computed(() => {
  const segTabs = (event.value?.segments || []).map((s) => ({
    label: s.name,
    value: s.documentId,
  }))
  segTabs.push({ label: 'Final Rankings', value: 'final-rankings' })
  return segTabs
})

onMounted(async () => {
  await eventsStore.fetchEvent(eventId)
  if (!event.value) {
    showSnackbar('Failed to load event data.', 'error')
    return
  }
  if (event.value.segments && event.value.segments.length > 0) {
    const firstSegmentWithId = event.value.segments.find((s) => s.documentId)
    if (firstSegmentWithId) {
      selectedSegmentTab.value = firstSegmentWithId.documentId
      await fetchSegmentScores(firstSegmentWithId.documentId!)
    } else {
      selectedSegmentTab.value = 'final-rankings'
      await fetchFinalScores()
    }
  } else {
    selectedSegmentTab.value = 'final-rankings'
    await fetchFinalScores()
  }
})

watch(selectedSegmentTab, async (newTab) => {
  if (!newTab) return
  if (!eventsStore.event) return
  if (newTab === 'final-rankings') {
    if (finalMaleResults.value.length === 0 && finalFemaleResults.value.length === 0) {
      await fetchFinalScores()
    }
  } else {
    await fetchSegmentScores(String(newTab))
  }
})

const fetchSegmentScores = async (segmentDocumentId: string) => {
  if (!event.value) {
    showSnackbar('Event data not available.', 'error')
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
    showSnackbar('Failed to fetch segment scores.', 'error')
    console.error(e)
  } finally {
    eventsStore.isLoading = false
  }
}

const fetchFinalScores = async () => {
  if (!event.value) {
    showSnackbar('Event data not available.', 'error')
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
    showSnackbar('Failed to fetch final scores.', 'error')
    console.error(e)
  } finally {
    eventsStore.isLoading = false
  }
}

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

const statusColor = computed(() => {
  switch (event.value?.event_status) {
    case 'draft':
      return 'neutral'
    case 'active':
      return 'success'
    case 'inactive':
      return 'warning'
    case 'finished':
      return 'info'
    default:
      return 'neutral'
  }
})

function getSegmentStatusColor(status: 'draft' | 'inactive' | 'active' | 'closed') {
  switch (status) {
    case 'draft':
      return 'neutral'
    case 'inactive':
      return 'warning'
    case 'active':
      return 'success'
    case 'closed':
      return 'info'
    default:
      return 'neutral'
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

const segmentHeaders = computed(() => {
  const staticHeaders = [
    {
      accessorKey: 'participant_number',
      header: 'No.',
      meta: { class: { td: 'w-[60px]', th: 'w-[60px]' } },
    },
    {
      accessorKey: 'name',
      header: 'Participant',
      meta: { class: { td: 'min-w-[250px] whitespace-nowrap', th: 'min-w-[250px]' } },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      meta: { class: { td: 'min-w-[150px]', th: 'min-w-[150px]' } },
    },
  ]
  const catHeaders = segmentCategories.value.map((category) => ({
    accessorFn: (row: SegmentResultParticipant) =>
      row.category_scores?.[category.name]?.averaged_score ?? '-',
    header: `${category.name} (${category.weight * 100}%)`,
  }))
  return [
    ...staticHeaders,
    ...catHeaders,
    { accessorKey: 'averaged_score', header: 'Total Segment Score' },
    { accessorKey: 'rank', header: 'Rank' },
  ]
})

const finalRankingsHeaders = computed(() => {
  const staticHeaders = [
    {
      accessorKey: 'participant_number',
      header: 'No.',
      meta: { class: { td: 'w-[60px]', th: 'w-[60px]' } },
    },
    {
      accessorKey: 'name',
      header: 'Participant',
      meta: { class: { td: 'min-w-[250px] whitespace-nowrap', th: 'min-w-[250px]' } },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      meta: { class: { td: 'min-w-[150px]', th: 'min-w-[150px]' } },
    },
  ]
  const segHeaders = finalSegments.value.map((segment) => ({
    accessorFn: (row: FinalParticipant) =>
      row.segment_scores?.[segment.documentId]?.averaged_score ?? '-',
    header:
      segment.scoring_mode === 'ranking'
        ? segment.name
        : `${segment.name} (${segment.weight * 100}%)`,
  }))
  return [
    ...staticHeaders,
    ...segHeaders,
    { accessorKey: 'averaged_score', header: 'Total Score' },
    { accessorKey: 'rank', header: 'Rank' },
  ]
})

// Print functionality
const showPrintDialog = ref<boolean>(false)
const printableRef = ref<any | null>(null)
const printType = ref<'segment' | 'category' | 'final'>('segment')
const printCategoryId = ref<string | undefined>(undefined)
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
    selectedSegment.value.categories?.map((cat) => ({ label: cat.name, value: cat.documentId })) ||
    []
  )
})

const fetchRankings = async () => {
  let url = ''
  const segmentId = selectedSegment.value?.documentId
  const categoryId = printCategoryId.value
  if (printType.value === 'category') {
    if (!segmentId || !categoryId) {
      showSnackbar('Please select a segment and a category.', 'warning')
      return false
    }
    url = `/admin/events/${event.value?.documentId}/segments/${segmentId}/categories/${categoryId}/ranking`
    const categoryName = currentSegmentCategories.value?.find((c) => c.value === categoryId)?.label
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
    console.log('RANKING DATA to PRINT', data)
    const results: { male: any[]; female: any[] } = data.results
    maleRankings.value = []
    femaleRankings.value = []
    if (printType.value === 'category') {
      if (printGender.value === 'male' || printGender.value === 'both')
        maleRankings.value = results.male.filter((p) => p.rank === 1).slice(0, 3)
      if (printGender.value === 'female' || printGender.value === 'both')
        femaleRankings.value = results.female.filter((p) => p.rank === 1).slice(0, 3)
    } else if (printType.value === 'segment' || printType.value === 'final') {
      if (printGender.value === 'male' || printGender.value === 'both')
        maleRankings.value = results.male.slice(0, 5)
      if (printGender.value === 'female' || printGender.value === 'both')
        femaleRankings.value = results.female.slice(0, 5)
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
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    showSnackbar('Popup blocked. Please allow popups for this site.', 'warning')
    return
  }
  const ok = await fetchRankings()
  if (!ok) {
    printWindow.close()
    return
  }
  showPrintDialog.value = false
  await nextTick()
  try {
    await printableRef.value?.generatePdf(printWindow)
  } catch (err) {
    console.error('PDF generation failed:', err)
    showSnackbar('Failed to generate PDF.', 'error')
    printWindow.close()
  }
}

watch(printType, (val) => {
  if (val === 'segment') printCategoryId.value = undefined
  else if (val === 'final') {
    selectedSegmentTab.value = 'final-rankings'
    printCategoryId.value = undefined
  }
})

watch(selectedSegmentTab, (newVal) => {
  if (newVal === 'final-rankings') printType.value = 'final'
  else if (printType.value === 'final') printType.value = 'segment'
  printCategoryId.value = undefined
})
</script>
