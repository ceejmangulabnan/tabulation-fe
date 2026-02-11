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
        <h1 class="text-h6 font-weight-bold">
          {{ category?.name }} - {{ (category?.weight || 0) * 100 }}%
        </h1>
        <v-tabs
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
              item-key="id"
              class="elevation-1"
              :sort-by="[{ key: 'rank', order: 'asc' }]"
            >
              <template
                v-for="judge in judges"
                #[`header.judge_${judge.id}`]="{ column }"
                :key="`judge-header-male-${judge.id}`"
              >
                <span
                  :class="{ 'active-judge-header': isJudgeActive(judge) }"
                  class="font-weight-bold"
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
              item-key="id"
              class="elevation-1"
              :sort-by="[{ key: 'rank', order: 'asc' }]"
            >
              <template
                v-for="judge in judges"
                #[`header.judge_${judge.id}`]="{ column }"
                :key="`judge-header-female-${judge.id}`"
              >
                <span
                  :class="{ 'active-judge-header': isJudgeActive(judge) }"
                  class="font-weight-bold"
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
  </v-container>
</template>

<script setup lang="ts">
interface DataTableHeader {
  key: string
  title: string
  align?: 'start' | 'end' | 'center'
  sortable?: boolean
  class?: string
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
const maleRankings = ref<any[]>([])
const femaleRankings = ref<any[]>([])
const printTitle = ref('')

const event = computed(() => eventsStore.event)

const fetchData = async () => {
  await eventsStore.fetchEvent(eventId)
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

  const url = `/admin/events/${event.value.documentId}/segments/${segment.value.documentId}/categories/${category.value.documentId}/ranking`
  printTitle.value = `Category Ranking – ${category.value.name}`

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

    maleRankings.value = results.male.filter((p) => p.rank === 1).slice(0, 3)
    femaleRankings.value = results.female.filter((p) => p.rank === 1).slice(0, 3)
    if (!maleRankings.value.length && !femaleRankings.value.length) {
      snackbar.showSnackbar('No ranking data found.', 'info')
      return
    }

    await nextTick()
    await printableRef.value?.generatePdf()
  } catch (err) {
    console.error(err)
    snackbar.showSnackbar('Failed to fetch rankings for printing.', 'error')
  }
}

const judges = computed(() => event.value?.judges || [])
const participants = computed(() => event.value?.participants || [])
const maleParticipants = computed(() => participants.value.filter((p) => p.gender === 'male'))
const femaleParticipants = computed(() => participants.value.filter((p) => p.gender === 'female'))

const getJudgeScore = (participantId: number, judgeId: number) => {
  if (!event.value?.scores) return null
  const score = event.value.scores.find(
    (s) =>
      s.participant?.id === participantId &&
      s.judge?.id === judgeId &&
      s.category?.id.toString() === categoryId.value
  )
  return score?.value || null
}

const getAverageScore = (participantId: number) => {
  if (!event.value?.scores || !category.value) return '-'

  // Filter judges to include only active judges for the current category
  const activeJudgesForCategory = judges.value.filter((judge) =>
    category.value?.active_judges?.some(
      (activeJudge) => String(activeJudge.documentId) === String(judge.documentId)
    )
  )

  if (activeJudgesForCategory.length === 0) {
    return '-'
  }

  const validScores = activeJudgesForCategory
    .map((judge) => getJudgeScore(participantId, judge.id))
    .filter((score) => score !== null) as number[]

  if (validScores.length === 0) {
    return '-'
  }

  const totalScore = validScores.reduce((total, score) => total + score, 0)
  return (totalScore / activeJudgesForCategory.length).toFixed(3)
}

const getRank = (participant: ParticipantData, gender: 'male' | 'female') => {
  const participantsByGender = gender === 'male' ? maleParticipants.value : femaleParticipants.value
  const sortedParticipants = [...participantsByGender].sort((a, b) => {
    return parseFloat(getAverageScore(b.id)) - parseFloat(getAverageScore(a.id))
  })
  const rank = sortedParticipants.findIndex((p) => p.id === participant.id) + 1
  return rank
}

const isJudgeActive = (judge: JudgeData) => {
  return category.value?.active_judges?.some(
    (activeJudge) => String(activeJudge.documentId) === String(judge.documentId)
  )
}

const headers = computed<DataTableHeader[]>(() => {
  const judgeHeaders: DataTableHeader[] = judges.value
    .sort((a: JudgeData, b: JudgeData) => a.name.localeCompare(b.name))
    .map((judge) => {
      return {
        title: judge.name,
        key: `judge_${judge.id}`,
        align: 'end',
        sortable: true,
      }
    })

  return [
    { title: 'Rank', key: 'rank', align: 'start', sortable: true, order: 'asc' },
    { title: 'Participant', key: 'name', align: 'start', sortable: true },
    ...judgeHeaders,
    { title: 'Average', key: 'average', align: 'end', sortable: true },
  ]
})

const createTableItems = (gender: 'male' | 'female') => {
  const participantsToProcess =
    gender === 'male' ? maleParticipants.value : femaleParticipants.value
  return participantsToProcess.map((participant) => {
    const scores = judges.value.reduce(
      (acc, judge) => {
        acc[`judge_${judge.id}`] = getJudgeScore(participant.id, judge.id)
        return acc
      },
      {} as Record<string, number>
    )

    return {
      id: participant.id,
      rank: getRank(participant, gender),
      name: participant.name,
      ...scores,
      average: getAverageScore(participant.id),
    }
  })
}

const maleItems = computed(() => createTableItems('male'))
const femaleItems = computed(() => createTableItems('female'))
</script>

<style scoped>
.active-judge-header {
  color: green !important; /* Green text for the header */
}
</style>
