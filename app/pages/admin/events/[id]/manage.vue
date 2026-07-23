<template>
  <div class="p-4">
    <div class="flex justify-between items-start mb-4 flex-wrap gap-2">
      <header class="flex justify-between w-full items-center gap-2 flex-shrink-0">
        <UBadge
          :label="event?.event_status.toUpperCase()"
          :color="statusColor"
          size="lg"
          class="font-bold flex-shrink-0"
        />
        <div class="flex flex-wrap gap-2 flex-shrink-0">
          <UButton
            icon="i-lucide-printer"
            color="purple"
            variant="ghost"
            title="Print Rankings"
            @click="showPrintDialog = true"
          />
          <UButton
            icon="i-lucide-refresh-cw"
            color="primary"
            variant="ghost"
            :loading="eventsStore.isLoading"
            title="Refetch Scores"
            @click="refreshEventData"
          />
          <UButton
            icon="i-lucide-settings"
            color="blue"
            variant="ghost"
            title="Manage Event"
            :to="`/admin/events/${eventId}/manage`"
          />
          <UButton
            icon="i-lucide-pencil"
            color="green"
            variant="ghost"
            title="Setup Event"
            :to="`/admin/events/${eventId}/setup`"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="red"
            variant="ghost"
            title="Delete Event"
            @click="deleteEvent"
          />
        </div>
      </header>

      <NuxtLink
        :to="`/admin/events/${eventId}`"
        class="text-decoration-none hover:underline"
      >
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-bold mb-2">{{ event?.name }}</h1>
          <p class="text-sm text-muted">{{ event?.description || 'No description provided.' }}</p>
        </div>
      </NuxtLink>
    </div>

    <UTabs
      v-model="activeTab"
      :items="tabItems"
      class="my-4"
    />

    <!-- View Scores Tab -->
    <div v-if="activeTab === 'view-scores'">
      <UCard>
        <h2 class="text-lg font-bold mb-4">Participant Scores</h2>
        <USelect
          v-model="selectedSegmentId"
          :items="(event?.segments || []).map((s: SegmentData) => ({ label: s.name, value: s.documentId }))"
          placeholder="Select Segment"
          class="w-full mb-4"
          clearable
        />

        <UTabs
          v-model="activeGenderTab"
          :items="genderTabItems"
          class="mt-4"
        />

        <!-- Male Table -->
        <div v-if="activeGenderTab === 'male'">
          <UTable
            :data="maleParticipantsData"
            :columns="scoreColumns"
            v-model:expanded="expandedMale"
          >
            <template #name-cell="{ row }">
              <div class="flex items-center py-2">
                <img
                  v-if="row.original.headshot"
                  :src="getStrapiUrl(row.original.headshot.formats.thumbnail.url)"
                  class="w-10 h-10 rounded-full mr-3 object-cover cursor-pointer"
                  @click="showImagePreview(row.original.headshot.url)"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3"
                >
                  <UIcon name="i-lucide-user" class="text-gray-500" />
                </div>
                <UBadge
                  v-if="row.original.isEliminated"
                  label="E"
                  color="red"
                  size="sm"
                  class="mr-2"
                />
                <div class="font-bold">{{ row.original.name }}</div>
              </div>
            </template>

            <template #department.name-cell="{ row }">
              {{ row.original.department?.name || 'N/A' }}
            </template>

            <template #averaged_score-cell="{ row }">
              <strong class="text-lg">{{ row.original.averaged_score }}</strong>
            </template>

            <template #expanded-row="{ row }">
              <div class="p-4">
                <div class="text-lg font-bold mb-2">Score Details</div>
                <template v-if="selectedSegment?.categories?.length">
                  <UCollapse
                    v-for="cat in selectedSegment.categories"
                    :key="cat.id"
                    class="mb-2"
                  >
                    <template #header="{ open }">
                      <div class="flex justify-between w-full items-center">
                        <span>
                          {{ cat.name }} ({{ Math.round(cat.weight * 100) }}%)
                        </span>
                        <strong>
                          Avg: {{ getParticipantCategoryAverage(row.original.documentId, cat).toFixed(2) }}
                        </strong>
                      </div>
                    </template>
                    <div class="py-2">
                      <div
                        v-for="judge in sortedJudges"
                        :key="judge.id"
                        class="flex justify-between items-center py-1 px-2"
                        :class="{ 'text-green-500 font-bold': isJudgeActiveForCategory(judge.documentId, cat.documentId) }"
                      >
                        <span>{{ judge.name }}</span>
                        <strong>
                          {{ getParticipantScoreForCategoryByJudge(row.original.documentId, cat.documentId, judge.documentId) }}
                        </strong>
                      </div>
                    </div>
                  </UCollapse>
                </template>
              </div>
            </template>
          </UTable>
        </div>

        <!-- Female Table -->
        <div v-if="activeGenderTab === 'female'">
          <UTable
            :data="femaleParticipantsData"
            :columns="scoreColumns"
            v-model:expanded="expandedFemale"
          >
            <template #name-cell="{ row }">
              <div class="flex items-center py-2">
                <img
                  v-if="row.original.headshot"
                  :src="getStrapiUrl(row.original.headshot.formats.thumbnail.url)"
                  class="w-10 h-10 rounded-full mr-3 object-cover cursor-pointer"
                  @click="showImagePreview(row.original.headshot.url)"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3"
                >
                  <UIcon name="i-lucide-user" class="text-gray-500" />
                </div>
                <UBadge
                  v-if="row.original.isEliminated"
                  label="E"
                  color="red"
                  size="sm"
                  class="mr-2"
                />
                <div class="font-bold">{{ row.original.name }}</div>
              </div>
            </template>

            <template #department.name-cell="{ row }">
              {{ row.original.department?.name || 'N/A' }}
            </template>

            <template #averaged_score-cell="{ row }">
              <strong class="text-lg">{{ row.original.averaged_score }}</strong>
            </template>

            <template #expanded-row="{ row }">
              <div class="p-4">
                <div class="text-lg font-bold mb-2">Score Details</div>
                <template v-if="selectedSegment?.categories?.length">
                  <UCollapse
                    v-for="cat in selectedSegment.categories"
                    :key="cat.id"
                    class="mb-2"
                  >
                    <template #header>
                      <div class="flex justify-between w-full items-center">
                        <span>
                          {{ cat.name }} ({{ Math.round(cat.weight * 100) }}%)
                        </span>
                        <strong>
                          Avg: {{ getParticipantCategoryAverage(row.original.documentId, cat).toFixed(2) }}
                        </strong>
                      </div>
                    </template>
                    <div class="py-2">
                      <div
                        v-for="judge in sortedJudges"
                        :key="judge.id"
                        class="flex justify-between items-center py-1 px-2"
                        :class="{ 'text-green-500 font-bold': isJudgeActiveForCategory(judge.documentId, cat.documentId) }"
                      >
                        <span>{{ judge.name }}</span>
                        <strong>
                          {{ getParticipantScoreForCategoryByJudge(row.original.documentId, cat.documentId, judge.documentId) }}
                        </strong>
                      </div>
                    </div>
                  </UCollapse>
                </template>
              </div>
            </template>
          </UTable>
        </div>
      </UCard>
    </div>

    <!-- Update Scores Tab -->
    <div v-if="activeTab === 'update-scores'">
      <UCard>
        <h2 class="text-lg font-bold mb-4">Update Scores on Behalf of a Judge</h2>
        <USelect
          v-model="selectedJudgeId"
          :items="(event?.judges || []).sort((a: JudgeData, b: JudgeData) => a.name.localeCompare(b.name)).map((j: JudgeData) => ({ label: j.name, value: j.documentId }))"
          placeholder="Select Judge"
          class="w-full mb-4"
        />

        <USelect
          v-model="selectedSegmentId"
          :items="(event?.segments || []).map((s: SegmentData) => ({ label: s.name, value: s.documentId }))"
          placeholder="Select Segment"
          class="w-full mb-4"
          clearable
        />

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
          class="text-center py-8 text-gray-500"
        >
          Please select a judge and a segment to start scoring.
        </div>
      </UCard>
    </div>

    <!-- Segment Management Tab -->
    <div v-if="activeTab === 'segments'">
      <UCard>
        <h2 class="text-lg font-bold mb-4">Segment Management</h2>
        <div v-if="event?.segments?.length">
          <div
            v-for="segment in event.segments"
            :key="segment.id"
            class="mb-4 p-4 border border-gray-200 rounded-lg"
          >
            <div class="font-bold">{{ segment.name }}</div>
            <div class="text-sm text-muted">
              Order: {{ segment.order }} | Weight: {{ segment.weight * 100 }}% | Total Weight of
              Categories: {{ segmentTotalWeight(segment) * 100 }}%
            </div>

            <div class="mt-2 space-y-1">
              <div
                v-for="category in segment.categories"
                :key="category.id"
                class="pl-4"
              >
                <div class="text-sm font-medium">{{ category.name }}</div>
                <div class="text-xs text-muted">Weight: {{ category.weight * 100 }}%</div>
                <div class="text-xs text-muted">
                  Scoring Progress:
                  {{ getScoringProgress(category, event?.judges || [], event?.scores || []) }}
                </div>
              </div>
            </div>

            <div class="mt-3 flex justify-end">
              <USelect
                :model-value="pendingSegmentChanges[segment.id] || segment.segment_status"
                :items="['draft', 'inactive', 'active', 'closed'].map(s => ({ label: s, value: s }))"
                placeholder="Status"
                class="w-40"
                @update:model-value="(val: any) => handleStatusChange(segment.id, val)"
              />
            </div>
          </div>
        </div>
        <div
          v-else
          class="text-center py-8 text-gray-500"
        >
          No segments defined for this event.
        </div>

        <div
          v-if="Object.keys(pendingSegmentChanges).length > 0"
          class="flex justify-end mt-4"
        >
          <UButton
            label="Submit Changes"
            @click="submitSegmentChanges"
          />
        </div>
      </UCard>
    </div>

    <ImagePreviewDialog
      v-model="imagePreviewDialog"
      :image-url="imagePreviewUrl"
    />

    <!-- Print Rankings Dialog -->
    <UModal v-model:open="showPrintDialog" title="Print Rankings">
      <template #body>
        <div class="space-y-4">
          <USelect
            v-model="printType"
            :items="[
              { label: 'Per Segment', value: 'segment' },
              { label: 'Per Category', value: 'category' },
              { label: 'Final Ranking', value: 'final' },
            ]"
            placeholder="Ranking Type"
          />
          <USelect
            v-if="printType !== 'final'"
            v-model="selectedSegmentId"
            :items="(event?.segments || []).map((s: SegmentData) => ({ label: s.name, value: s.documentId }))"
            placeholder="Segment"
            @update:model-value="printCategoryId = null"
          />
          <USelect
            v-if="printType === 'category'"
            v-model="printCategoryId"
            :items="segmentCategories"
            placeholder="Category"
          />
          <USelect
            v-model="printGender"
            :items="[
              { label: 'Both', value: 'both' },
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ]"
            placeholder="Gender"
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
  </div>
