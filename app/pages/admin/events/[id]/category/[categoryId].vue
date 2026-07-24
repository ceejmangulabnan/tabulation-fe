<template>
  <div class="mx-auto max-w-7xl px-4 py-6">
    <div class="flex justify-between items-start mb-4 flex-wrap gap-2">
      <header class="flex items-center gap-3 w-full justify-between">
        <UBadge
          :color="statusColor"
          size="lg"
          class="font-bold flex-shrink-0 capitalize"
        >
          {{ event?.event_status.toUpperCase() }}
        </UBadge>
        <div class="flex flex-wrap gap-2 flex-shrink-0">
          <UTooltip text="Print Rankings">
            <UButton
              icon="i-lucide-printer"
              variant="ghost"
              @click="handlePrint"
            />
          </UTooltip>
          <UTooltip text="Refresh Data">
            <UButton
              icon="i-lucide-refresh-cw"
              :loading="eventsStore.isLoading"
              variant="ghost"
              @click="fetchData"
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
      </header>

      <NuxtLink
        :to="`/admin/events/${eventId}`"
        class="text-decoration-none hover:underline"
      >
        <div class="flex flex-col gap-1">
          <h1 class="text-xl sm:text-2xl font-bold">{{ event?.name }}</h1>
          <p class="text-sm sm:text-base text-muted">
            {{ event?.description || 'No description provided.' }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <h2 class="text-lg font-bold mb-4">
      {{ category?.name }} - {{ (category?.weight || 0) * 100 }}%
    </h2>

    <UTabs
      v-model="tab"
      :items="genderTabs"
      class="mb-4"
    />

    <UTable
      v-if="tab === 'male'"
      :data="maleItems"
      :columns="headers"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-4">
          <img
            v-if="row.original.headshot"
            :src="getStrapiImageUrl(row.original.headshot)"
            class="w-16 h-16 rounded-full object-cover cursor-pointer"
            @click="showImagePreview(row.original.headshot)"
          />
          <div
            v-else
            class="w-16 h-16 rounded-full bg-muted flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-user"
              class="size-4"
            />
          </div>
          <span>{{ row.original.name }}</span>
        </div>
      </template>
    </UTable>
    <UTable
      v-else
      :data="femaleItems"
      :columns="headers"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-4">
          <img
            v-if="row.original.headshot"
            :src="getStrapiImageUrl(row.original.headshot)"
            class="w-16 h-16 rounded-full object-cover cursor-pointer"
            @click="showImagePreview(row.original.headshot)"
          />
          <div
            v-else
            class="w-16 h-16 rounded-full bg-muted flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-user"
              class="size-4"
            />
          </div>
          <span>{{ row.original.name }}</span>
        </div>
      </template>
    </UTable>

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
  </div>
</template>

<script setup lang="ts">
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
  participant_status?: string
  [key: `judge_${string}`]: number | null
}

interface JudgeScoresApiResponse {
  event: any
  activeJudges: { documentId: string; name: string }[]
  results: { male: RankedParticipant[]; female: RankedParticipant[] }
}

const route = useRoute()
const eventId = route.params.id as string
const categoryId = computed(() => route.params.categoryId as string)
const eventsStore = useEventsStore()
const { showSnackbar } = useSnackbar()
const api = useStrapiApi()
const router = useRouter()
const tab = ref('male')
const genderTabs = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]
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

const fetchData = async () => {
  await eventsStore.fetchEvent(eventId)
  if (!event.value || !segment.value || !category.value) {
    showSnackbar('Failed to load event, segment or category data.', 'error')
    return
  }

  const apiUrl = `/admin/events/${event.value.documentId}/segments/${segment.value.documentId}/categories/${category.value.documentId}/judge-scores`
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
    showSnackbar('Failed to fetch judge scores.', 'error')
    console.error(e)
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

onMounted(async () => {
  await fetchData()
  refreshInterval = setInterval(fetchData, 10000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

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
    showSnackbar('Cannot print without event, segment or category.', 'error')
    return
  }
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    showSnackbar('Popup blocked. Please allow popups for this site.', 'warning')
    return
  }
  maleRankings.value = maleItems.value.filter((p) => p.rank === 1).slice(0, 3)
  femaleRankings.value = femaleItems.value.filter((p) => p.rank === 1).slice(0, 3)
  printTitle.value = `Category Ranking – ${category.value.name} (${Number(category.value.weight) * 100}%)`
  if (!maleRankings.value.length && !femaleRankings.value.length) {
    printWindow.close()
    showSnackbar('No ranking data found.', 'info')
    return
  }
  await nextTick()
  await printableRef.value?.generatePdf(printWindow)
}

const isJudgeActive = (judge: any) => {
  return activeJudgesFromApi.value.some(
    (activeApiJudge) => String(activeApiJudge.documentId) === String(judge.documentId)
  )
}

const headers = computed(() => {
  const staticHeaders = [
    { accessorKey: 'participant_number', header: 'No.' },
    { accessorKey: 'name', header: 'Participant' },
    { accessorKey: 'department', header: 'Department' },
  ]
  const judgeHeaders = allJudges.value
    .sort((a: any, b: any) => a.name.localeCompare(b.name))
    .map((judge: any) => ({
      accessorKey: `judge_${judge.name.replace(/\s/g, '_')}`,
      header: judge.name,
    }))
  return [
    ...staticHeaders,
    ...judgeHeaders,
    { accessorKey: 'averaged_score', header: 'Average' },
    { accessorKey: 'rank', header: 'Rank' },
  ]
})
</script>
