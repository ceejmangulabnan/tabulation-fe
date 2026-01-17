<template>
  <v-container>
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
              :available-judges="availableJudges"
              :judge-role-id="judgeRoleId!"
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

const availableJudges = ref<JudgeData[]>([])
const judgeRoleId = ref<number | null>(null)
const departments = ref<any[]>([])

const eventId = route.params.id as string

const fetchAvailableJudges = async () => {
  try {
    const api = useStrapiApi()
    const res = await api.get('/judges')
    availableJudges.value = res.data.data
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