</template>

<script setup lang="ts">
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

const refetchInterval = ref<NodeJS.Timeout | null>(null)

const expandedMale = ref<any[]>([])
const expandedFemale = ref<any[]>([])

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

const tabItems = computed(() => [
  { label: 'View Scores', value: 'view-scores' },
  { label: 'Update Scores', value: 'update-scores' },
  { label: 'Segment Management', value: 'segments' },
])

const genderTabItems = computed(() => [
  { label: 'Male Participants', value: 'male' },
  { label: 'Female Participants', value: 'female' },
])

onUnmounted(() => {
  if (refetchInterval.value) {
    clearInterval(refetchInterval.value)
  }
})

watch(activeTab, (newTab, oldTab) => {
  if (newTab === 'view-scores') {
    refetchInterval.value = setInterval(() => {
      refreshEventData()
      fetchSegmentRanking()
    }, 10000)
  } else if (oldTab === 'view-scores' && refetchInterval.value) {
    clearInterval(refetchInterval.value)
    refetchInterval.value = null
  }
})

const statusColor = computed(() => {
  switch (event.value?.event_status) {
    case 'draft':
      return 'neutral' as const
    case 'active':
      return 'success' as const
    case 'inactive':
      return 'warning' as const
    case 'finished':
      return 'info' as const
    default:
      return 'neutral' as const
  }
})

