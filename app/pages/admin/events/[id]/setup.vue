<template>
  <div class="mx-auto max-w-7xl px-4 py-6">
    <div class="flex justify-between items-start mb-4 flex-wrap gap-2">
      <header class="flex items-center gap-3 w-full justify-between">
        <UBadge
          :color="statusColor"
          size="lg"
          class="font-bold flex-shrink-0 capitalize"
        >
          {{ displayEvent?.event_status.toUpperCase() }}
        </UBadge>

        <div class="hidden md:flex flex-wrap gap-2 flex-shrink-0">
          <UTooltip text="Refresh Data">
            <UButton
              icon="i-lucide-refresh-cw"
              :loading="eventsStore.isLoading"
              variant="ghost"
              @click="eventsStore.fetchEvent(eventId)"
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

        <div class="md:hidden">
          <UDropdownMenu :items="mobileMenuItems">
            <UButton icon="i-lucide-ellipsis-vertical" variant="ghost" />
          </UDropdownMenu>
        </div>
      </header>

      <NuxtLink
        :to="`/admin/events/${eventId}`"
        class="text-decoration-none hover:underline"
      >
        <div class="flex flex-col gap-1">
          <h1 class="text-xl sm:text-2xl font-bold">
            {{ event?.name }}
          </h1>
          <p class="text-sm sm:text-base text-muted">
            {{ event?.description || 'No description provided.' }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <UCard>
      <UTabs
        v-model="tab"
        :items="tabItems"
        @update:model-value="onTabChange"
      />

      <div class="mt-4">
        <AdminEventSetupInfoTab v-if="tab === 'one'" :event="event" />
        <AdminEventSetupSegmentsTab v-else-if="tab === 'two'" :event="event" />
        <AdminEventSetupJudgesTab
          v-else-if="tab === 'three'"
          :event="event"
          :availableJudges="availableJudges"
          :judgeRoleId="judgeRoleId!"
          @judges-updated="fetchAvailableJudges"
        />
        <AdminEventSetupParticipantsTab
          v-else-if="tab === 'four'"
          :event="event"
          :departments="departments"
        />
      </div>

      <div class="flex justify-end mt-4">
        <UButton
          label="Activate Event"
          :disabled="!canActivate"
          class="m-3"
          @click="activateEvent"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const tab = ref('one')
const route = useRoute()
const eventsStore = useEventsStore()
const { showSnackbar } = useSnackbar()
const dataLoaded = ref(false)
const displayEvent = computed<EventData>(() => eventsStore.event as EventData)
const api = useStrapiApi()
const router = useRouter()
const tabItems = [
  { label: 'Event Info', value: 'one' },
  { label: 'Scoring Segments', value: 'two' },
  { label: 'Judges', value: 'three' },
  { label: 'Participants', value: 'four' },
]

const mobileMenuItems = [
  [
    { label: 'Refresh Data', icon: 'i-lucide-refresh-cw', onSelect: () => { eventsStore.fetchEvent(eventId) } },
    { label: 'Manage Event', icon: 'i-lucide-settings', onSelect: () => { navigateTo(`/admin/events/${eventId}/manage`) } },
    { label: 'Setup Event', icon: 'i-lucide-pencil', onSelect: () => { navigateTo(`/admin/events/${eventId}/setup`) } },
    { label: 'Delete Event', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => { deleteEvent() } },
  ]
]

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
        final_scoring_mode: 'combine_all',
        segments: [],
        judges: [],
        participants: [],
      }
)

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
    case 'draft': return 'neutral'
    case 'active': return 'success'
    case 'inactive': return 'warning'
    case 'finished': return 'info'
    default: return 'neutral'
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

const onTabChange = (value: string | number) => {
  const strValue = String(value)
  if ((strValue === 'two' || strValue === 'three' || strValue === 'four') && !dataLoaded.value) {
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

const validateSegmentCategoriesForActivation = (segment: SegmentData): boolean => {
  if (!segment.categories || segment.categories.length === 0) {
    return false
  }

  const totalCategoryWeight = segment.categories.reduce((sum, c) => sum + (c.weight || 0) * 100, 0)

  if (segment.scoring_mode === 'normalized') {
    return Math.round(totalCategoryWeight) === 100
  } else if (segment.scoring_mode === 'raw_category') {
    return Math.round(totalCategoryWeight) === Math.round((segment.weight || 0) * 100)
  } else if (segment.scoring_mode === 'ranking') {
    return true
  }
  return false
}

const canActivate = computed(() => {
  const segments = event.value.segments || []

  if (segments.length === 0) {
    return false
  }

  const finalScoringMode = event.value.final_scoring_mode || 'combine_all'
  if (finalScoringMode === 'combine_all') {
    const segmentsValid = Math.round(totalSegmentWeight.value) === 100
    if (!segmentsValid) {
      return false
    }
  }

  const allCategoriesValid = segments.every((s: SegmentData) => {
    return validateSegmentCategoriesForActivation(s)
  })

  if (!allCategoriesValid) {
    return false
  }

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
      showSnackbar(`${event.value.name} is now active`, 'success')
    }
    await eventsStore.fetchEvent(eventId)
  } catch (error) {
    showSnackbar(`Failed to activate ${event.value.name}`, 'error')
    console.error('Error activating event:', error)
  }
}
</script>
