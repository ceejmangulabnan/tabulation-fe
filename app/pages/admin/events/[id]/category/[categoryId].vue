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
        <h1 class="text-h4 font-weight-bold">
          {{ category?.name }}
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
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
            />
          </v-window-item>
          <v-window-item value="female">
            <v-data-table
              :headers="headers"
              :items="femaleItems"
              item-key="id"
              class="elevation-1"
            />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
interface DataTableHeader {
  key: string
  title: string
  align?: 'start' | 'end' | 'center'
  sortable?: boolean
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

const judges = computed(() => event.value?.judges || [])

const participants = computed(() => event.value?.participants || [])

const maleParticipants = computed(() => participants.value.filter((p) => p.gender === 'male'))

const femaleParticipants = computed(() => participants.value.filter((p) => p.gender === 'female'))

const getJudgeScore = (participantId: number, judgeId: number) => {
  if (!event.value?.scores) return 0
  const score = event.value.scores.find(
    (s) =>
      s.participant?.id === participantId &&
      s.judge?.id === judgeId &&
      s.category?.id.toString() === categoryId.value
  )
  return score?.value || 0
}

const getAverageScore = (participantId: number) => {
  if (!event.value?.scores || judges.value.length === 0) return '0.00'
  const totalScore = judges.value.reduce((total, judge) => {
    return total + getJudgeScore(participantId, judge.id)
  }, 0)
  return (totalScore / judges.value.length).toFixed(2)
}

const getRank = (participant: ParticipantData, gender: 'male' | 'female') => {
  const participantsByGender = gender === 'male' ? maleParticipants.value : femaleParticipants.value
  const sortedParticipants = [...participantsByGender].sort((a, b) => {
    return parseFloat(getAverageScore(b.id)) - parseFloat(getAverageScore(a.id))
  })
  const rank = sortedParticipants.findIndex((p) => p.id === participant.id) + 1
  return rank
}

const headers = computed<DataTableHeader[]>(() => {
  const judgeHeaders: DataTableHeader[] = judges.value.map((judge) => ({
    title: judge.name,
    key: `judge_${judge.id}`,
    align: 'end',
    sortable: true,
  }))

  return [
    { title: 'Rank', key: 'rank', align: 'start', sortable: true },
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
