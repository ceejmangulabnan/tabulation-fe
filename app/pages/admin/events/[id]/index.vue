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
      <!-- Participants -->
      <v-col
        md="12"
        cols="12"
        class="d-flex"
      >
        <v-card class="w-100 me-1 px-4 py-2">
          <v-card-title>Participants ({{ event?.participants?.length || 0 }})</v-card-title>
          <v-text-field
            v-model="participantSearch"
            label="Search Participants"
            variant="filled"
            hide-details
            class="mb-4"
          ></v-text-field>

          <v-tabs
            v-model="activeTab"
            class="mt-4"
          >
            <v-tab value="male">Male ({{ maleParticipants.length }})</v-tab>
            <v-tab value="female">Female ({{ femaleParticipants.length }})</v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <v-window-item value="male">
              <v-data-table
                :headers="participantHeaders"
                :items="maleParticipants"
                class="flex-grow-1"
                density="compact"
                :hide-default-footer="hideFooterOnSmallScreens"
              >
                <template #item.name="{ item }">
                  <div class="d-flex align-center py-2">
                    <v-avatar
                      v-if="item.headshot?.formats?.thumbnail?.url"
                      :image="getStrapiUrl(item.headshot.formats.thumbnail.url)"
                      icon="mdi-account"
                      class="mr-3"
                      size="40"
                    />

                    <v-avatar
                      v-else
                      icon="mdi-account"
                      class="mr-3"
                      size="40"
                    />

                    <div class="font-weight-bold">{{ item.name }}</div>
                  </div>
                </template>

                <template #no-data>
                  <div class="text-center pa-4 text-grey-darken-1">
                    No male participants registered.
                  </div>
                </template>
              </v-data-table>
            </v-window-item>
            <v-window-item value="female">
              <v-data-table
                :headers="participantHeaders"
                :items="femaleParticipants"
                class="flex-grow-1"
                density="compact"
                :hide-default-footer="hideFooterOnSmallScreens"
              >
                <template #item.name="{ item }">
                  <div class="d-flex align-center py-2">
                    <v-avatar
                      v-if="item.headshot?.formats?.thumbnail?.url"
                      :image="getStrapiUrl(item.headshot.formats.thumbnail.url)"
                      icon="mdi-account"
                      class="mr-3"
                      size="40"
                    />

                    <v-avatar
                      v-else
                      icon="mdi-account"
                      class="mr-3"
                      size="40"
                    />
                    <div class="font-weight-bold">{{ item.name }}</div>
                  </div>
                </template>

                <template #no-data>
                  <div class="text-center pa-4 text-grey-darken-1">
                    No female participants registered.
                  </div>
                </template>
              </v-data-table>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Judges -->
      <v-col
        md="6"
        cols="12"
      >
        <v-card class="d-flex flex-column w-100 me-1 pa-2">
          <v-card-title>Assigned Judges ({{ event?.judges?.length || 0 }})</v-card-title>
          <v-list lines="two">
            <v-list-item
              v-if="!event?.judges?.length"
              class="text-grey-darken-1"
            >
              No judges assigned.
            </v-list-item>
            <v-list-item
              v-for="judge in event?.judges"
              :key="judge.id"
              :title="judge.name"
              :subtitle="judge.users_permissions_user?.email"
            >
              <template #prepend>
                <v-avatar icon="mdi-account-tie"></v-avatar>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <!-- Segment Status -->
      <v-col
        md="6"
        cols="12"
      >
        <v-card class="d-flex flex-column w-100 me-1 pa-2">
          <v-card-title>
            Segment & Scoring Overview ({{ event?.segments?.length || 0 }})
          </v-card-title>
          <v-card-text>
            <div v-if="!event?.segments || event.segments.length === 0">
              No segments defined for this event.
            </div>
            <v-list v-else>
              <v-list-item
                v-for="segment in event?.segments"
                :key="segment.id"
                class="mb-3"
              >
                <v-list-item-title class="font-weight-bold d-flex align-center">
                  <v-chip
                    :color="getSegmentStatusColor(segment.segment_status)"
                    size="small"
                    class="mr-1 text-capitalize"
                  >
                    {{ segment.segment_status }}
                  </v-chip>
                  {{ segment.name }} (Weight: {{ segment.weight * 100 }}%)
                </v-list-item-title>
                <v-list
                  density="compact"
                  class="bg-transparent"
                >
                  <v-list-item
                    v-for="category in segment.categories"
                    :key="category.id"
                  >
                    <v-list-item-title>{{ category.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <!--
                        NOTE: The scoring progress is based on an assumed data structure where `event.scores`
                        is an array of score objects. Each score is expected to have a
                        `judge_id` and a `category_id`.
                      -->
                      Scoring Progress:
                      {{ getScoringProgress(category, event?.judges || [], event?.scores || []) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="!segment.categories || segment.categories.length === 0">
                    <v-list-item-title class="text-grey">
                      No categories in this segment.
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-list-item>
            </v-list>
            <p class="font-weight-bold text-right mt-6">
              Total Segment Weight: {{ totalSegmentWeight }}%
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Judge Requests -->
      <v-col
        class="d-flex"
        cols="12"
      >
        <div class="w-100">
          <AdminEventRequestTable />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const eventsStore = useEventsStore()
const router = useRouter()
const api = useStrapiApi()
const snackbar = useSnackbar()

const { smAndDown } = useDisplay()
const hideFooterOnSmallScreens = computed(() => smAndDown.value)

const eventId = route.params.id as string
const event = computed(() => eventsStore.event)

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

onMounted(async () => {
  await eventsStore.fetchEvent(eventId)
  console.log('Event:', event.value)
})

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

function getSegmentStatusColor(status: 'draft' | 'inactive' | 'active' | 'closed') {
  switch (status) {
    case 'draft':
      return 'grey'
    case 'inactive':
      return 'orange'
    case 'active':
      return 'green'
    case 'closed':
      return 'blue'
    default:
      return 'grey'
  }
}

const totalSegmentWeight = computed(() =>
  (event.value?.segments || []).reduce((sum: number, s: SegmentData) => sum + s.weight * 100, 0)
)

function getScoringProgress(category: CategoryData, judges: JudgeData[], eventScores: ScoreData[]) {
  if (!judges || judges.length === 0) return 'No judges assigned'

  // Filter scores for the current category
  const categoryScores = (eventScores || []).filter((s) => s.category?.id === category.id)

  const assignedJudgeIds = new Set(judges.map((j) => j.id))
  const judgesWhoScored = new Set(
    categoryScores.map((s: ScoreData) => s.judge?.id).filter((id) => id)
  )

  const scoredCount = [...judgesWhoScored].filter((id) => assignedJudgeIds.has(id)).length

  return `${scoredCount} of ${judges.length} judges have scored.`
}

// Participants Table
const activeTab = ref('male')
const participantSearch = ref('')
const participantHeaders = [
  { title: 'No.', value: 'number', sortable: true, width: '10' },
  { title: 'Name', value: 'name', sortable: true },
  { title: 'Department', value: 'department.name', sortable: true },
  { title: 'Notes', value: 'notes', sortable: false },
]

const filteredParticipants = computed(() => {
  if (!event.value?.participants) return []

  let participants = event.value.participants

  if (participantSearch.value) {
    participants = participants.filter((p: ParticipantData) => {
      const searchTerm = participantSearch.value.toLowerCase()
      const searchableContent = [p.name, p.number, p.notes].join(' ').toLowerCase()
      return searchableContent.includes(searchTerm)
    })
  }

  return [...participants].sort((a, b) => a.number - b.number)
})

const maleParticipants = computed(() => {
  return filteredParticipants.value.filter((p: ParticipantData) => p.gender === 'male')
})

const femaleParticipants = computed(() => {
  return filteredParticipants.value.filter((p: ParticipantData) => p.gender === 'female')
})
</script>