const activeGenderTab = ref('male')
const selectedSegmentId = ref<string | null>(null)

const selectedSegment = computed(() => {
  return event.value?.segments?.find((s) => s.documentId === selectedSegmentId.value) || null
})

const sortedJudges = computed(() => {
  return (event.value?.judges || []).sort((a: JudgeData, b: JudgeData) => a.name.localeCompare(b.name))
})

const segmentCategories = computed(() => {
  if (!selectedSegment.value) return []
  return (
    selectedSegment.value.categories?.map((cat) => ({
      label: cat.name,
      value: cat.documentId,
    })) || []
  )
})

const scoreColumns = [
  { id: 'number', header: 'No.', accessorKey: 'number', sortable: true },
  { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
  { id: 'department.name', header: 'Department', accessorFn: (row: any) => row.department?.name || 'N/A', sortable: true },
  { id: 'averaged_score', header: 'Average Score', accessorKey: 'averaged_score', sortable: true },
  { id: 'rank', header: 'Rank', accessorKey: 'rank', sortable: true },
]

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
  const activeJudgeIds = new Set(
    (category.active_judges || []).map((judge: JudgeData) => judge.documentId)
  )

  const categoryScores = event.value?.scores?.filter(
    (s: any) =>
      s.category?.documentId === category.documentId &&
      s.participant?.documentId === participantId &&
      s.value !== null &&
      activeJudgeIds.has(s.judge?.documentId)
  )
  const totalActiveJudges = category.active_judges?.length || 0

  if (totalActiveJudges === 0) return 0

  if (!categoryScores || categoryScores.length === 0) return 0
  const sum = categoryScores.reduce((acc, s) => acc + s.value, 0)
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

    maleRankings.value = []
    femaleRankings.value = []

    if (printType.value === 'category') {
      if (printGender.value === 'male' || printGender.value === 'both') {
        maleRankings.value = results.male.filter((p) => p.rank === 1).slice(0, 3)
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
.text-muted {
  color: var(--ui-text-muted);
}
</style>
