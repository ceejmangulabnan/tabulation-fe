<template>
  <v-container>
    <div class="d-flex align-top mb-4 flex-wrap ga-2">
      <header class="d-flex flex-column w-100 mb-8 ga-sm-3 align-start ga-1 flex-shrink-1">
        <v-chip
          :color="statusColor"
          size="large"
          class="font-weight-bold flex-shrink-0 ml-n1"
        >
          {{ event?.event_status?.toUpperCase() }}
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

    <v-card>
      <v-tabs
        v-model="tab"
        show-arrows
        color="green"
        @update:model-value="onTabChange"
      >
        <v-tab value="one">Event Info</v-tab>
        <v-tab value="two">Scoring Segments</v-tab>
        <v-tab value="three">Judges</v-tab>
        <v-tab value="four">Participants</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="one">
            <AdminEventSetupInfoTab :event="event" />
          </v-window-item>

          <v-window-item value="two">
            <AdminEventSetupSegmentsTab :event="event" />
          </v-window-item>

          <v-window-item value="three">
            <AdminEventSetupJudgesTab
              :event="event"
              :availableJudges="availableJudges"
              :judgeRoleId="judgeRoleId!"
              @judges-updated="fetchAvailableJudges"
            />
          </v-window-item>

          <v-window-item value="four">
            <AdminEventSetupParticipantsTab
              :event="event"
              :departments="departments"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="green"
          :disabled="!canActivate"
          variant="flat"
          class="ma-3"
          @click="activateEvent"
        >
          Activate Event
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
// --- State ---
const tab = ref('one')
const route = useRoute()
const eventsStore = useEventsStore()
const snackbar = useSnackbar()
const dataLoaded = ref(false)

const event = computed<Partial<EventData>>(() =>
  eventsStore.event
    ? {
        ...eventsStore.event,
        participants: eventsStore.event.participants || [],
        segments: eventsStore.event.segments || [],
        judges: eventsStore.event.judges || [],
        name: eventsStore.event.name || '',
        documentId: eventsStore.event.documentId || '',
      }
    : {
        documentId: '',
        id: 0,
        name: '',
        description: '',
        event_status: 'draft',
        segments: [],
        judges: [],
        participants: [],
      }
)

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
const availableJudges = ref<JudgeData[]>([])
const judgeRoleId = ref<number | null>(null)
const departments = ref<any[]>([])

const eventId = route.params.id as string

const fetchAvailableJudges = async () => {
  try {
    const api = useStrapiApi()
    const res = await api.get('/judges')
    const assignedJudgeIds = new Set(event.value.judges?.map((judge) => judge.documentId) || [])
    availableJudges.value = res.data.data.filter(
      (judge: JudgeData) => !assignedJudgeIds.has(judge.documentId)
    )
  } catch (e) {
    console.error('Could not fetch judges', e)
  }
}

const fetchJudgeRole = async () => {
  try {
    const api = useStrapiApi()
    const res = await api.get('/users-permissions/roles')
    const judgeRole = res.data.roles.find(
      (r: any) => r.type === 'authenticated' || r.name === 'Authenticated'
    )
    if (judgeRole) {
      judgeRoleId.value = judgeRole.id
    } else {
      const authRole = res.data.roles.find((r: any) => r.type === 'authenticated')
      judgeRoleId.value = authRole.id
    }
  } catch (e) {
    console.error('Could not fetch roles', e)
  }
}

const fetchDepartments = async () => {
  try {
    const api = useStrapiApi()
    const res = await api.get('/departments')
    departments.value = res.data.data.map((d: any) => ({
      id: d.id,
      name: d.name,
    }))
  } catch (e) {
    console.error('Could not fetch departments', e)
  }
}

const onTabChange = (value: string) => {
  if ((value === 'two' || value === 'three' || value === 'four') && !dataLoaded.value) {
    eventsStore.fetchEvent(eventId)
  }
}

onMounted(async () => {
  const eventIdNum = Number(eventId)

  if (eventsStore.newEvent?.id === eventIdNum) {
    eventsStore.event = eventsStore.newEvent
    eventsStore.clearNewEvent()
  } else {
    await eventsStore.fetchEvent(eventId)
  }

  dataLoaded.value = true

  await fetchAvailableJudges()
  await fetchJudgeRole()
  await fetchDepartments()
})

const totalSegmentWeight = computed(() =>
  (event.value.segments || []).reduce((sum: number, s: SegmentData) => sum + s.weight * 100, 0)
)

const calculateTotalCategoryWeight = (segment: SegmentData) => {
  return (segment.categories || []).reduce((sum, c) => sum + c.weight * 100, 0)
}

// --- Activation ---
const canActivate = computed(() => {
  const segmentsValid =
    Math.round(totalSegmentWeight.value) === 100 && (event.value.segments || []).length > 0

  const allCategoriesValid =
    (event.value.segments || []).length > 0 &&
    (event.value.segments || []).every((s: SegmentData) => {
      const totalCatWeight = calculateTotalCategoryWeight(s)
      return Math.round(totalCatWeight) === 100 && (s.categories || []).length > 0
    })

  return segmentsValid && allCategoriesValid && event.value.event_status !== 'active'
})

const activateEvent = async () => {
  if (!canActivate.value) return
  try {
    const api = useStrapiApi()
    const res = await api.put(`/events/${event.value.documentId}`, {
      data: { event_status: 'active' },
    })

    if (event.value) {
      event.value.event_status = 'active'
    }

    if (res.status === 200) {
      snackbar.showSnackbar(`${event.value.name} is now active`, 'success')
    }
  } catch (error) {
    snackbar.showSnackbar(`Failed to activate ${event.value.name}`, 'error')
    console.error('Error activating event:', error)
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease-in-out;
}
</style>
