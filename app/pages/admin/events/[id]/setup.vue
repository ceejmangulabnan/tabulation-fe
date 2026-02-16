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
              {{ displayEvent?.event_status.toUpperCase() }}
            </v-chip>
            <div
              v-if="!smAndDown"
              class="d-flex flex-wrap ga-2 flex-shrink-0"
            >
              <v-btn
                :loading="eventsStore.isLoading"
                icon
                color="primary"
                variant="text"
                @click="eventsStore.fetchEvent(eventId)"
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
                  <v-list-item
                    :loading="eventsStore.isLoading"
                    @click="eventsStore.fetchEvent(eventId)"
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
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()
// --- State ---
const tab = ref('one')
const route = useRoute()
const eventsStore = useEventsStore()
const snackbar = useSnackbar()
const dataLoaded = ref(false)
const displayEvent = computed<EventData>(() => eventsStore.event as EventData)
const api = useStrapiApi()
const router = useRouter()

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
const availableJudges = ref<JudgeData[]>([])
const judgeRoleId = ref<number | null>(null)
const departments = ref<any[]>([])

const eventId = route.params.id as string

const fetchAvailableJudges = async () => {
  try {
    const api = useStrapiApi()
    const res = await api.get('/judges')
    const assignedJudgeIds = new Set(event.value.judges?.map((judge) => judge.documentId) || [])
    availableJudges.value = res.data.data
      .filter((judge: JudgeData) => !assignedJudgeIds.has(judge.documentId))
      .sort((a: JudgeData, b: JudgeData) => a.name.localeCompare(b.name))
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

// Helper function to validate categories within a segment based on scoring mode
const validateSegmentCategoriesForActivation = (segment: SegmentData): boolean => {
  if (!segment.categories || segment.categories.length === 0) {
    return false // A segment must have categories to be valid for activation
  }

  const totalCategoryWeight = segment.categories.reduce((sum, c) => sum + (c.weight || 0) * 100, 0)

  if (segment.scoring_mode === 'normalized') {
    return Math.round(totalCategoryWeight) === 100
  } else if (segment.scoring_mode === 'raw_category') {
    return Math.round(totalCategoryWeight) === Math.round((segment.weight || 0) * 100)
  }
  return false // Unknown scoring modes are considered invalid for activation
}

// --- Activation ---
const canActivate = computed(() => {
  const segments = event.value.segments || []

  // 1. Check if there are any segments
  if (segments.length === 0) {
    return false
  }

  // 2. Validate total segment weight
  const segmentsValid = Math.round(totalSegmentWeight.value) === 100
  if (!segmentsValid) {
    return false
  }

  // 3. Validate categories within each segment using the new helper
  const allCategoriesValid = segments.every((s: SegmentData) => {
    return validateSegmentCategoriesForActivation(s)
  })

  if (!allCategoriesValid) {
    return false
  }

  // 4. Ensure event is not already active
  return event.value.event_status !== 'active'
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
    await eventsStore.fetchEvent(eventId)
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
.hover-underline {
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
</style>
