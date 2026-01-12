<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4 flex-wrap">
          <h1 class="text-h4 mb-2 mb-sm-0">Event Dashboard: {{ event?.name }}</h1>
          <div class="d-flex flex-wrap ga-2">
            <NuxtLink
              :to="`/admin/events/${eventId}/manage`"
              class="mr-2"
            >
              <v-btn color="blue">Manage Event</v-btn>
            </NuxtLink>
            <NuxtLink :to="`/admin/events/${eventId}/setup`">
              <v-btn color="green">Setup Event</v-btn>
            </NuxtLink>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Event Info & Status -->
      <v-col
        md="6"
        cols="12"
        class="d-flex"
      >
        <v-card class="d-flex flex-column w-100 me-1 pa-2">
          <v-card-title>Event Information</v-card-title>
          <v-card-text>
            <p>
              <strong class="me-2">Status:</strong>
              <v-chip
                :color="statusColor"
                size="small"
                class="font-weight-bold"
              >
                {{ event?.event_status.toUpperCase() }}
              </v-chip>
            </p>
            <p class="mt-2">
              <strong>Description:</strong>
              {{ event?.description || 'No description provided.' }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Judges -->
      <v-col
        md="6"
        cols="12"
        class="d-flex"
      >
        <v-card class="d-flex flex-column w-100 me-1 pa-2">
          <v-card-title>Assigned Judges ({{ event?.judges?.length || 0 }})</v-card-title>
          <v-list lines="one">
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
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Segment Status -->
      <v-col
        md="6"
        cols="12"
        class="d-flex"
      >
        <v-card class="d-flex flex-column w-100 me-1 pa-2">
          <v-card-title>
            Segment & Scoring Overview ({{ event?.segments?.length || 0 }})
          </v-card-title>
          <v-card-text>
            <div v-if="!event?.segments || event.segments.length === 0">
              No segments defined for this event.
            </div>
            <div
              v-for="segment in event?.segments"
              :key="segment.id"
              class="mb-3"
            >
              <h4 class="font-weight-bold">
                {{ segment.name }} (Weight: {{ segment.weight * 100 }}%)
              </h4>
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
            </div>
            <p class="font-weight-bold text-right">
              Total Segment Weight: {{ totalSegmentWeight }}%
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Participants -->
      <v-col
        md="6"
        cols="12"
        class="d-flex"
      >
        <v-card class="w-100 me-1 pa-2">
          <v-card-title>Participants ({{ event?.participants?.length || 0 }})</v-card-title>
          <v-text-field
            v-model="participantSearch"
            label="Search Participants"
            variant="filled"
            hide-details
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
              >
                <template #item.name="{ item }">
                  <div class="d-flex align-center py-2">
                    <v-avatar
                      :image="item.headshot?.formats.thumbnail.url"
                      icon="mdi-account"
                      class="mr-3"
                      size="40"
                    ></v-avatar>
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
              >
                <template #item.name="{ item }">
                  <div class="d-flex align-center py-2">
                    <v-avatar
                      :image="item.headshot?.formats.thumbnail.url"
                      icon="mdi-account"
                      class="mr-3"
                      size="40"
                    ></v-avatar>
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

const eventId = route.params.id as string
const event = computed(() => eventsStore.event)

onMounted(async () => {
  await eventsStore.fetchEvent(eventId)
  console.log('Event:', event.value)
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

const totalSegmentWeight = computed(() =>
  (event.value?.segments || []).reduce((sum: number, s: SegmentData) => sum + s.weight * 100, 0)
)

function getScoringProgress(category: CategoryData, judges: JudgeData[], eventScores: ScoreData[]) {
  if (!judges || judges.length === 0) return 'No judges assigned'

  // Filter scores for the current category
  const categoryScores = (eventScores || []).filter((s) => s.category?.id === category.id)

  const assignedJudgeIds = new Set(judges.map((j) => j.id))
  const judgesWhoScored = new Set(categoryScores.map((s: any) => s.judge?.id).filter((id) => id))

  const scoredCount = [...judgesWhoScored].filter((id) => assignedJudgeIds.has(id)).length

  return `${scoredCount} of ${judges.length} judges have scored.`
}

// Participants Table
const participantSearch = ref('')
const activeTab = ref('male')
const participantHeaders = [
  { title: 'No.', value: 'number', sortable: true, width: '10' },
  { title: 'Name', value: 'name', sortable: true },
  { title: 'Notes', value: 'notes', sortable: false },
]

const filteredParticipants = computed(() => {
  if (!event.value?.participants) return []

  let participants = event.value.participants

  if (participantSearch.value) {
    participants = participants.filter((p) => {
      const searchTerm = participantSearch.value.toLowerCase()
      const searchableContent = [p.name, p.number, p.notes].join(' ').toLowerCase()
      return searchableContent.includes(searchTerm)
    })
  }

  return [...participants].sort((a, b) => a.number - b.number)
})

const maleParticipants = computed(() => {
  return filteredParticipants.value.filter((p) => p.gender === 'male')
})

const femaleParticipants = computed(() => {
  return filteredParticipants.value.filter((p) => p.gender === 'female')
})
</script>
